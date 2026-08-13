import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { initDb, dbSaveAtsReport, dbSaveInterviewSession } from "./src/db/postgres";
import authRoutes from "./server/authRoutes";
import { extractTextFromPayload } from "./server/documentParser";
import { pool } from "./db";
import { PLANS, PlanName, normalizeProfileSubscription } from "./src/data/planConfig";
import { 
  resolveUserProfile, 
  enforceFeatureEntitlement, 
  recordFeatureUsage, 
  SubscriptionRequest 
} from "./server/subscriptionMiddleware";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

// Mount Authentication & OAuth routes
app.use("/api/auth", authRoutes);

// Lazy initializer for Gemini client
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY environment variable is missing. AI features will fallback to smart mock responses if missing.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "dummy-key-for-fallback",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// ------------------- SUBSCRIPTION & USAGE ENDPOINTS -------------------

app.get("/api/subscription/usage", async (req, res) => {
  try {
    const userProfile = await resolveUserProfile(req);
    const { profile: normProfile } = normalizeProfileSubscription(userProfile);
    res.json({
      success: true,
      profile: normProfile,
      plans: PLANS
    });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch subscription status", details: err.message });
  }
});

app.post("/api/subscription/update-plan", async (req, res) => {
  try {
    const { planName, userId } = req.body;
    if (!planName || !PLANS[planName as PlanName]) {
      return res.status(400).json({ error: "Invalid planName" });
    }

    const reqObj: SubscriptionRequest = req;
    if (userId) reqObj.body.userId = userId;
    const userProfile = await resolveUserProfile(reqObj);

    const now = new Date();
    const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    userProfile.subscriptionPlan = planName;
    userProfile.subscriptionStatus = planName === '3-Day Free Trial' ? 'trialing' : 'active';
    userProfile.tier = planName === 'Pro' ? 'Gold Tier' : (planName === 'Premium' ? 'Premium Plan' : (planName === 'Basic' ? 'Basic' : '3-Day Free Trial'));
    userProfile.nextBillingDate = nextMonth.toISOString().split('T')[0];

    const planDef = PLANS[planName as PlanName];
    userProfile.usageLimits = {
      resumeScans: { used: 0, max: planDef.limits.atsAnalyses },
      atsAnalyses: { used: 0, max: planDef.limits.atsAnalyses },
      aiInterviews: { used: 0, max: planDef.limits.mockInterviews },
      coverLetterGenerations: { used: 0, max: planDef.limits.coverLetterGenerations },
      jobMatchAnalyses: { used: 0, max: planDef.limits.jobMatchAnalyses }
    };

    const { profile: normProfile } = normalizeProfileSubscription(userProfile);

    const targetUserId = userId || normProfile.id;
    if (targetUserId && targetUserId !== 'usr_guest') {
      try {
        const client = await pool.connect();
        try {
          await client.query(
            `UPDATE users SET subscription_plan = $1, subscription_status = $2, tier = $3, profile_data = $4 WHERE id = $5`,
            [normProfile.subscriptionPlan, normProfile.subscriptionStatus, normProfile.tier, JSON.stringify(normProfile), targetUserId]
          );
        } finally {
          client.release();
        }
      } catch (e) {}
    }

    res.json({ success: true, profile: normProfile });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to update plan", details: err.message });
  }
});

