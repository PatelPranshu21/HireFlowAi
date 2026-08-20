import "dotenv/config";
import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import { createServer as createViteServer } from "vite";

import { 
  initDb, 
  getPool,
  dbSaveAtsReport, 
  dbSaveInterviewSession, 
  dbUpdateResumeVersionScore,
  dbSaveJobMatches,
  dbGetJobMatchesForResumeVersion,
  dbSaveSavedJob,
  dbRemoveSavedJob,
  dbIsJobSaved,
  dbGetSavedJobsForUser,
  dbGetUserSavedJobs,
  dbGetUserUsage,
  dbInitializeUserUsage,
  dbCheckFeatureEntitlement,
  dbIncrementFeatureUsage,
  dbGetAnalyticsOverview,
  dbUpdateJobApplicationStatus
} from "./src/db/postgres";
import authRoutes, { verifyAuthHeader } from "./server/authRoutes";
import { extractTextFromPayload, parseResumeDocument } from "./server/documentParser";
import { analyzeResumeContentLocally } from "./server/resumeAnalyzer";
import { pool } from "./db";
import { PLANS, PlanName, normalizeProfileSubscription } from "./src/data/planConfig";
import { JobMatchingService, CANONICAL_SKILLS } from "./src/services/jobMatchingService";
import { JobIngestionService } from "./server/jobIngestionService";
import { ExternalJobFetcher } from "./server/externalJobFetcher";
import { 
  resolveUserProfile, 
  enforceFeatureEntitlement, 
  recordFeatureUsage, 
  enforceAdminRole,
  SubscriptionRequest 
} from "./server/subscriptionMiddleware";


const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

// Mount Authentication & OAuth routes
app.use("/api/auth", authRoutes);

// Groq API Helper
async function callGroq(
  systemPrompt: string,
  userMessage: string,
  history: any[] = [],
  expectJson: boolean = false
): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("AI service is not configured. Please configure GROQ_API_KEY.");
  }

  const primaryModel = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';
  const candidateModels = [
    primaryModel,
    'openai/gpt-oss-120b',
    'openai/gpt-oss-20b',
    'qwen/qwen3.6-27b',
    'llama-3.3-70b-versatile',
    'llama3-8b-8192'
  ].filter((v, i, a) => a.indexOf(v) === i);
  
  const messages: any[] = [];
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }

  // Format history
  if (Array.isArray(history)) {
    for (const msg of history) {
      if (msg.role === 'model' || msg.role === 'assistant') {
        messages.push({ role: 'assistant', content: typeof msg.parts !== 'undefined' ? msg.parts[0].text : msg.content });
      } else {
        messages.push({ role: 'user', content: typeof msg.parts !== 'undefined' ? msg.parts[0].text : msg.content });
      }
    }
  }

  if (userMessage) {
    messages.push({ role: 'user', content: userMessage });
  }

  let lastError: any = null;

  for (const model of candidateModels) {
    try {
      const body: any = {
        model: model,
        messages: messages,
        temperature: 0.7,
        max_completion_tokens: 1500
      };

      if (expectJson) {
        body.response_format = { type: 'json_object' };
      }

      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        const text = await res.text();
        console.warn(`[Groq AI] Model '${model}' failed with HTTP ${res.status}:`, text);
        lastError = new Error(`Groq API error: ${res.status} (${text})`);
        continue;
      }

      const data = await res.json();
      if (data.choices && data.choices[0]?.message?.content) {
        return data.choices[0].message.content;
      }
    } catch (err) {
      console.warn(`[Groq AI] Error trying model '${model}':`, err);
      lastError = err;
    }
  }

  throw lastError || new Error("Failed to get response from Groq AI service.");
}

// ------------------- SUBSCRIPTION & USAGE ENDPOINTS -------------------

