import express, { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from './db.js'; // Ensure to use .js extension for ESM imports if needed, but the prompt says to use ESM import syntax.
// Given node 18+, fetch is built-in.

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'hireflow-dev-secret-change-me';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

// export authenticateToken middleware
export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Unauthorized: No token provided' });

  jwt.verify(token, JWT_SECRET, (err, decoded: any) => {
    if (err) return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    req.user = { id: decoded.id, email: decoded.email };
    next();
  });
};

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const client = await pool.connect();
    try {
      const existingUser = await client.query('SELECT id FROM users WHERE email = $1', [email]);
      if (existingUser.rows.length > 0) {
        return res.status(400).json({ error: 'Email already exists' });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const result = await client.query(
        `INSERT INTO users (email, name, password_hash, auth_provider)
         VALUES ($1, $2, $3, 'email') RETURNING *`,
        [email, name, passwordHash]
      );

      const user = result.rows[0];
      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
      
      // Don't send password hash back
      delete user.password_hash;
      res.json({ token, user });
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed', details: error.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM users WHERE email = $1', [email]);
      const user = result.rows[0];

      if (!user || !user.password_hash) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
      
      delete user.password_hash;
      res.json({ token, user });
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed', details: error.message });
  }
});

// GET /api/auth/google/callback
router.get('/google/callback', async (req, res) => {
  try {
    const code = req.query.code as string;
    if (!code) {
      return res.status(400).json({ error: 'No code provided' });
    }

    const redirectUri = \`\${process.env.OAUTH_REDIRECT_BASE || 'http://localhost:3000'}/api/auth/google/callback\`;
    
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID || '',
        client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      })
    });
    
    const tokenData = await tokenResponse.json();
    if (!tokenData.access_token) {
      throw new Error('Failed to obtain access token from Google');
    }

    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: \`Bearer \${tokenData.access_token}\` }
    });
    const userInfo = await userInfoResponse.json();
    
    if (!userInfo.email) {
      throw new Error('No email found from Google');
    }

    const client = await pool.connect();
    try {
      const existingUserResult = await client.query('SELECT * FROM users WHERE google_id = $1 OR email = $2', [userInfo.id, userInfo.email]);
      let user = existingUserResult.rows[0];

      if (user) {
        if (!user.google_id) {
          await client.query('UPDATE users SET google_id = $1 WHERE id = $2', [userInfo.id, user.id]);
        }
        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
        res.redirect(\`/#dashboard?token=\${token}\`);
      } else {
        const newUserResult = await client.query(
          \`INSERT INTO users (email, name, google_id, auth_provider, avatar, onboarding_completed)
           VALUES ($1, $2, $3, 'google', $4, FALSE) RETURNING *\`,
          [userInfo.email, userInfo.name, userInfo.id, userInfo.picture]
        );
        user = newUserResult.rows[0];
        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
        res.redirect(\`/#onboarding?token=\${token}\`);
      }
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Google callback error:', error);
    res.redirect('/#login?error=oauth_failed');
  }
});

// GET /api/auth/linkedin/callback
router.get('/linkedin/callback', async (req, res) => {
  try {
    const code = req.query.code as string;
    if (!code) {
      return res.status(400).json({ error: 'No code provided' });
    }

    const redirectUri = \`\${process.env.OAUTH_REDIRECT_BASE || 'http://localhost:3000'}/api/auth/linkedin/callback\`;
    
    const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.LINKEDIN_CLIENT_ID || '',
        client_secret: process.env.LINKEDIN_CLIENT_SECRET || '',
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      })
    });
    
    const tokenData = await tokenResponse.json();
    if (!tokenData.access_token) {
      throw new Error('Failed to obtain access token from LinkedIn');
    }

    const userInfoResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: { Authorization: \`Bearer \${tokenData.access_token}\` }
    });
    const userInfo = await userInfoResponse.json();
    
    if (!userInfo.email) {
      throw new Error('No email found from LinkedIn');
    }

    const client = await pool.connect();
    try {
      const existingUserResult = await client.query('SELECT * FROM users WHERE linkedin_id = $1 OR email = $2', [userInfo.sub, userInfo.email]);
      let user = existingUserResult.rows[0];

      if (user) {
        if (!user.linkedin_id) {
          await client.query('UPDATE users SET linkedin_id = $1 WHERE id = $2', [userInfo.sub, user.id]);
        }
        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
        if (user.onboarding_completed) {
          res.redirect(\`/#dashboard?token=\${token}\`);
        } else {
          res.redirect(\`/#onboarding?token=\${token}\`);
        }
      } else {
        const newUserResult = await client.query(
          \`INSERT INTO users (email, name, linkedin_id, auth_provider, avatar, onboarding_completed)
           VALUES ($1, $2, $3, 'linkedin', $4, FALSE) RETURNING *\`,
          [userInfo.email, userInfo.name, userInfo.sub, userInfo.picture]
        );
        user = newUserResult.rows[0];
        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
        res.redirect(\`/#onboarding?token=\${token}\`);
      }
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('LinkedIn callback error:', error);
    res.redirect('/#login?error=oauth_failed');
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const client = await pool.connect();
    try {
      const userResult = await client.query('SELECT * FROM users WHERE id = $1', [req.user?.id]);
      const user = userResult.rows[0];
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      delete user.password_hash;

      const onboardingResult = await client.query('SELECT * FROM user_onboarding WHERE user_id = $1', [req.user?.id]);
      const onboarding = onboardingResult.rows[0] || null;

      res.json({ user, onboarding });
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Get me error:', error);
    res.status(500).json({ error: 'Failed to get user data', details: error.message });
  }
});

// POST /api/auth/onboarding
router.post('/onboarding', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    const { 
      skills, technologies, preferred_roles, preferred_companies, 
      preferred_cities, preferred_industries, remote_preference, 
      expected_salary_min, expected_salary_max, target_industry, resume_uploaded,
      name, title, experience_level, phone, target_role // basic user fields that could be updated
    } = req.body;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Upsert onboarding data
      await client.query(
        \`INSERT INTO user_onboarding (
          user_id, skills, technologies, preferred_roles, preferred_companies, 
          preferred_cities, preferred_industries, remote_preference, 
          expected_salary_min, expected_salary_max, target_industry, resume_uploaded
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
        ) ON CONFLICT (user_id) DO UPDATE SET 
          skills = EXCLUDED.skills,
          technologies = EXCLUDED.technologies,
          preferred_roles = EXCLUDED.preferred_roles,
          preferred_companies = EXCLUDED.preferred_companies,
          preferred_cities = EXCLUDED.preferred_cities,
          preferred_industries = EXCLUDED.preferred_industries,
          remote_preference = EXCLUDED.remote_preference,
          expected_salary_min = EXCLUDED.expected_salary_min,
          expected_salary_max = EXCLUDED.expected_salary_max,
          target_industry = EXCLUDED.target_industry,
          resume_uploaded = EXCLUDED.resume_uploaded,
          updated_at = NOW()\`,
        [
          userId, skills || '{}', technologies || '{}', preferred_roles || '{}', preferred_companies || '{}',
          preferred_cities || '{}', preferred_industries || '{}', remote_preference || 'Remote',
          expected_salary_min || 0, expected_salary_max || 0, target_industry, resume_uploaded || false
        ]
      );

      // Update user basic profile
      let userUpdateQuery = 'UPDATE users SET onboarding_completed = TRUE, updated_at = NOW()';
      const userUpdateValues: any[] = [userId];
      let paramCount = 2;

      if (name) { userUpdateQuery += \`, name = $\${paramCount++}\`; userUpdateValues.push(name); }
      if (title) { userUpdateQuery += \`, title = $\${paramCount++}\`; userUpdateValues.push(title); }
      if (experience_level) { userUpdateQuery += \`, experience_level = $\${paramCount++}\`; userUpdateValues.push(experience_level); }
      if (phone) { userUpdateQuery += \`, phone = $\${paramCount++}\`; userUpdateValues.push(phone); }
      if (target_role) { userUpdateQuery += \`, target_role = $\${paramCount++}\`; userUpdateValues.push(target_role); }

      userUpdateQuery += \` WHERE id = $1\`;
      
      await client.query(userUpdateQuery, userUpdateValues);

      await client.query('COMMIT');
      res.json({ success: true });
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Onboarding error:', error);
    res.status(500).json({ error: 'Failed to update onboarding data', details: error.message });
  }
});

// PUT /api/auth/profile
router.put('/profile', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    const updates = req.body;
    
    // Whitelist allowed fields to update
    const allowedFields = [
      'name', 'title', 'experience_level', 'phone', 'target_role',
      'avatar', 'has_selected_plan', 'subscription_status', 'subscription_plan', 'tier'
    ];
    
    const client = await pool.connect();
    try {
      const updateParts = [];
      const values = [userId];
      let paramCount = 2;

      for (const [key, value] of Object.entries(updates)) {
        if (allowedFields.includes(key)) {
          updateParts.push(\`\${key} = $\${paramCount}\`);
          values.push(value);
          paramCount++;
        }
      }

      if (updateParts.length === 0) {
        return res.status(400).json({ error: 'No valid fields to update' });
      }

      const query = \`UPDATE users SET \${updateParts.join(', ')}, updated_at = NOW() WHERE id = $1 RETURNING *\`;
      const result = await client.query(query, values);
      
      const user = result.rows[0];
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      delete user.password_hash;
      res.json(user);
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile', details: error.message });
  }
});

export default router;