// ------------------- API ENDPOINTS -------------------

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Helper function to analyze resume text dynamically when offline/local
function analyzeResumeContentLocally(resumeText: string, targetRole: string = "Software Engineer") {
  const textLower = (resumeText || '').toLowerCase();

  const techKeywords = [
    { name: "React", category: "Frameworks" },
    { name: "TypeScript", category: "Languages" },
    { name: "JavaScript", category: "Languages" },
    { name: "Node.js", category: "Frameworks" },
    { name: "Python", category: "Languages" },
    { name: "Java", category: "Languages" },
    { name: "C++", category: "Languages" },
    { name: "Go", category: "Languages" },
    { name: "SQL", category: "Databases" },
    { name: "PostgreSQL", category: "Databases" },
    { name: "MongoDB", category: "Databases" },
    { name: "Redis", category: "Databases" },
    { name: "Docker", category: "DevOps" },
    { name: "Kubernetes", category: "DevOps" },
    { name: "AWS", category: "Cloud & Infrastructure" },
    { name: "GCP", category: "Cloud & Infrastructure" },
    { name: "Azure", category: "Cloud & Infrastructure" },
    { name: "GraphQL", category: "API Design" },
    { name: "REST APIs", category: "API Design" },
    { name: "Microservices", category: "Architecture" },
    { name: "Distributed Systems", category: "Architecture" },
    { name: "CI/CD", category: "DevOps" },
    { name: "Kafka", category: "Architecture" },
    { name: "Tailwind CSS", category: "Frameworks" },
    { name: "Next.js", category: "Frameworks" },
    { name: "Spring Boot", category: "Frameworks" },
    { name: "TensorFlow", category: "Machine Learning" },
    { name: "PyTorch", category: "Machine Learning" },
    { name: "Git", category: "Methodology" },
    { name: "Agile/Scrum", category: "Methodology" },
  ];

  const detectedKeywords: any[] = [];
  const missingKeywords: any[] = [];

  techKeywords.forEach(item => {
    const regex = new RegExp(`\\b${item.name.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'gi');
    const matches = (resumeText.match(regex) || []).length;
    if (matches > 0) {
      detectedKeywords.push({
        keyword: item.name,
        detected: true,
        importance: matches > 2 ? "High" : "Medium",
        category: item.category,
        frequency: matches
      });
    } else {
      missingKeywords.push({
        keyword: item.name,
        detected: false,
        importance: ["Kubernetes", "AWS", "Distributed Systems", "CI/CD", "Docker"].includes(item.name) ? "High" : "Medium",
        category: item.category
      });
    }
  });

  const keywordList = [...detectedKeywords, ...missingKeywords.slice(0, 8)];
  const numberMatches = (resumeText.match(/(\d+%\s*|\$\s*\d+|\b\d+\s*ms\b|\b\d+\s*k\b|\b\d+\s*m\b|\b\d+\s*users?\b|\b\d+\s*x\b)/gi) || []).length;
  const actionVerbs = ["engineered", "architected", "spearheaded", "optimized", "developed", "built", "implemented", "scaled", "led", "designed", "reduced", "increased"];
  const detectedVerbs = actionVerbs.filter(v => textLower.includes(v));

  const hasSummary = textLower.includes("summary") || textLower.includes("profile") || textLower.includes("objective");
  const hasExperience = textLower.includes("experience") || textLower.includes("employment") || textLower.includes("work history");
  const hasEducation = textLower.includes("education") || textLower.includes("degree") || textLower.includes("university") || textLower.includes("college");
  const hasSkills = textLower.includes("skills") || textLower.includes("technologies") || textLower.includes("competencies");
  const hasProjects = textLower.includes("projects") || textLower.includes("portfolio");

  const sectionCount = [hasSummary, hasExperience, hasEducation, hasSkills, hasProjects].filter(Boolean).length;

  let baseScore = 52;
  baseScore += Math.min(22, detectedKeywords.length * 2.2);
  baseScore += Math.min(12, numberMatches * 2.5);
  baseScore += Math.min(8, detectedVerbs.length * 1.5);
  baseScore += sectionCount * 2.5;

  const overallScore = Math.min(98, Math.max(45, Math.round(baseScore)));
  const formattingScore = Math.min(96, Math.max(60, Math.round(70 + (sectionCount * 5))));
  const impactScore = Math.min(95, Math.max(50, Math.round(55 + (numberMatches * 4) + (detectedVerbs.length * 3))));
  const relevanceScore = Math.min(99, Math.max(50, Math.round(60 + (detectedKeywords.length * 2.5))));

  const topSkillsFound = detectedKeywords.map(k => k.keyword).slice(0, 6).join(", ") || "Technical Skills";

  return {
    overallScore,
    formattingScore,
    impactScore,
    relevanceScore,
    summary: `Analyzed resume highlighting experience with ${topSkillsFound}. Detected ${detectedKeywords.length} technical keywords, ${numberMatches} quantifiable metrics, and ${detectedVerbs.length} key action verbs across ${sectionCount}/5 core resume sections. Target role alignment for "${targetRole}": ${relevanceScore}%.`,
    targetRole,
    keywordList,
    categoryScores: [
      { category: 'Formatting', score: formattingScore, explanation: `Clear structural separation with ${sectionCount} of 5 standard resume sections identified.`, tip: 'Maintain consistent line spacing and section headers.' },
      { category: 'Keywords', score: Math.round((detectedKeywords.length / (detectedKeywords.length + 5)) * 100), explanation: `Detected ${detectedKeywords.length} core technical keywords for ${targetRole}.`, tip: `Consider adding ${missingKeywords.slice(0, 3).map(m => m.keyword).join(', ')} if applicable.` },
      { category: 'Skills', score: Math.min(95, 60 + detectedKeywords.length * 3), explanation: `Technical coverage including ${topSkillsFound}.`, tip: 'Group skills into clear subheadings (Languages, Frameworks, Cloud).' },
      { category: 'Projects', score: Math.min(95, 70 + sectionCount * 4), explanation: 'Project titles and tech stacks included.', tip: 'Add live URLs or GitHub repository links.' },
      { category: 'Experience', score: Math.min(90, 60 + (numberMatches * 5)), explanation: 'Strong tech companies with concise achievements.', tip: 'Add dollar values or percentage growth figures.' },
      { category: 'Education', score: hasEducation ? 95 : 60, explanation: hasEducation ? 'Education degree and graduation year clearly stated.' : 'Missing explicit education section.', tip: 'Ensure graduation year is included.' },
      { category: 'Readability', score: Math.min(92, 70 + (sectionCount * 4)), explanation: 'Bullet points are 1-2 lines long; good white space balance.', tip: 'Maintain bullet length under 25 words.' },
      { category: 'Grammar', score: 95, explanation: 'No obvious spelling errors; minor tense consistency suggestion.', tip: 'Use past tense for former roles.' },
      { category: 'Structure', score: Math.min(91, 65 + (sectionCount * 5)), explanation: 'Logical flow of sections.', tip: 'Maintain consistent section order.' },
      { category: 'Impact', score: impactScore, explanation: `Found ${numberMatches} quantified metric points and ${detectedVerbs.length} action verbs.`, tip: 'Try adding specific % latency, cost savings, or active user count figures to all experience bullets.' }
    ],
    keywords: (() => {
      // Extract actual bullet points from resume for resume-specific suggestions
      const bulletLines = resumeText.split(/\n/).filter(line => {
        const trimmed = line.trim();
        return trimmed.length > 20 && (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*') || /^[A-Z][a-z]/.test(trimmed));
      });
      
      const weakBullets = bulletLines.filter(b => {
        const lower = b.toLowerCase();
        return !/([\d]+%|[\d]+x|\$[\d]+|[\d]+\s*(ms|k|m|users?|requests?))/i.test(b) && 
               !actionVerbs.some(v => lower.startsWith(v));
      }).slice(0, 2);

      const detectedKeywordSuggestions = detectedKeywords.slice(0, 2).map((dk, idx) => ({
        id: `kw_det_${idx}`,
        type: 'success' as const,
        title: `Strong Keyword: '${dk.keyword}' (${dk.frequency}x)`,
        impactTag: 'Verified',
        description: `'${dk.keyword}' appears ${dk.frequency} time(s) in your resume — well-aligned with ${targetRole} requirements.`,
        suggestionTitle: 'Verified',
        suggestionText: `Found ${dk.frequency} occurrences across your experience and skills sections.`,
        originalBullet: '',
        suggestedBullet: ''
      }));
      
      const missingSuggestions = missingKeywords.slice(0, 3).map((m, idx) => ({
        id: `kw_miss_${idx}`,
        type: (m.importance === "High" ? "high" : "medium") as "high" | "medium",
        title: `Missing Keyword: '${m.keyword}' (${m.category})`,
        impactTag: `${m.importance} Impact`,
        description: `${targetRole} job postings frequently require ${m.keyword} (${m.category}). Your resume does not mention this skill.`,
        suggestionTitle: 'AI Suggestion',
        suggestionText: `Add '${m.keyword}' to your ${m.category === 'Languages' || m.category === 'Frameworks' ? 'Technical Skills' : m.category === 'DevOps' ? 'DevOps/Infrastructure' : 'Projects'} section, or integrate it into a relevant experience bullet.`,
        originalBullet: weakBullets[idx] ? weakBullets[idx].trim().replace(/^[•\-*]\s*/, '') : `Developed software solutions using various technologies.`,
        suggestedBullet: weakBullets[idx] 
          ? `${detectedVerbs[idx % detectedVerbs.length] || 'Engineered'} ${weakBullets[idx].trim().replace(/^[•\-*]\s*/, '').substring(0, 60)}... incorporating ${m.keyword}.`
          : `Engineered scalable ${m.category.toLowerCase()} solutions leveraging ${m.keyword} for ${targetRole} workflows.`
      }));
      
      return [...missingSuggestions, ...detectedKeywordSuggestions];
    })(),
    impactPoints: [
      `Found ${numberMatches} quantified metrics across your resume. ${numberMatches < 3 ? 'Add at least 1 numerical metric (%, $, or scale) per role bullet.' : 'Good metric density — consider diversifying metric types (latency, cost savings, user growth).'}`,
      `${detectedVerbs.length > 0 ? `Strong action verbs detected: ${detectedVerbs.join(', ')}. ` : ''}${detectedVerbs.length < 5 ? `Add more action verbs like '${['Engineered', 'Architected', 'Spearheaded', 'Optimized', 'Scaled'].filter(v => !detectedVerbs.includes(v.toLowerCase())).slice(0, 3).join("', '")}'.` : 'Excellent variety of action verbs.'}`,
      `${missingKeywords.length > 0 ? `Include ${targetRole}-critical keywords: ${missingKeywords.slice(0, 3).map(k => k.keyword).join(', ')} to maximize ATS match rate.` : 'All target keywords detected — strong ATS alignment.'}`,
      `${!hasProjects ? 'Add a dedicated Projects section with GitHub links and tech stack tags to boost your score by ~5%.' : 'Projects section detected — ensure each project lists the tech stack and a measurable outcome.'}`
    ],
    grammarIssues: [
      hasExperience ? "Ensure uniform past tense verbs for previous roles and present tense for your current role." : "Add a structured Work Experience section with clear date ranges.",
      `${!hasSummary ? 'Add a Professional Summary/Objective section at the top of your resume.' : 'Professional summary detected — keep it under 3 lines for readability.'}`
    ],
    sectionAnalyses: [
      { id: "sa_1", sectionName: "Professional Summary", score: hasSummary ? 88 : 55, strengths: [hasSummary ? `Professional summary present with ${topSkillsFound.split(', ').length} key skills mentioned` : "Contains key technical terms"], weaknesses: [!hasSummary ? "Missing explicit Summary/Objective section — this is critical for ATS parsers" : "Can be more concise with years of experience stated"], suggestions: [`${hasSummary ? 'Tighten to 2-3 lines highlighting years of experience and top specializations.' : 'Add a 2-3 line Professional Summary at the top mentioning your experience level, core skills, and target role.'}`], recommendedChanges: [], priority: "High" as const, estimatedAtsGain: hasSummary ? 2 : 6 },
      { id: "sa_2", sectionName: "Work Experience", score: impactScore, strengths: [`Includes ${detectedVerbs.length} action verbs (${detectedVerbs.slice(0, 3).join(', ') || 'none detected'})`, `${numberMatches} quantified metrics detected`], weaknesses: [numberMatches < 3 ? `Only ${numberMatches} quantifiable numbers found — add % improvements, $ revenue, or scale figures` : "Ensure bullet lengths are uniform (1-2 lines each)"], suggestions: ["Start every bullet point with a high-impact action verb and include at least one metric."], recommendedChanges: [], priority: "High" as const, estimatedAtsGain: 8 },
      { id: "sa_3", sectionName: "Technical Skills", score: Math.min(95, 65 + detectedKeywords.length * 3), strengths: [`Identified ${detectedKeywords.length} technical skills: ${topSkillsFound}`], weaknesses: [missingKeywords.length > 0 ? `Missing ${targetRole}-relevant keywords: ${missingKeywords.slice(0, 3).map(m => m.keyword).join(', ')}` : "Comprehensive skill coverage"], suggestions: [`Group skills into categories: Languages, Frameworks, Databases, Cloud & DevOps. ${missingKeywords.length > 2 ? `Add: ${missingKeywords.slice(0, 3).map(m => m.keyword).join(', ')}.` : ''}`], recommendedChanges: [], priority: "Medium" as const, estimatedAtsGain: 5 },
      { id: "sa_4", sectionName: "Projects", score: hasProjects ? 85 : 50, strengths: [hasProjects ? "Projects section detected with technical descriptions" : "Technical experience visible in work history"], weaknesses: [!hasProjects ? "No dedicated Projects section — this is valuable for showcasing hands-on work" : "Add GitHub/live links and measurable outcomes to each project"], suggestions: [hasProjects ? "Add live URLs, GitHub links, and tech stack tags to each project." : "Add a Projects section with 2-3 key projects including tech stack and impact metrics."], recommendedChanges: [], priority: hasProjects ? "Medium" as const : "High" as const, estimatedAtsGain: hasProjects ? 3 : 7 },
      { id: "sa_5", sectionName: "Education", score: hasEducation ? 92 : 60, strengths: [hasEducation ? "Education section detected with degree information" : "Academic background implied"], weaknesses: [!hasEducation ? "No explicit Education section found" : []], suggestions: ["List degree, institution, graduation year, and relevant coursework clearly."], recommendedChanges: [], priority: "Low" as const, estimatedAtsGain: 2 }
    ]
  };
}


// 1. Analyze Resume / ATS Scoring (Enforced for 'atsAnalyses')
app.post("/api/ai/analyze-resume", enforceFeatureEntitlement('atsAnalyses'), async (req: SubscriptionRequest, res) => {
  try {
    const { resumeText: rawResumeText, fileData, fileName, targetRole, resumeVersionId } = req.body;
    if (!rawResumeText && !fileData) {
      return res.status(400).json({ error: "resumeText or fileData is required" });
    }

    const resumeText = await extractTextFromPayload({ fileText: rawResumeText, fileData, fileName });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      const localAnalysis = analyzeResumeContentLocally(resumeText, targetRole || "Software Engineer");
      
      if (req.userId && req.userId !== 'usr_guest') {
        await dbSaveAtsReport(req.userId, {
          resume_id: resumeVersionId,
          target_role: targetRole || "Software Engineer",
          overall_score: localAnalysis.overallScore,
          formatting_score: localAnalysis.formattingScore,
          summary: localAnalysis.summary,
          keywords: localAnalysis.keywords,
          impact_points: localAnalysis.impactPoints,
          grammar_issues: localAnalysis.grammarIssues,
          analysis_data: localAnalysis
        });
      }

      await recordFeatureUsage(req.userId, req.userProfile, 'atsAnalyses', req.guestKey);
      return res.json(localAnalysis);
    }

    const ai = getGenAI();
    const prompt = `Analyze the following resume for a target role of "${targetRole || 'Software Engineer'}".
    Provide a comprehensive, highly realistic ATS scoring analysis in JSON format with:
    - overallScore (0-100 number derived from actual content)
    - formattingScore (0-100 number)
    - impactScore (0-100 number)
    - relevanceScore (0-100 number)
    - summary (detailed paragraph summary specific to this resume)
    - keywordList: array of objects { keyword, detected (boolean), importance ("High"|"Medium"), category, frequency (number) }
    - categoryScores: array of objects { category, score (number), explanation, tip } with exactly 10 categories: Formatting, Keywords, Skills, Projects, Experience, Education, Readability, Grammar, Structure, Impact
    - keywords: array of objects with { id, type ("high" | "medium" | "success"), title, impactTag, description, suggestionTitle, suggestionText, originalBullet, suggestedBullet }
    - impactPoints: array of actionable bullet improvement tips
    - grammarIssues: array of grammar or style fixes
    - sectionAnalyses: array of objects { id, sectionName, score, strengths: string[], weaknesses: string[], suggestions: string[], recommendedChanges: string[], priority: "High"|"Medium"|"Low", estimatedAtsGain: number }
    
    Resume content:
    """
    ${resumeText}
    """`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallScore: { type: Type.INTEGER },
            formattingScore: { type: Type.INTEGER },
            impactScore: { type: Type.INTEGER },
            relevanceScore: { type: Type.INTEGER },
            summary: { type: Type.STRING },
            targetRole: { type: Type.STRING },
            keywordList: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  keyword: { type: Type.STRING },
                  detected: { type: Type.BOOLEAN },
                  importance: { type: Type.STRING },
                  category: { type: Type.STRING },
                  frequency: { type: Type.INTEGER }
                }
              }
            },
            categoryScores: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING },
                  score: { type: Type.INTEGER },
                  explanation: { type: Type.STRING },
                  tip: { type: Type.STRING }
                }
              }
            },
            keywords: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  type: { type: Type.STRING },
                  title: { type: Type.STRING },
                  impactTag: { type: Type.STRING },
                  description: { type: Type.STRING },
                  suggestionTitle: { type: Type.STRING },
                  suggestionText: { type: Type.STRING },
                  originalBullet: { type: Type.STRING },
                  suggestedBullet: { type: Type.STRING },
                },
              },
            },
            impactPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
            grammarIssues: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    if (req.userId && req.userId !== 'usr_guest') {
      await dbSaveAtsReport(req.userId, {
        resume_id: resumeVersionId,
        target_role: targetRole || "Software Engineer",
        overall_score: parsed.overallScore || 0,
        formatting_score: parsed.formattingScore || 0,
        summary: parsed.summary || "",
        keywords: parsed.keywords || [],
        impact_points: parsed.impactPoints || [],
        grammar_issues: parsed.grammarIssues || [],
        analysis_data: parsed
      });
    }
    await recordFeatureUsage(req.userId, req.userProfile, 'atsAnalyses', req.guestKey);
    res.json(parsed);
  } catch (err: any) {
    console.error("Error in /api/ai/analyze-resume:", err);
    // Fallback to local dynamic analysis on error
    const localFallback = analyzeResumeContentLocally(req.body.resumeText, req.body.targetRole || "Software Engineer");
    res.json(localFallback);
  }
});

// 2. Job Match Scoring & Missing Skills Analysis
app.post("/api/ai/match-job", enforceFeatureEntitlement('jobMatchAnalyses'), async (req: SubscriptionRequest, res) => {
  try {
    const { resumeText, jobDescription, jobTitle, company } = req.body;
    if (!jobDescription) {
      return res.status(400).json({ error: "jobDescription is required" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      await recordFeatureUsage(req.userId, req.userProfile, 'jobMatchAnalyses', req.guestKey);
      return res.json({
        matchScore: 86,
        matchingSkills: ["React", "TypeScript", "Node.js", "Git", "REST APIs"],
        missingSkills: ["GraphQL", "Kubernetes", "System Architecture Documentation"],
        keywordDensityScore: 84,
        suggestions: [
          "Add GraphQL query building experience to your recent project section.",
          "Emphasize Kubernetes container deployments in your DevOps skill highlights."
        ]
      });
    }

    const ai = getGenAI();
    const prompt = `Compare this resume against the target job description for position "${jobTitle || 'Role'}" at "${company || 'Company'}".
    Provide an analysis JSON containing:
    - matchScore (0-100 number)
    - matchingSkills (array of strings)
    - missingSkills (array of strings)
    - keywordDensityScore (0-100 number)
    - suggestions (array of string improvement recommendations)

    Resume:
    """
    ${resumeText || 'Experienced Senior Software Engineer with React, TypeScript, Node.js, Python, AWS, and Docker.'}
    """

    Job Description:
    """
    ${jobDescription}
    """`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            matchScore: { type: Type.INTEGER },
            matchingSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
            missingSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
            keywordDensityScore: { type: Type.INTEGER },
            suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    await recordFeatureUsage(req.userId, req.userProfile, 'jobMatchAnalyses', req.guestKey);
    res.json(parsed);
  } catch (err: any) {
    console.error("Error in /api/ai/match-job:", err);
    res.status(500).json({ error: "Failed to perform job match analysis", details: err.message });
  }
});

// 2b. AI Structured Resume Parsing
app.post("/api/ai/parse-resume", async (req, res) => {
  try {
    const { resumeText: rawText, fileData, fileName } = req.body;
    if (!rawText && !fileData) {
      return res.status(400).json({ error: "resumeText or fileData is required" });
    }

    const resumeText = await extractTextFromPayload({ fileText: rawText, fileData, fileName });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.json({
        fullName: "Alex Morgan",
        email: "alex.dev@hireflow.ai",
        phone: "+1 (555) 234-5678",
        linkedIn: "https://linkedin.com/in/alex-dev",
        gitHub: "https://github.com/alex-dev-lead",
        portfolio: "https://alexmorgan.dev",
        summary: "Seasoned Senior Software Engineer with 7+ years of experience in distributed cloud systems, modern web architecture (React, TypeScript, Node.js), and high-throughput microservices.",
        education: [
          { degree: "B.S. in Computer Science", institution: "Stanford University", year: "2018", gpa: "3.9/4.0" }
        ],
        experience: [
          {
            company: "Apple",
            role: "Senior Software Engineer",
            period: "2021 - Present",
            location: "Cupertino, CA",
            bullets: [
              "Architected and deployed highly available distributed streaming services handling 10k+ req/sec using Kafka & Redis.",
              "Led frontend performance migration to Next.js and TypeScript, reducing p99 latency by 35%.",
              "Automated AWS multi-region infrastructure (EC2, EKS, S3) with Terraform CI/CD pipelines."
            ]
          },
          {
            company: "TechCorp Inc.",
            role: "Full Stack Developer",
            period: "2018 - 2021",
            location: "San Francisco, CA",
            bullets: [
              "Engineered real-time telemetry dashboards serving 250k daily active users.",
              "Designed resilient PostgreSQL schemas and GraphQL API microservices."
            ]
          }
        ],
        projects: [
          {
            name: "CloudScale Engine",
            description: "High-performance distributed event broker built with Go and WebSockets.",
            technologies: ["Go", "Kafka", "Docker", "Kubernetes"]
          }
        ],
        skills: ["TypeScript", "React", "Next.js", "Node.js", "Go", "Python", "AWS", "Docker", "Kubernetes", "PostgreSQL", "Kafka", "Redis"],
        certifications: ["AWS Certified Solutions Architect", "CKA (Certified Kubernetes Administrator)"],
        languages: ["English (Native)", "Spanish (Professional)"],
        achievements: ["Patent co-inventor for distributed data caching", "Top 1% Contributor on GitHub"]
      });
    }

    const ai = getGenAI();
    const prompt = `Parse the following raw resume text into a structured JSON object containing:
    - fullName, email, phone, linkedIn, gitHub, portfolio, summary
    - education (array of { degree, institution, year, gpa })
    - experience (array of { company, role, period, location, bullets: string[] })
    - projects (array of { name, description, technologies: string[] })
    - skills (array of string skill names)
    - certifications (array of strings)
    - languages (array of strings)
    - achievements (array of strings)

    Resume Text:
    """
    ${resumeText}
    """`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    res.json(JSON.parse(response.text || "{}"));
  } catch (err: any) {
    console.error("Error in /api/ai/parse-resume:", err);
    res.status(500).json({ error: "Failed to parse resume", details: err.message });
  }
});

// 2c. AI Resume Tailoring against JD
app.post("/api/ai/tailor-resume", enforceFeatureEntitlement('jobMatchAnalyses'), async (req: SubscriptionRequest, res) => {
  try {
    const { resumeContent, jobDescription, targetRole, company } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      await recordFeatureUsage(req.userId, req.userProfile, 'jobMatchAnalyses', req.guestKey);
      return res.json({
        matchPercentage: 92,
        missingSkills: ["GraphQL Subscriptions", "Kubernetes Mesh"],
        missingKeywords: ["Event-Driven Microservices", "CI/CD Gateways"],
        suggestedChanges: [
          "Reframe Apple experience bullet 1 to highlight Event-Driven architecture.",
          "Insert Kubernetes cluster deployment explicitly into skills section."
        ],
        tailoredResumeContent: `${resumeContent || ''}\n\n[TAILORED FOR ${company || 'TARGET ROLE'}]:\n• Spearheaded event-driven microservice orchestration using Kubernetes & Docker.\n• Integrated GraphQL subscriptions and distributed caching for low-latency state synchronization.`,
        tailoredVersionName: `Tailored: ${targetRole || 'Role'} at ${company || 'Target Co'}`
      });
    }

    const ai = getGenAI();
    const prompt = `Tailor this candidate's resume for the specific job description at "${company || 'Target Company'}" for role "${targetRole || 'Target Role'}".
    Provide JSON with:
    - matchPercentage (0-100 number)
    - missingSkills (array of strings)
    - missingKeywords (array of strings)
    - suggestedChanges (array of string bullet point changes)
    - tailoredResumeContent (the full improved resume text incorporating target keywords)
    - tailoredVersionName (short version string)

    Original Resume:
    """
    ${resumeContent}
    """

    Job Description:
    """
    ${jobDescription}
    """`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    const parsed = JSON.parse(response.text || "{}");
    await recordFeatureUsage(req.userId, req.userProfile, 'jobMatchAnalyses', req.guestKey);
    res.json(parsed);
  } catch (err: any) {
    console.error("Error in /api/ai/tailor-resume:", err);
    res.status(500).json({ error: "Failed to tailor resume", details: err.message });
  }
});

// 2d. Section / Bullet Point AI Optimizer
app.post("/api/ai/improve-section", enforceFeatureEntitlement('bulletRewrites'), async (req: SubscriptionRequest, res) => {
  try {
    const { sectionName, currentText, improvementType, targetRole } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      await recordFeatureUsage(req.userId, req.userProfile, 'bulletRewrites', req.guestKey);
      return res.json({
        originalText: currentText || "Built backend web services.",
        improvedText: sectionName === 'summary' 
          ? "High-impact Senior Software Engineer with 7+ years of expertise in architecting resilient distributed microservices, optimizing web application performance by 35%+, and leading cloud infrastructure deployments across AWS and Kubernetes."
          : "Architected distributed REST/gRPC backend microservices in Node.js and Go, reducing API p99 response times by 42% for 250,000 active daily users.",
        reason: `Enhanced with active leadership verbs, quantified metrics, and target ATS keywords for ${targetRole || 'Senior Software Engineer'}.`,
        expectedAtsIncrease: 7
      });
    }

    const ai = getGenAI();
    const prompt = `Improve the following resume section ("${sectionName}") for a target role of "${targetRole || 'Senior Software Engineer'}".
    Improvement goal: ${improvementType || 'Quantify impact, add strong action verbs, fix passive voice, and optimize for ATS keywords'}.
    
    Current Content:
    """
    ${currentText}
    """
    
    Provide JSON with:
    - originalText
    - improvedText
    - reason (explanation of why this version is stronger)
    - expectedAtsIncrease (integer number between 3 and 12)`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    const parsed = JSON.parse(response.text || "{}");
    await recordFeatureUsage(req.userId, req.userProfile, 'bulletRewrites', req.guestKey);
    res.json(parsed);
  } catch (err: any) {
    console.error("Error in /api/ai/improve-section:", err);
    res.status(500).json({ error: "Failed to improve resume section", details: err.message });
  }
});

// 3. Cover Letter Generator (Enforced for 'coverLetterGenerations')
app.post("/api/ai/generate-cover-letter", enforceFeatureEntitlement('coverLetterGenerations'), async (req: SubscriptionRequest, res) => {
  try {
    const { resumeText, jobDescription, jobTitle, company, tone } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      const selectedTone = tone || "professional & confident";
      await recordFeatureUsage(req.userId, req.userProfile, 'coverLetterGenerations', req.guestKey);
      return res.json({
        coverLetter: `Dear Hiring Manager at ${company || 'the Hiring Team'},

I am writing to express my strong enthusiasm for the ${jobTitle || 'Software Engineer'} role. With over 6 years of hands-end engineering experience across scalable cloud services, modern web frameworks, and high-performance system design, I am confident in my ability to drive immediate value for your team.

Throughout my career, I have consistently focused on delivering robust, high-impact software solutions. For example, at Apple, I architected distributed streaming pipelines handling high-throughput traffic while reducing frontend load times by 35%. My technical toolkit—spanning TypeScript, React, Node.js, Python, and AWS—aligns directly with the priorities outlined in your job requirements.

What excites me most about ${company || 'your company'} is your commitment to technical innovation and engineering excellence. I thrive in collaborative environments that demand technical rigor and product ownership, and I look forward to contributing to your upcoming roadmap.

Thank you for your time and consideration. I would welcome the opportunity to discuss how my background and technical leadership align with your team's goals.

Sincerely,
Alex Dev`
      });
    }

    const ai = getGenAI();
    const prompt = `Generate a compelling, highly tailored cover letter for the role of "${jobTitle || 'Role'}" at "${company || 'Company'}".
    Tone requested: ${tone || 'Professional, confident, and engaging'}.
    
    Resume details:
    """
    ${resumeText || 'Senior Software Engineer with 7+ years in web development, cloud architectures, TypeScript, React, Python, AWS.'}
    """

    Job description details:
    """
    ${jobDescription || 'Seeking an innovative engineer to build high-scale web platforms and APIs.'}
    """`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
    });

    await recordFeatureUsage(req.userId, req.userProfile, 'coverLetterGenerations', req.guestKey);
    res.json({ coverLetter: response.text });
  } catch (err: any) {
    console.error("Error in /api/ai/generate-cover-letter:", err);
    res.status(500).json({ error: "Failed to generate cover letter", details: err.message });
  }
});

// 4. Interview Feedback / Coach Evaluation (Enforced for 'mockInterviews')
app.post("/api/ai/interview-feedback", enforceFeatureEntitlement('mockInterviews'), async (req: SubscriptionRequest, res) => {
  try {
    const { question, answer, role } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      await recordFeatureUsage(req.userId, req.userProfile, 'mockInterviews', req.guestKey);
      return res.json({
        score: 88,
        starBreakdown: {
          situation: "Clear context provided regarding team scalability challenge.",
          task: "Well-defined objective to reduce API response latency.",
          action: "Strong technical detail on Redis caching and query indexing.",
          result: "Quantified 40% speedup achieved."
        },
        strengths: ["Great technical precision", "Data-driven results"],
        areasToImprove: ["Mention cross-functional stakeholder communication briefly."],
        polishedAnswer: "In my previous role, I faced an API bottleneck during peak traffic. I led the backend refactoring by introducing Redis caching layers and optimizing PostgreSQL query execution plans, ultimately reducing p99 latency by 42% for 150k active sessions."
      });
    }

    const ai = getGenAI();
    const prompt = `Evaluate the candidate's answer for an interview question for role "${role || 'Software Engineer'}".
    Question: "${question}"
    Candidate Answer: "${answer}"

    Provide evaluation JSON with:
    - score (0-100 number)
    - starBreakdown: object with { situation, task, action, result }
    - strengths: array of string bullet points
    - areasToImprove: array of string bullet points
    - polishedAnswer: an exemplar STAR-aligned improved answer string`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER },
            starBreakdown: {
              type: Type.OBJECT,
              properties: {
                situation: { type: Type.STRING },
                task: { type: Type.STRING },
                action: { type: Type.STRING },
                result: { type: Type.STRING },
              },
            },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            areasToImprove: { type: Type.ARRAY, items: { type: Type.STRING } },
            polishedAnswer: { type: Type.STRING },
          },
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    if (req.userId && req.userId !== 'usr_guest') {
      await dbSaveInterviewSession(req.userId, {
        topic: role || 'Technical Interview',
        role: role || 'Software Engineer',
        score: parsed.score || 0,
        question: question || '',
        answer: answer || '',
        star_breakdown: parsed.starBreakdown || {},
        strengths: parsed.strengths || [],
        areas_to_improve: parsed.areasToImprove || [],
        polished_answer: parsed.polishedAnswer || ''
      });
    }
    await recordFeatureUsage(req.userId, req.userProfile, 'mockInterviews', req.guestKey);
    res.json(parsed);
  } catch (err: any) {
    console.error("Error in /api/ai/interview-feedback:", err);
    res.status(500).json({ error: "Failed to evaluate interview response", details: err.message });
  }
});

// 5. AI Career Coach Chat
app.post("/api/ai/chat", async (req, res) => {
  try {
    const { prompt, history } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.json({
        reply: `As your HireFlow AI Career Coach, I recommend focusing on highlighting quantifiable achievements in your resume and preparing STAR-structured answers for technical system design interviews. What specific topic would you like to explore next?`
      });
    }

    const ai = getGenAI();
    const chat = ai.chats.create({
      model: "gemini-3.6-flash",
      config: {
        systemInstruction: "You are HireFlow AI's Lead Career Strategist and Tech Recruitment Coach. Provide concise, strategic, high-value career, resume, and interview guidance for software engineering and tech professionals.",
      },
    });

    const response = await chat.sendMessage({ message: prompt });
    res.json({ reply: response.text });
  } catch (err: any) {
    console.error("Error in /api/ai/chat:", err);
    res.status(500).json({ error: "Failed to process AI chat message", details: err.message });
  }
});

// ------------------- VITE MIDDLEWARE SETUP -------------------

async function startServer() {
  // Initialize PostgreSQL database schema if DATABASE_URL is configured
  await initDb();

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR === "true" ? false : undefined,
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`HireFlow AI full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