app.get("/api/subscription/usage", async (req, res) => {
  try {
    const userProfile = await resolveUserProfile(req);
    const { profile: normProfile } = normalizeProfileSubscription(userProfile);

    let dbUsage = null;
    if (userProfile.id && userProfile.id !== 'usr_guest') {
      dbUsage = await dbGetUserUsage(userProfile.id);
    }

    const features = dbUsage ? dbUsage.features : {
      atsAnalyses: { used: normProfile.usageLimits?.atsAnalyses?.used || 0, limit: normProfile.usageLimits?.atsAnalyses?.max || 3, remaining: Math.max(0, (normProfile.usageLimits?.atsAnalyses?.max || 3) - (normProfile.usageLimits?.atsAnalyses?.used || 0)) },
      aiInterviews: { used: normProfile.usageLimits?.aiInterviews?.used || 0, limit: normProfile.usageLimits?.aiInterviews?.max || 3, remaining: Math.max(0, (normProfile.usageLimits?.aiInterviews?.max || 3) - (normProfile.usageLimits?.aiInterviews?.used || 0)) },
      coverLetterGenerations: { used: normProfile.usageLimits?.coverLetterGenerations?.used || 0, limit: normProfile.usageLimits?.coverLetterGenerations?.max || 5, remaining: Math.max(0, (normProfile.usageLimits?.coverLetterGenerations?.max || 5) - (normProfile.usageLimits?.coverLetterGenerations?.used || 0)) },
      jobMatchAnalyses: { used: normProfile.usageLimits?.jobMatchAnalyses?.used || 0, limit: normProfile.usageLimits?.jobMatchAnalyses?.max || 10, remaining: Math.max(0, (normProfile.usageLimits?.jobMatchAnalyses?.max || 10) - (normProfile.usageLimits?.jobMatchAnalyses?.used || 0)) },
      resumeScans: { used: normProfile.usageLimits?.resumeScans?.used || 0, limit: normProfile.usageLimits?.resumeScans?.max || 3, remaining: Math.max(0, (normProfile.usageLimits?.resumeScans?.max || 3) - (normProfile.usageLimits?.resumeScans?.used || 0)) }
    };

    res.json({
      success: true,
      plan: dbUsage?.plan || normProfile.subscriptionPlan || '3-Day Free Trial',
      subscriptionStatus: dbUsage?.subscriptionStatus || normProfile.subscriptionStatus || 'trialing',
      trialExpiryDate: normProfile.trialExpiryDate,
      features,
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
      await dbInitializeUserUsage(targetUserId, planName);
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

    const updatedUsage = targetUserId ? await dbGetUserUsage(targetUserId) : null;
    if (updatedUsage) {
      normProfile.usageLimits = {
        resumeScans: updatedUsage.features.resumeScans ? { used: updatedUsage.features.resumeScans.used, max: updatedUsage.features.resumeScans.limit } : { used: 0, max: 3 },
        atsAnalyses: updatedUsage.features.atsAnalyses ? { used: updatedUsage.features.atsAnalyses.used, max: updatedUsage.features.atsAnalyses.limit } : { used: 0, max: 3 },
        aiInterviews: updatedUsage.features.aiInterviews ? { used: updatedUsage.features.aiInterviews.used, max: updatedUsage.features.aiInterviews.limit } : { used: 0, max: 3 },
        coverLetterGenerations: updatedUsage.features.coverLetterGenerations ? { used: updatedUsage.features.coverLetterGenerations.used, max: updatedUsage.features.coverLetterGenerations.limit } : { used: 0, max: 5 },
        jobMatchAnalyses: updatedUsage.features.jobMatchAnalyses ? { used: updatedUsage.features.jobMatchAnalyses.used, max: updatedUsage.features.jobMatchAnalyses.limit } : { used: 0, max: 10 }
      };
    }

    res.json({ success: true, profile: normProfile, usage: updatedUsage });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to update plan", details: err.message });
  }
});

// ------------------- API ENDPOINTS -------------------

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});



