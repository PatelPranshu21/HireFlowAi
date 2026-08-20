import React, { useState } from 'react';
import { NavigationTab, UserProfile } from '../types';
import { 
  Lock, 
  Mail, 
  User as UserIcon, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  X,
  Sparkles
} from 'lucide-react';
import { loginWithGoogle, loginWithLinkedIn } from '../services/authOAuthService';
import { UserService } from '../services/userService';

interface AuthViewProps {
  mode: 'login' | 'signup';
  onNavigate: (tab: NavigationTab) => void;
  onLoginSuccess: (user?: UserProfile, isNewAccount?: boolean) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ mode, onNavigate, onLoginSuccess }) => {
  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  // Signup State
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [signupError, setSignupError] = useState('');
  const [isSignupLoading, setIsSignupLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [oauthStatus, setOauthStatus] = useState<string>('');

  // Extract OAuth error message from URL hash or query if redirected back
  React.useEffect(() => {
    const hash = window.location.hash;
    const search = window.location.search;
    let urlError = '';

    if (hash && hash.includes('error=')) {
      const queryString = hash.split('?')[1] || hash.substring(1);
      const params = new URLSearchParams(queryString);
      urlError = params.get('error') || '';
    } else if (search && search.includes('error=')) {
      const params = new URLSearchParams(search);
      urlError = params.get('error') || '';
    }

    if (urlError) {
      setLoginError(urlError);
      setSignupError(urlError);
    }
  }, []);

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: 'bg-white/10' };
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 25, label: 'Weak', color: 'bg-red-500' };
    if (score === 2) return { score: 50, label: 'Fair', color: 'bg-yellow-500' };
    if (score === 3) return { score: 75, label: 'Good', color: 'bg-blue-500' };
    return { score: 100, label: 'Strong', color: 'bg-green-500' };
  };

  const passwordStrength = getPasswordStrength(signupPassword);

  const handleOAuthGoogle = async () => {
    setOauthStatus('Redirecting to Google OAuth 2.0...');
    await loginWithGoogle(signupEmail || loginEmail, signupName);
  };

  const handleOAuthLinkedIn = async () => {
    setOauthStatus('Redirecting to LinkedIn OAuth 2.0...');
    await loginWithLinkedIn(signupEmail || loginEmail, signupName);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!loginEmail || !loginEmail.includes('@')) {
      setLoginError('Please enter a valid email address.');
      return;
    }
    if (!loginPassword) {
      setLoginError('Please enter your password.');
      return;
    }

    setIsLoginLoading(true);
    try {
      const authRes = await UserService.loginUserApi({
        email: loginEmail,
        password: loginPassword
      });

      setIsLoginLoading(false);

      if (authRes.success && authRes.user) {
        onLoginSuccess(authRes.user.profile, false);
      } else {
        setLoginError(authRes.error || 'Authentication failed. Please check your credentials.');
      }
    } catch (err: any) {
      setIsLoginLoading(false);
      setLoginError('An unexpected error occurred during login.');
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError('');

    if (!signupName.trim()) {
      setSignupError('Please enter your full name.');
      return;
    }
    if (!signupEmail || !signupEmail.includes('@')) {
      setSignupError('Please enter a valid email address.');
      return;
    }
    if (signupPassword.length < 6) {
      setSignupError('Password must be at least 6 characters long.');
      return;
    }
    if (signupPassword !== confirmPassword) {
      setSignupError('Passwords do not match.');
      return;
    }
    if (!termsAccepted) {
      setSignupError('You must agree to the Terms of Service and Privacy Policy.');
      return;
    }

    setIsSignupLoading(true);
    try {
      const regRes = await UserService.registerUserApi({
        name: signupName.trim(),
        email: signupEmail.trim(),
        password: signupPassword
      });

      setIsSignupLoading(false);

      if (regRes.success && regRes.user) {
        onLoginSuccess(regRes.user.profile, true);
        setSignupSuccess(true);
      } else {
        setSignupError(regRes.error || 'Account creation failed.');
      }
    } catch (err: any) {
      setIsSignupLoading(false);
      setSignupError('An unexpected error occurred during registration.');
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail || !forgotEmail.includes('@')) return;
    setForgotSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#F9FAFB] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background Glow Effect */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Brand Header */}
      <div 
        onClick={() => onNavigate('landing')}
        className="flex items-center gap-3 mb-8 cursor-pointer group"
      >
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
          <div className="w-5 h-5 bg-white rotate-45" />
        </div>
        <span className="text-2xl font-bold tracking-tight font-geist text-white">HireFlow AI</span>
      </div>

      {/* Auth Card Container */}
      <div className="w-full max-w-md bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl relative z-10 ai-gradient-border">
        {mode === 'login' ? (
          <div>
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold font-geist text-white">Welcome back</h2>
              <p className="text-sm text-white/50 mt-1">Sign in to manage your career flow and ATS optimization.</p>
            </div>

            {loginError && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            {/* Social OAuth Buttons Above Form */}
            <div className="space-y-3 mb-6">
              <button
                type="button"
                onClick={handleOAuthGoogle}
                className="w-full bg-white/10 hover:bg-white/15 text-white border border-white/15 font-medium py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-3 cursor-pointer text-sm"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.2 9 5 12 5z"/>
                  <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"/>
                  <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 10.8 0 12s.7 2.3 1.9 4.7l3.7-1.9z"/>
                  <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.2-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"/>
                </svg>
                <span>Continue with Google</span>
              </button>
            </div>

            {/* Divider */}
            <div className="relative my-6 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <span className="relative bg-[#0d0e15] px-4 text-xs font-mono font-bold text-white/40 tracking-wider">
                ---------------- OR ----------------
              </span>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-1.5 font-bold">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
                  <input 
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors placeholder-white/30"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-mono uppercase tracking-wider text-white/60 font-bold">Password</label>
                  <button 
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-xs text-blue-400 hover:underline cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
                  <input 
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-10 text-white focus:outline-none focus:border-blue-500 transition-colors placeholder-white/30"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white cursor-pointer"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-white/70">
                  <input 
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-white/20 text-blue-600 focus:ring-0"
                  />
                  Remember me for 30 days
                </label>
              </div>

              <button 
                type="submit"
                disabled={isLoginLoading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
              >
                {isLoginLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                {isLoginLoading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-white/10 text-center">
              <p className="text-xs text-white/50">
                Don't have an account?{' '}
                <button 
                  onClick={() => onNavigate('signup')}
                  className="text-blue-400 font-semibold hover:underline cursor-pointer ml-1"
                >
                  Create one now
                </button>
              </p>
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold font-geist text-white">Create Your Account</h2>
              <p className="text-sm text-white/50 mt-1">Join 2,000+ candidates landing top tech roles.</p>
            </div>

            {signupSuccess ? (
              <div className="p-6 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-green-500/20 border border-green-500/40 text-green-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold font-geist text-white">Account Created Successfully!</h3>
                <p className="text-xs text-white/60 leading-relaxed">
                  Welcome to HireFlow AI, <strong className="text-white">{signupName}</strong>. You can now log in and begin optimizing your resume and tracking applications.
                </p>
                <button 
                  onClick={() => {
                    onNavigate('pricing');
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl transition-all shadow-lg cursor-pointer"
                >
                  Choose Subscription Plan
                </button>
              </div>
            ) : (
              <div>
                {signupError && (
                  <div className="mb-4 p-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 text-xs flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{signupError}</span>
                    </div>
                    {(signupError.toLowerCase().includes('exists') || signupError.toLowerCase().includes('log in')) && (
                      <button
                        type="button"
                        onClick={() => {
                          setLoginEmail(signupEmail);
                          onNavigate('login');
                          setSignupError('');
                        }}
                        className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg text-[11px] font-medium shrink-0 cursor-pointer transition-colors"
                      >
                        Go to Login
                      </button>
                    )}
                  </div>
                )}

                {/* Social OAuth Buttons Above Signup Form */}
                <div className="space-y-3 mb-6">
                  <button
                    type="button"
                    onClick={handleOAuthGoogle}
                    className="w-full bg-white/10 hover:bg-white/15 text-white border border-white/15 font-medium py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-3 cursor-pointer text-sm"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.2 9 5 12 5z"/>
                      <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"/>
                      <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 10.8 0 12s.7 2.3 1.9 4.7l3.7-1.9z"/>
                      <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.2-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"/>
                    </svg>
                    <span>Continue with Google</span>
                  </button>
                </div>

                {/* Divider */}
                <div className="relative my-6 text-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10" />
                  </div>
                  <span className="relative bg-[#0d0e15] px-4 text-xs font-mono font-bold text-white/40 tracking-wider">
                    ---------------- OR ----------------
                  </span>
                </div>

                <form onSubmit={handleSignupSubmit} className="space-y-3.5 text-sm">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-1 font-bold">Full Name</label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
                      <input 
                        type="text"
                        required
                        value={signupName}
                        onChange={(e) => setSignupName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors placeholder-white/30 text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-1 font-bold">Email Address</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
                      <input 
                        type="email"
                        required
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        placeholder="john@example.com"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors placeholder-white/30 text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-1 font-bold">Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
                      <input 
                        type={showSignupPassword ? 'text' : 'password'}
                        required
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        placeholder="Minimum 6 characters"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-10 text-white focus:outline-none focus:border-blue-500 transition-colors placeholder-white/30 text-sm"
                      />
                      <button 
                        type="button"
                        onClick={() => setShowSignupPassword(!showSignupPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white cursor-pointer"
                      >
                        {showSignupPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Password Strength Indicator */}
                    {signupPassword && (
                      <div className="mt-2 space-y-1">
                        <div className="flex justify-between items-center text-[10px] font-mono">
                          <span className="text-white/50">Strength:</span>
                          <span className="font-bold text-white">{passwordStrength.label}</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${passwordStrength.color} transition-all duration-300`} 
                            style={{ width: `${passwordStrength.score}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-1 font-bold">Confirm Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
                      <input 
                        type={showSignupPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors placeholder-white/30 text-sm"
                      />
                    </div>
                  </div>

                  <div className="pt-1">
                    <label className="flex items-start gap-2 cursor-pointer text-xs text-white/70">
                      <input 
                        type="checkbox"
                        checked={termsAccepted}
                        onChange={(e) => setTermsAccepted(e.target.checked)}
                        className="w-4 h-4 rounded border-white/20 text-blue-600 focus:ring-0 mt-0.5"
                      />
                      <span>
                        I agree to the <a href="#terms" className="text-blue-400 hover:underline">Terms of Service</a> and <a href="#privacy" className="text-blue-400 hover:underline">Privacy Policy</a>.
                      </span>
                    </label>
                  </div>

                  <button 
                    type="submit"
                    disabled={isSignupLoading}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
                  >
                    {isSignupLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    {isSignupLoading ? 'Creating Account...' : 'Create Account'}
                  </button>
                </form>

                <div className="mt-5 pt-5 border-t border-white/10 text-center">
                  <p className="text-xs text-white/50">
                    Already have an account?{' '}
                    <button 
                      onClick={() => onNavigate('login')}
                      className="text-blue-400 font-semibold hover:underline cursor-pointer ml-1"
                    >
                      Sign In
                    </button>
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#1d1f29] border border-[#434656]/40 rounded-2xl p-6 max-w-sm w-full space-y-4">
            <div className="flex justify-between items-center border-b border-[#434656]/30 pb-3">
              <h3 className="text-lg font-bold text-white font-geist">Reset Password</h3>
              <button onClick={() => setShowForgotPassword(false)} className="text-white/60 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {forgotSubmitted ? (
              <div className="text-center py-4 space-y-3">
                <CheckCircle2 className="w-10 h-10 text-green-400 mx-auto" />
                <p className="text-sm font-semibold text-white">Reset Link Sent!</p>
                <p className="text-xs text-white/60">
                  We have sent password reset instructions to <span className="text-blue-400">{forgotEmail}</span>.
                </p>
                <button 
                  onClick={() => {
                    setShowForgotPassword(false);
                    setForgotSubmitted(false);
                  }}
                  className="w-full bg-white/10 hover:bg-white/20 text-white text-xs font-mono py-2 rounded-lg cursor-pointer"
                >
                  Return to Login
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-4 text-xs">
                <p className="text-white/60 leading-relaxed">
                  Enter your email address and we'll send you instructions to reset your password.
                </p>
                <div>
                  <label className="block font-mono text-white/60 mb-1">Email Address</label>
                  <input 
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="john@example.com"
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-lg font-mono cursor-pointer"
                >
                  Send Reset Link
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