// 1. Analyze Resume / ATS Scoring (Enforced for 'atsAnalyses')
app.post("/api/ai/analyze-resume", enforceFeatureEntitlement('atsAnalyses'), async (req: SubscriptionRequest, res) => {
  const tTotalStart = performance.now();
  try {
    const { resumeText: rawResumeText, fileData, fileName, targetRole, resumeVersionId } = req.body;
    if (!rawResumeText && !fileData) {
      return res.status(400).json({ error: "resumeText or fileData is required" });
    }

    const tExtStart = performance.now();
    const docParse = await parseResumeDocument({ fileText: rawResumeText, fileData, fileName });
    const tExtraction = performance.now() - tExtStart;

    if (!docParse.extractionSuccess || docParse.extractedTextLength === 0) {
      return res.status(422).json({
        error: docParse.error || "Text extraction failed. Unable to extract readable text.",
        overallScore: 0,
        status: "analysis_unavailable",
        extractedTextLength: 0,
        extractionSuccess: false
      });
    }

    const resumeText = docParse.text;

    // Run deterministic analysis to guarantee 100% evidence-based keyword provenance and zero hallucinations
    const parsed = analyzeResumeContentLocally(resumeText, targetRole || 'Software Engineer');
    
    // 3. Deterministic Job Matching against all real available jobs from PostgreSQL
    const detectedSkills = (parsed.keywordList || [])
      .filter((k: any) => k.detected && k.foundInResume)
      .map((k: any) => k.keyword);

    const tMatchStart = performance.now();
    const availableJobs = await JobIngestionService.getAvailableJobs();
    const jobMatches = JobMatchingService.matchResumeAgainstJobs(
      resumeText,
      detectedSkills,
      availableJobs,
      targetRole || "Software Engineer"
    );
    const tMatching = performance.now() - tMatchStart;

    const tDbStart = performance.now();
    const effectiveUserId = req.userId || req.userProfile?.id || verifyAuthHeader(req);
    console.log(`[RESUME ANALYSIS] resumeVersionId=${resumeVersionId || 'n/a'} userId=${effectiveUserId || 'guest'} score=${parsed.overallScore}`);
    if (effectiveUserId && effectiveUserId !== 'usr_guest') {
      await dbSaveAtsReport(effectiveUserId, {
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

      // Persist score and analysis back to resume_versions table
      if (resumeVersionId) {
        await dbUpdateResumeVersionScore(resumeVersionId, parsed.overallScore || 0, parsed);

        // Save deterministic job matches strictly linked to this resume_version_id
        const dbMatches = jobMatches.map(m => ({
          resume_version_id: resumeVersionId,
          job_id: m.id,
          match_score: m.matchScore,
          similarity_score: (m as any).similarityScore || 0,
          skill_match_score: (m as any).skillMatchScore || 0,
          required_skill_score: (m as any).requiredSkillScore ?? null,
          role_alignment_score: (m as any).roleAlignmentScore ?? 75,
          additional_score: (m as any).additionalScore ?? 80,
          score_breakdown: (m as any).scoreBreakdown || null,
          matched_skills: (m as any).matchedSkills || [],
          missing_skills: (m as any).missingSkills || [],
          preferred_skills: (m as any).preferredSkills || [],
          why_match: m.recommendationReason || (m as any).whyMatch || ''
        }));
        await dbSaveJobMatches(effectiveUserId, resumeVersionId, dbMatches);
      }
    }
    const tDb = performance.now() - tDbStart;

    await recordFeatureUsage(effectiveUserId || req.userId, req.userProfile, 'atsAnalyses', req.guestKey);

    const tTotal = performance.now() - tTotalStart;
    const timing = parsed.timing || {
      atsAnalysis: 0,
      sectionAnalysis: 0,
      keywordAnalysis: 0,
      improvementAnalysis: 0
    };

    console.log(`[ResumePipeline]
Extraction: ${tExtraction.toFixed(2)}ms
ATS Analysis: ${timing.atsAnalysis.toFixed(2)}ms
Section Analysis: ${timing.sectionAnalysis.toFixed(2)}ms
Keyword Analysis: ${timing.keywordAnalysis.toFixed(2)}ms
Improvement Analysis: ${timing.improvementAnalysis.toFixed(2)}ms
Job Matching: ${tMatching.toFixed(2)}ms
Database Persistence: ${tDb.toFixed(2)}ms
Total: ${tTotal.toFixed(2)}ms`);

    res.json({ ...parsed, jobRecommendations: jobMatches, extractedText: resumeText, text: resumeText });
  } catch (err: any) {
    console.error("Error in /api/ai/analyze-resume:", err);
    res.status(503).json({ error: err.message || "Failed to analyze resume" });
  }
});

// 2. Deterministic Job Match Service API
app.post("/api/jobs/match-resume", async (req: SubscriptionRequest, res) => {
  try {
    const userProfile = await resolveUserProfile(req);
    const userId = req.userId || userProfile.id;
    const { resumeVersionId, resumeText, skills, targetRole } = req.body;

    const versionId = resumeVersionId || userProfile.activeResumeVersionId || `v_${Date.now()}`;
    const text = resumeText || userProfile.resumeText || userProfile.primaryResumeText || '';
    const candSkills = skills || userProfile.skills || [];

    const availableJobs = await JobIngestionService.getAvailableJobs();
    const matches = JobMatchingService.matchResumeAgainstJobs(
      text,
      candSkills,
      availableJobs,
      targetRole || userProfile.targetRole || "Software Engineer"
    );

    if (userId && userId !== 'usr_guest' && versionId) {
      const dbMatches = matches.map(m => ({
        resume_version_id: versionId,
        job_id: m.id,
        match_score: m.matchScore,
        similarity_score: (m as any).similarityScore || 0,
        skill_match_score: (m as any).skillMatchScore || 0,
        required_skill_score: (m as any).requiredSkillScore ?? null,
        role_alignment_score: (m as any).roleAlignmentScore ?? 75,
        additional_score: (m as any).additionalScore ?? 80,
        score_breakdown: (m as any).scoreBreakdown || null,
        matched_skills: (m as any).matchedSkills || m.requiredSkills || [],
        missing_skills: (m as any).missingSkills || [],
        preferred_skills: (m as any).preferredSkills || [],
        why_match: m.recommendationReason || (m as any).whyMatch || ''
      }));
      await dbSaveJobMatches(userId, versionId, dbMatches);
    }

    res.json({ success: true, recommendations: matches });
  } catch (err: any) {
    console.error("Error in /api/jobs/match-resume:", err);
    res.status(500).json({ error: "Failed to match resume against jobs", details: err.message });
  }
});

// -------------------------------------------------------------
// DYNAMIC JOB INGESTION API ROUTES
// -------------------------------------------------------------

// Manual bulk JSON upload for jobs
app.post("/api/admin/jobs/ingest", enforceAdminRole, async (req, res) => {
  try {
    // Basic admin auth check could go here
    const payload = req.body;
    if (!Array.isArray(payload) || payload.length === 0) {
      return res.status(400).json({ error: "Expected a non-empty JSON array of job objects." });
    }

    const normalizedJobs = ExternalJobFetcher.normalizeManualJobs(payload);
    const { dbSaveJobs } = require('./src/db/postgres');
    const savedCount = await dbSaveJobs(normalizedJobs);
    
    res.json({ success: true, ingested: savedCount, message: `Successfully ingested ${savedCount} jobs.` });
  } catch (err: any) {
    console.error("Error in /api/admin/jobs/ingest:", err);
    res.status(500).json({ error: "Failed to ingest jobs", details: err.message });
  }
});

// Manual trigger for Adzuna job ingestion pipeline
app.post("/api/jobs/refresh", async (req: SubscriptionRequest, res) => {
  try {
    const stats = await JobIngestionService.refreshAdzunaJobs({
      resultsPerPage: req.body?.resultsPerPage || 25,
      maxPagesPerQuery: req.body?.maxPagesPerQuery || 1,
      queries: req.body?.queries,
      expireStale: req.body?.expireStale !== false
    });
    res.json({
      success: true,
      stats,
      message: `Refreshed Adzuna jobs: ${stats.inserted} inserted, ${stats.updated} updated, ${stats.skipped} skipped, ${stats.expired} expired.`
    });
  } catch (err: any) {
    console.error("Error in /api/jobs/refresh:", err);
    res.status(500).json({ error: "Failed to refresh Adzuna jobs", details: err.message });
  }
});

// Trigger external API job fetch
app.post("/api/admin/jobs/trigger-fetch", enforceAdminRole, async (req, res) => {
  try {
    const stats = await JobIngestionService.refreshAdzunaJobs({
      resultsPerPage: req.body?.resultsPerPage || 25,
      maxPagesPerQuery: req.body?.maxPagesPerQuery || 1
    });
    res.json({ success: true, stats, message: `Successfully fetched and updated Adzuna jobs.` });
  } catch (err: any) {
    console.error("Error in /api/admin/jobs/trigger-fetch:", err);
    res.status(500).json({ error: "Failed to trigger job fetch", details: err.message });
  }
});

// 2b. Get Persisted Job Matches for Specific Resume Version
app.get("/api/jobs/matches/:resumeVersionId", async (req: SubscriptionRequest, res) => {
  try {
    const userProfile = await resolveUserProfile(req);
    const userId = req.userId || userProfile.id;
    const { resumeVersionId } = req.params;

    if (!userId || userId === 'usr_guest') {
      const text = userProfile.resumeText || userProfile.primaryResumeText || '';
      const availableJobs = await JobIngestionService.getAvailableJobs();
      const matches = JobMatchingService.matchResumeAgainstJobs(text, userProfile.skills || [], availableJobs, userProfile.targetRole);
      return res.json({ success: true, recommendations: matches });
    }

    const persistedRows = await dbGetJobMatchesForResumeVersion(userId, resumeVersionId);
    if (persistedRows && persistedRows.length > 0) {
      return res.json({ success: true, recommendations: persistedRows });
    }

    // If not in DB yet for this version, compute now and persist
    const activeVer = (userProfile.resumeVersions || []).find((v: any) => v.id === resumeVersionId);
    const text = activeVer?.resumeText || activeVer?.content || userProfile.resumeText || '';
    const skills = activeVer?.parsedData?.skills || userProfile.skills || [];
    const availableJobs = await JobIngestionService.getAvailableJobs();
    const matches = JobMatchingService.matchResumeAgainstJobs(text, skills, availableJobs, userProfile.targetRole);

    if (userId && userId !== 'usr_guest') {
      const dbMatches = matches.map(m => ({
        resume_version_id: resumeVersionId,
        job_id: m.id,
        match_score: m.matchScore,
        similarity_score: (m as any).similarityScore || 0,
        skill_match_score: (m as any).skillMatchScore || 0,
        required_skill_score: (m as any).requiredSkillScore ?? null,
        role_alignment_score: (m as any).roleAlignmentScore ?? 75,
        additional_score: (m as any).additionalScore ?? 80,
        score_breakdown: (m as any).scoreBreakdown || null,
        matched_skills: (m as any).matchedSkills || [],
        missing_skills: (m as any).missingSkills || [],
        preferred_skills: (m as any).preferredSkills || [],
        why_match: m.recommendationReason || (m as any).whyMatch || ''
      }));
      await dbSaveJobMatches(userId, resumeVersionId, dbMatches);
    }

    return res.json({ success: true, recommendations: matches });
  } catch (err: any) {
    console.error("Error in GET /api/jobs/matches/:resumeVersionId:", err);
    res.status(500).json({ error: "Failed to fetch job matches", details: err.message });
  }
});

// -------------------------------------------------------------
// PERSISTENT SAVED JOBS REST APIS
// -------------------------------------------------------------

// POST /api/jobs/:jobId/save - Save job for authenticated user
app.post("/api/jobs/:jobId/save", async (req: SubscriptionRequest, res) => {
  try {
    const userId = req.userId || req.userProfile?.id || verifyAuthHeader(req);
    if (!userId || userId === 'usr_guest') {
      return res.status(401).json({ error: "Unauthorized: Please log in to save jobs." });
    }

    const { jobId } = req.params;
    if (!jobId) {
      return res.status(400).json({ error: "jobId parameter is required" });
    }

    const result = await dbSaveSavedJob(userId, jobId);
    if (!result.success) {
      return res.status(result.error === 'Job not found in catalog' ? 404 : 500).json({
        error: result.error || "Failed to save job",
        saved: false
      });
    }

    return res.json({ success: true, saved: true, jobId });
  } catch (err: any) {
    console.error("Error in POST /api/jobs/:jobId/save:", err);
    res.status(500).json({ error: "Failed to save job", details: err.message });
  }
});

// DELETE /api/jobs/:jobId/save - Unsave job for authenticated user
app.delete("/api/jobs/:jobId/save", async (req: SubscriptionRequest, res) => {
  try {
    const userId = req.userId || req.userProfile?.id || verifyAuthHeader(req);
    if (!userId || userId === 'usr_guest') {
      return res.status(401).json({ error: "Unauthorized: Please log in to manage saved jobs." });
    }

    const { jobId } = req.params;
    if (!jobId) {
      return res.status(400).json({ error: "jobId parameter is required" });
    }

    const result = await dbRemoveSavedJob(userId, jobId);
    return res.json({ success: true, saved: false, jobId });
  } catch (err: any) {
    console.error("Error in DELETE /api/jobs/:jobId/save:", err);
    res.status(500).json({ error: "Failed to unsave job", details: err.message });
  }
});

// GET /api/jobs/saved - Return all jobs saved by authenticated user (joined with jobs table)
app.get("/api/jobs/saved", async (req: SubscriptionRequest, res) => {
  try {
    const userId = req.userId || req.userProfile?.id || verifyAuthHeader(req);
    if (!userId || userId === 'usr_guest') {
      return res.status(401).json({ error: "Unauthorized: Please log in to view saved jobs." });
    }

    const savedJobs = await dbGetSavedJobsForUser(userId);
    return res.json({ success: true, jobs: savedJobs, count: savedJobs.length });
  } catch (err: any) {
    console.error("Error in GET /api/jobs/saved:", err);
    res.status(500).json({ error: "Failed to fetch saved jobs", details: err.message });
  }
});

// GET /api/jobs/:jobId/saved - Check if specific job is saved by authenticated user
app.get("/api/jobs/:jobId/saved", async (req: SubscriptionRequest, res) => {
  try {
    const userId = req.userId || req.userProfile?.id || verifyAuthHeader(req);
    if (!userId || userId === 'usr_guest') {
      return res.json({ success: true, jobId: req.params.jobId, saved: false });
    }

    const isSaved = await dbIsJobSaved(userId, req.params.jobId);
    return res.json({ success: true, jobId: req.params.jobId, saved: isSaved });
  } catch (err: any) {
    console.error("Error in GET /api/jobs/:jobId/saved:", err);
    res.status(500).json({ error: "Failed to check saved status", details: err.message });
  }
});

// Analytics Overview Endpoint
app.get("/api/analytics/overview", async (req: SubscriptionRequest, res) => {
  try {
    const userProfile = await resolveUserProfile(req);
    const userId = req.userId || userProfile.id || verifyAuthHeader(req);
    if (!userId || userId === 'usr_guest') {
      return res.json({
        success: true,
        period: 'all',
        applications: { total: 0, applied: 0, screening: 0, interview: 0, offer: 0, accepted: 0, rejected: 0, interviewRate: 0, offerRate: 0, rejectionRate: 0, acceptanceRate: 0, responseRate: 0 },
        applicationVelocity: [],
        jobMatches: { totalMatches: 0, avgMatchScore: 0, distribution: [], quality: { strong: 0, good: 0, moderate: 0, weak: 0 } },
        skills: { topMissing: [], topMatched: [] },
        savedJobs: { totalSaved: 0, savedAndApplied: 0, savedToAppliedRate: 0 }
      });
    }

    const period = (req.query.period as string) || 'all';
    const overview = await dbGetAnalyticsOverview(userId, period);
    return res.json({ success: true, ...overview });
  } catch (err: any) {
    console.error("Error in GET /api/analytics/overview:", err);
    res.status(500).json({ error: "Failed to fetch analytics overview", details: err.message });
  }
});

// 2b-2. Refresh Job Matches for Specific Resume Version
app.post("/api/jobs/refresh-for-resume/:resumeVersionId", async (req: SubscriptionRequest, res) => {
  try {
    const userProfile = await resolveUserProfile(req);
    const userId = req.userId || userProfile.id;
    const { resumeVersionId } = req.params;

    const activeVer = (userProfile.resumeVersions || []).find((v: any) => v.id === resumeVersionId);
    const text = activeVer?.resumeText || activeVer?.content || userProfile.resumeText || '';
    const skills = activeVer?.parsedData?.skills || userProfile.skills || [];
    const availableJobs = await JobIngestionService.getAvailableJobs();
    const matches = JobMatchingService.matchResumeAgainstJobs(text, skills, availableJobs, userProfile.targetRole);

    if (userId && userId !== 'usr_guest') {
      const dbMatches = matches.map(m => ({
        resume_version_id: resumeVersionId,
        job_id: m.id,
        match_score: m.matchScore,
        similarity_score: (m as any).similarityScore || 0,
        skill_match_score: (m as any).skillMatchScore || 0,
        matched_skills: (m as any).matchedSkills || m.requiredSkills || [],
        missing_skills: m.missingSkills || [],
        preferred_skills: [],
        why_match: m.recommendationReason
      }));
      await dbSaveJobMatches(userId, resumeVersionId, dbMatches);
    }

    return res.json({ success: true, recommendations: matches });
  } catch (err: any) {
    console.error("Error in POST /api/jobs/refresh-for-resume/:resumeVersionId:", err);
    res.status(500).json({ error: "Failed to refresh job matches", details: err.message });
  }
});

// 2c. Job Match Diagnostics & AI Explanation (Deterministic Backend Score + AI Explanation)
app.post("/api/ai/match-job", enforceFeatureEntitlement('jobMatchAnalyses'), async (req: SubscriptionRequest, res) => {
  try {
    const { resumeText, jobDescription, jobTitle, company, requiredSkills } = req.body;
    if (!jobDescription) {
      return res.status(400).json({ error: "jobDescription is required" });
    }

    // Deterministic calculation
    const deterministicMatch = JobMatchingService.calculateJobMatch(
      resumeText || '',
      [],
      {
        id: 'target_job',
        title: jobTitle || 'Position',
        company: company || 'Company',
        description: jobDescription,
        requiredSkills: requiredSkills || []
      }
    );

    let suggestions: string[] = [];
    try {
      const prompt = `A candidate's resume was compared deterministically against the job "${jobTitle || 'Role'}" at "${company || 'Company'}".
      Calculated facts:
      - Match Score: ${deterministicMatch.matchScore}%
      - Matched Skills: ${deterministicMatch.matchedSkills.join(', ') || 'None'}
      - Missing Skills: ${deterministicMatch.missingSkills.join(', ') || 'None'}
      - Textual Similarity: ${deterministicMatch.similarityScore}%

      Provide JSON with:
      - suggestions (array of 3-4 specific string suggestions to improve match score based on the missing skills)`;

      const responseText = await callGroq(prompt, "", [], true);
      const parsedAi = JSON.parse(responseText || "{}");
      if (Array.isArray(parsedAi.suggestions)) {
        suggestions = parsedAi.suggestions;
      }
    } catch (e) {
      suggestions = deterministicMatch.missingSkills.map(s => `Add practical experience or projects demonstrating ${s}.`);
    }

    await recordFeatureUsage(req.userId, req.userProfile, 'jobMatchAnalyses', req.guestKey);
    res.json({
      matchScore: deterministicMatch.matchScore,
      similarityScore: deterministicMatch.similarityScore,
      skillMatchScore: deterministicMatch.skillMatchScore,
      requiredSkillScore: deterministicMatch.requiredSkillScore,
      roleAlignmentScore: deterministicMatch.roleAlignmentScore,
      additionalScore: deterministicMatch.additionalScore,
      scoreBreakdown: deterministicMatch.scoreBreakdown,
      matchLabel: deterministicMatch.matchLabel,
      matchingSkills: deterministicMatch.matchedSkills,
      missingSkills: deterministicMatch.missingSkills,
      confidence: deterministicMatch.confidence,
      reason: deterministicMatch.whyMatch,
      keywordDensityScore: deterministicMatch.similarityScore,
      suggestions: suggestions
    });
  } catch (err: any) {
    console.error("Error in /api/ai/match-job:", err);
    res.status(503).json({ error: err.message || "Failed to perform job match analysis" });
  }
});

// 2b. AI Structured Resume Parsing
app.post("/api/ai/parse-resume", enforceFeatureEntitlement('atsAnalyses'), async (req: SubscriptionRequest, res) => {
  try {
    const { resumeText: rawText, fileData, fileName } = req.body;
    if (!rawText && !fileData) {
      return res.status(400).json({ error: "resumeText or fileData is required" });
    }

    const docParse = await parseResumeDocument({ fileText: rawText, fileData, fileName });
    if (!docParse.extractionSuccess || docParse.extractedTextLength === 0) {
      return res.status(422).json({
        error: docParse.error || "Text extraction failed. Unable to extract readable text from document.",
        fileName: docParse.fileName,
        fileType: docParse.fileType,
        extractedTextLength: 0,
        extractionSuccess: false
      });
    }

    const resumeText = docParse.text;

    let parsed: any = {};
    try {
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

      const responseText = await callGroq(prompt, "", [], true);
      parsed = JSON.parse(responseText || "{}");
    } catch (groqErr) {
      console.warn("Groq parse fallback to deterministic extraction:", groqErr);
      const skills = JobMatchingService.extractSkills(resumeText);
      const emailMatch = resumeText.match(/[\w.-]+@[\w.-]+\.\w+/);
      const phoneMatch = resumeText.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
      const lines = resumeText.split('\n').map(l => l.trim()).filter(Boolean);
      parsed = {
        fullName: lines[0] || '',
        email: emailMatch ? emailMatch[0] : '',
        phone: phoneMatch ? phoneMatch[0] : '',
        summary: lines.slice(1, 4).join(' '),
        skills: skills,
        experience: [],
        education: [],
        projects: [],
        certifications: [],
        languages: [],
        achievements: []
      };
    }

    res.json({
      ...parsed,
      parsed,
      text: resumeText,
      extractedText: resumeText,
      fileName: docParse.fileName,
      fileType: docParse.fileType,
      extractedTextLength: docParse.extractedTextLength,
      extractionSuccess: true
    });
  } catch (err: any) {
    console.error("Error in /api/ai/parse-resume:", err);
    res.status(500).json({ error: "Failed to parse resume", details: err.message });
  }
});

// 2c. AI Resume Tailoring against JD
app.post("/api/ai/tailor-resume", enforceFeatureEntitlement('jobMatchAnalyses'), async (req: SubscriptionRequest, res) => {
  try {
    const { resumeContent, jobDescription, targetRole, company } = req.body;
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

    const responseText = await callGroq(prompt, "", [], true);
    const parsed = JSON.parse(responseText || "{}");
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

    const responseText = await callGroq(prompt, "", [], true);
    const parsed = JSON.parse(responseText || "{}");
    await recordFeatureUsage(req.userId, req.userProfile, 'bulletRewrites', req.guestKey);
    res.json(parsed);
  } catch (err: any) {
    console.error("Error in /api/ai/improve-section:", err);
    res.status(503).json({ error: err.message || "Failed to improve resume section" });
  }
});

// 3. Cover Letter Generator (Enforced for 'coverLetterGenerations')
app.post("/api/ai/generate-cover-letter", enforceFeatureEntitlement('coverLetterGenerations'), async (req: SubscriptionRequest, res) => {
  try {
    const { resumeText, jobDescription, jobTitle, company, tone } = req.body;
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

    const responseText = await callGroq(prompt, "", [], false);
    await recordFeatureUsage(req.userId, req.userProfile, 'coverLetterGenerations', req.guestKey);
    res.json({ coverLetter: responseText });
  } catch (err: any) {
    console.error("Error in /api/ai/generate-cover-letter:", err);
    res.status(503).json({ error: err.message || "Failed to generate cover letter" });
  }
});

// 4. Interview Feedback / Coach Evaluation (Enforced for 'mockInterviews')
app.post("/api/ai/interview-feedback", enforceFeatureEntitlement('mockInterviews'), async (req: SubscriptionRequest, res) => {
  try {
    const { question, answer, role } = req.body;
    const prompt = `Evaluate the candidate's answer for an interview question for role "${role || 'Software Engineer'}".
    Question: "${question}"
    Candidate Answer: "${answer}"

    Provide evaluation JSON with:
    - score (0-100 number)
    - starBreakdown: object with { situation, task, action, result }
    - strengths: array of string bullet points
    - areasToImprove: array of string bullet points
    - polishedAnswer: an exemplar STAR-aligned improved answer string`;

    const responseText = await callGroq(prompt, "", [], true);
    const parsed = JSON.parse(responseText || "{}");
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

// 5. AI Context-Aware Chat
app.post("/api/ai/chat", async (req, res) => {
  try {
    const { message, prompt, context, conversationHistory, contextData } = req.body;
    const ai = process.env.GROQ_API_KEY;
    if (!ai) {
      return res.status(503).json({ error: "AI is temporarily unavailable. Please configure the GROQ_API_KEY." });
    }
    // Determine system prompt based on context
    let systemInstruction = "You are an AI Assistant for HireFlow AI. Help the user with their career, resume, and interviews.";
    
    if (context === "resume_coach") {
      systemInstruction = `You are the HireFlow AI Resume Coach. 
Role: Provide expert advice on the user's resume, ATS scoring, keywords, and formatting.
Critical Rule: You MUST base your answers on the provided Active Resume Context. DO NOT hallucinate skills or experience that are not in the resume text. If asked about something not in the resume, clearly state it is not present.
Active Resume Context:
Target Role: ${contextData?.userProfile?.targetRole || 'Not specified'}
ATS Score: ${contextData?.atsScore || 0}/100
Resume Content:
${contextData?.resumeText ? '"""\\n' + contextData.resumeText + '\\n"""' : 'No resume uploaded.'}
`;
    } else if (context === "interview_coach") {
      systemInstruction = `You are the HireFlow AI Interview Coach.
Role: Help the user prepare for interviews, specifically focusing on the STAR method, technical tradeoffs, and behavioral answers.
Target Role: ${contextData?.targetRole || contextData?.activeSession?.title || 'Not specified'}
Current Question: ${contextData?.activeQuestion ? JSON.stringify(contextData.activeQuestion) : 'General prep'}
User Profile: ${contextData?.userProfile ? JSON.stringify(contextData.userProfile) : 'Not specified'}
Do not give general resume advice unless specifically asked. Focus on the interview question at hand. Provide concise, actionable feedback.`;
    } else if (context === "career_coach") {
      systemInstruction = `You are the HireFlow AI Global Career Coach.
Role: Act as a holistic career strategist, offering roadmap generation, learning paths, and employability advice.
User Profile: ${contextData?.userProfile ? JSON.stringify(contextData.userProfile) : 'Not specified'}
ATS Score: ${contextData?.atsScore || 0}/100
Employability Score: ${contextData?.employabilityScore || 0}/100
Be strategic, encouraging, and provide concrete roadmaps or next steps.`;
    }

    // For chat, we pass history directly. callGroq handles role mapping.
    const userMessage = message || prompt;
    if (!userMessage) {
      return res.status(400).json({ error: "Message is required." });
    }

    const reply = await callGroq(systemInstruction, userMessage, conversationHistory, false);
    res.json({ reply });
  } catch (err: any) {
    console.error("Error in /api/ai/chat:", err);
    res.status(500).json({ error: "Failed to process AI chat message", details: err.message });
  }
});

// 6. Generate Interview Questions
app.post("/api/ai/generate-questions", enforceFeatureEntitlement('mockInterviews'), async (req: SubscriptionRequest, res) => {
  try {
    const { domain, level, company, resumeSkills } = req.body;
    const prompt = `Generate exactly 3 realistic mock interview questions for a ${level || ''} ${domain || 'Software Engineer'} at ${company || 'Tech Firm'}.
    The candidate's skills are: ${resumeSkills?.join(', ') || 'Not provided'}.
    Output JSON with an array of exactly 3 objects:
    - id (string)
    - role (string)
    - company (string)
    - type (string: "Technical", "System Design", or "Behavioral")
    - question (string)
    - hint (string)
    - modelAnswer (string)`;

    const responseText = await callGroq(prompt, "", [], true);
    const parsed = JSON.parse(responseText || "{}");
    // Ensure we return an array
    const questions = Array.isArray(parsed) ? parsed : (parsed.questions || []);
    res.json(questions);
  } catch (err: any) {
    console.error("Error in /api/ai/generate-questions:", err);
    res.status(503).json({ error: err.message || "Failed to generate interview questions" });
  }
});

// 7. Generate Interview Session Report
app.post("/api/ai/generate-report", enforceFeatureEntitlement('mockInterviews'), async (req: SubscriptionRequest, res) => {
  try {
    const { sessionTitle, companyName, answers } = req.body;
    const answersText = answers.map((a: any, i: number) => `Q${i+1}: ${a.questionText}\nScore: ${a.feedback?.score}\nA: ${a.userAudioOrText}`).join('\n\n');
    
    const prompt = `Generate a comprehensive Post-Interview Feedback Report based on the following candidate answers.
    Session: ${sessionTitle} for ${companyName}
    
    Answers and previous feedback scores:
    ${answersText}
    
    Provide JSON containing:
    - sessionTitle (string)
    - companyName (string)
    - overallScore (0-100)
    - technicalScore (0-100)
    - communicationScore (0-100)
    - problemSolvingScore (0-100)
    - confidenceScore (0-100)
    - strengths (array of strings)
    - weaknesses (array of strings)
    - improvementSuggestions (array of strings)
    - recommendedLearningTopics (array of strings)`;

    const responseText = await callGroq(prompt, "", [], true);
    const parsed = JSON.parse(responseText || "{}");
    res.json(parsed);
  } catch (err: any) {
    console.error("Error in /api/ai/generate-report:", err);
    res.status(503).json({ error: err.message || "Failed to generate interview report" });
  }
});

// ------------------- VITE MIDDLEWARE SETUP -------------------

async function startServer() {
  // Initialize PostgreSQL database schema if DATABASE_URL is configured
  await initDb();
  await JobIngestionService.ensureJobsIngested();

  // Purge orphaned job_matches whose job_ids no longer exist in the jobs table
  // These are stale references to old mock data that cause "Tech Company" in the UI
  try {
    const p = getPool();
    if (p) {
      const purgeResult = await p.query(
        `DELETE FROM job_matches WHERE job_id NOT IN (SELECT id FROM jobs)`
      );
      if (purgeResult.rowCount && purgeResult.rowCount > 0) {
        console.log(`[Startup] Purged ${purgeResult.rowCount} orphaned job_matches with stale job_ids.`);
      }
    }
  } catch (err) {
    console.error('[Startup] Error purging orphaned job_matches:', err);
  }

  // Setup safe Adzuna startup diagnostics & background job synchronization
  const hasAppId = Boolean(process.env.ADZUNA_APP_ID && process.env.ADZUNA_APP_ID.trim().length > 0);
  const hasAppKey = Boolean(process.env.ADZUNA_APP_KEY && process.env.ADZUNA_APP_KEY.trim().length > 0);
  const country = process.env.ADZUNA_COUNTRY || 'in';

  console.log(`[Adzuna] APP_ID configured: ${hasAppId}`);
  console.log(`[Adzuna] APP_KEY configured: ${hasAppKey}`);
  console.log(`[Adzuna] COUNTRY: ${country}`);

  if (hasAppId && hasAppKey) {
    console.log('[Startup] Adzuna API credentials active. Starting background job synchronization.');
    // Run initial sync in background
    setTimeout(() => {
      JobIngestionService.refreshAdzunaJobs({ country, resultsPerPage: 25, maxPagesPerQuery: 1 }).catch(e => console.error('[Background Sync] Error:', e?.message || e));
    }, 5000);
    
    // Schedule daily sync (every 24 hours)
    if (!(global as any).__adzunaInterval) {
      (global as any).__adzunaInterval = setInterval(() => {
        console.log('[Background Sync] Running daily Adzuna job fetch...');
        JobIngestionService.refreshAdzunaJobs({ country, resultsPerPage: 25, maxPagesPerQuery: 1, expireStale: true }).catch(e => console.error('[Background Sync] Error:', e?.message || e));
      }, 24 * 60 * 60 * 1000);
    }
  } else {
    console.warn('[Adzuna] Ingestion skipped: ADZUNA_APP_ID and/or ADZUNA_APP_KEY is missing in backend environment. No mock jobs will be generated.');
  }

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

  app.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`HireFlow AI full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
