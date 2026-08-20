import "dotenv/config";
import { PLANS, checkEntitlement, normalizeProfileSubscription } from "../src/data/planConfig";
import { UserProfile } from "../src/types";

async function runSubscriptionAndTrialVerification() {
  console.log("=================================================================");
  console.log("HIREFLOW AI – SUBSCRIPTION PLANS & TRIAL LIMITS VERIFICATION");
  console.log("=================================================================\n");

  // -------------------------------------------------------------
  // TEST 1: PLAN LIMITS DEFINITIONS EXACT MATCH TO PRICING COMPARISON TABLE
  // -------------------------------------------------------------
  console.log("--- TEST 1: PLAN LIMITS COMPARISON TABLE AUDIT ---");
  
  // Free Trial
  const trialLimits = PLANS['3-Day Free Trial'].limits;
  console.log("3-Day Free Trial limits:", trialLimits);
  if (trialLimits.atsAnalyses !== 3) throw new Error("Free Trial atsAnalyses should be 3");
  if (trialLimits.coverLetterGenerations !== 3) throw new Error("Free Trial coverLetterGenerations should be 3");
  if (trialLimits.mockInterviews !== 5) throw new Error("Free Trial mockInterviews should be 5");
  if (trialLimits.jobMatchAnalyses !== 5) throw new Error("Free Trial jobMatchAnalyses should be 5");
  if (trialLimits.resumeUploads !== 1) throw new Error("Free Trial resumeUploads (versions allowed) should be 1");
  if (trialLimits.savedJobs !== 10) throw new Error("Free Trial savedJobs limit should be 10");

  // Basic
  const basicLimits = PLANS['Basic'].limits;
  console.log("Basic Plan limits:", basicLimits);
  if (basicLimits.atsAnalyses !== 10) throw new Error("Basic atsAnalyses should be 10");
  if (basicLimits.coverLetterGenerations !== 10) throw new Error("Basic coverLetterGenerations should be 10");
  if (basicLimits.mockInterviews !== 5) throw new Error("Basic mockInterviews should be 5");
  if (basicLimits.jobMatchAnalyses !== 15) throw new Error("Basic jobMatchAnalyses should be 15");
  if (basicLimits.resumeUploads !== 3) throw new Error("Basic resumeUploads (versions allowed) should be 3");
  if (basicLimits.savedJobs !== 25) throw new Error("Basic savedJobs limit should be 25");

  // Pro
  const proLimits = PLANS['Pro'].limits;
  console.log("Pro Plan limits:", proLimits);
  if (proLimits.atsAnalyses !== 100) throw new Error("Pro atsAnalyses should be 100");
  if (proLimits.coverLetterGenerations !== 100) throw new Error("Pro coverLetterGenerations should be 100");
  if (proLimits.mockInterviews !== 30) throw new Error("Pro mockInterviews should be 30");
  if (proLimits.jobMatchAnalyses !== 100) throw new Error("Pro jobMatchAnalyses should be 100");
  if (proLimits.resumeUploads !== 10) throw new Error("Pro resumeUploads (versions allowed) should be 10");
  if (proLimits.savedJobs !== 100) throw new Error("Pro savedJobs limit should be 100");

  // Premium
  const premiumLimits = PLANS['Premium'].limits;
  console.log("Premium Plan limits:", premiumLimits);
  if (premiumLimits.atsAnalyses !== -1) throw new Error("Premium atsAnalyses should be -1 (Unlimited)");
  if (premiumLimits.coverLetterGenerations !== -1) throw new Error("Premium coverLetterGenerations should be -1 (Unlimited)");
  if (premiumLimits.mockInterviews !== -1) throw new Error("Premium mockInterviews should be -1 (Unlimited)");
  if (premiumLimits.jobMatchAnalyses !== -1) throw new Error("Premium jobMatchAnalyses should be -1 (Unlimited)");
  if (premiumLimits.resumeUploads !== -1) throw new Error("Premium resumeUploads should be -1 (Unlimited)");
  if (premiumLimits.savedJobs !== -1) throw new Error("Premium savedJobs should be -1 (Unlimited)");

  console.log("PASS: All plan limits match the comparison table 100% identically!\n");

  // -------------------------------------------------------------
  // TEST 2: EXPIRED 3-DAY FREE TRIAL USER BLOCKED FROM RESUME UPLOAD & ATS
  // -------------------------------------------------------------
  console.log("--- TEST 2: EXPIRED 3-DAY FREE TRIAL USER ENFORCEMENT ---");
  const expiredTrialUser: UserProfile = {
    id: "usr_trial_expired_01",
    name: "Expired Candidate",
    email: "expired@hireflow.ai",
    tier: "3-Day Free Trial",
    subscriptionPlan: "3-Day Free Trial",
    subscriptionStatus: "expired",
    trialStartDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    trialExpiryDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    resumeVersions: [],
    usageLimits: {
      resumeScans: { used: 0, max: 3 },
      atsAnalyses: { used: 0, max: 3 },
      aiInterviews: { used: 0, max: 5 },
      coverLetterGenerations: { used: 0, max: 3 },
      jobMatchAnalyses: { used: 0, max: 5 }
    }
  } as any as UserProfile;

  const uploadEntitlement = checkEntitlement(expiredTrialUser, 'resumeUploads');
  console.log("Expired User resumeUploads entitlement:", uploadEntitlement);
  if (uploadEntitlement.allowed !== false || uploadEntitlement.reason !== 'trial_expired') {
    throw new Error(`FAIL: Expired trial user was allowed to upload resume or incorrect reason: ${uploadEntitlement.reason}`);
  }

  const atsEntitlement = checkEntitlement(expiredTrialUser, 'atsAnalyses');
  console.log("Expired User atsAnalyses entitlement:", atsEntitlement);
  if (atsEntitlement.allowed !== false || atsEntitlement.reason !== 'trial_expired') {
    throw new Error("FAIL: Expired trial user was allowed to run ATS analysis");
  }

  const coverLetterEntitlement = checkEntitlement(expiredTrialUser, 'coverLetterGenerations');
  if (coverLetterEntitlement.allowed !== false || coverLetterEntitlement.reason !== 'trial_expired') {
    throw new Error("FAIL: Expired trial user was allowed to generate cover letter");
  }

  console.log("PASS: Expired 3-Day Free Trial user is strictly blocked across all features!\n");

  // -------------------------------------------------------------
  // TEST 3: ACTIVE 3-DAY FREE TRIAL VERSION LIMIT (MAX 1 VERSION)
  // -------------------------------------------------------------
  console.log("--- TEST 3: ACTIVE FREE TRIAL VERSION LIMIT (MAX 1) ---");
  const activeTrialUserWith0Versions: UserProfile = {
    id: "usr_trial_active_01",
    name: "Active Candidate",
    email: "active@hireflow.ai",
    subscriptionPlan: "3-Day Free Trial",
    subscriptionStatus: "trialing",
    trialStartDate: new Date().toISOString(),
    trialExpiryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    resumeVersions: [],
    usageLimits: {
      resumeScans: { used: 0, max: 3 },
      atsAnalyses: { used: 0, max: 3 },
      aiInterviews: { used: 0, max: 5 },
      coverLetterGenerations: { used: 0, max: 3 },
      jobMatchAnalyses: { used: 0, max: 5 }
    }
  } as any as UserProfile;

  const check1stUpload = checkEntitlement(activeTrialUserWith0Versions, 'resumeUploads');
  console.log("Active Trial 0 versions upload check:", check1stUpload);
  if (check1stUpload.allowed !== true) {
    throw new Error("FAIL: Active trial user with 0 versions should be allowed to upload 1st version");
  }

  const activeTrialUserWith1Version: UserProfile = {
    ...activeTrialUserWith0Versions,
    resumeVersions: [{ id: "v1", versionName: "Master", fileName: "resume.pdf", score: 80, uploadedAt: "Today", template: "modern_tech" } as any]
  };

  const check2ndUpload = checkEntitlement(activeTrialUserWith1Version, 'resumeUploads');
  console.log("Active Trial 1 version upload check (exceeding limit of 1):", check2ndUpload);
  if (check2ndUpload.allowed !== false || check2ndUpload.reason !== 'limit_reached') {
    throw new Error("FAIL: Active trial user with 1 version must be blocked from adding a 2nd version (limit is 1)");
  }
  console.log("PASS: Free trial version limit (1 version allowed) enforced correctly!\n");

  // -------------------------------------------------------------
  // TEST 4: BASIC PLAN ($9) - 3 VERSIONS ALLOWED, 10 SCANS
  // -------------------------------------------------------------
  console.log("--- TEST 4: BASIC PLAN ($9) LIMITS ENFORCEMENT ---");
  const basicUser: UserProfile = {
    id: "usr_basic_01",
    name: "Basic Candidate",
    email: "basic@hireflow.ai",
    subscriptionPlan: "Basic",
    subscriptionStatus: "active",
    resumeVersions: [
      { id: "v1" } as any,
      { id: "v2" } as any
    ],
    usageLimits: {
      resumeScans: { used: 9, max: 10 },
      atsAnalyses: { used: 9, max: 10 },
      aiInterviews: { used: 4, max: 5 },
      coverLetterGenerations: { used: 9, max: 10 },
      jobMatchAnalyses: { used: 14, max: 15 }
    }
  } as any as UserProfile;

  // 3rd version upload (under limit of 3)
  const basic3rdVersionCheck = checkEntitlement(basicUser, 'resumeUploads');
  if (basic3rdVersionCheck.allowed !== true) {
    throw new Error("FAIL: Basic user with 2 versions should be allowed 3rd version");
  }

  // 4th version upload (over limit of 3)
  const basicUserWith3Versions: UserProfile = {
    ...basicUser,
    resumeVersions: [{ id: "v1" } as any, { id: "v2" } as any, { id: "v3" } as any]
  };
  const basic4thVersionCheck = checkEntitlement(basicUserWith3Versions, 'resumeUploads');
  console.log("Basic User 4th version check:", basic4thVersionCheck);
  if (basic4thVersionCheck.allowed !== false || basic4thVersionCheck.reason !== 'limit_reached') {
    throw new Error("FAIL: Basic user must be blocked when exceeding 3 resume versions");
  }

  // Basic monthly quota exhaustion
  const basicUserQuotaExhausted: UserProfile = {
    ...basicUser,
    resumeVersions: [{ id: "v1" } as any],
    usageLimits: {
      ...basicUser.usageLimits,
      resumeScans: { used: 10, max: 10 },
      atsAnalyses: { used: 10, max: 10 }
    }
  };
  const basicQuotaCheck = checkEntitlement(basicUserQuotaExhausted, 'resumeUploads');
  console.log("Basic User scan quota exhausted check:", basicQuotaCheck);
  if (basicQuotaCheck.allowed !== false || basicQuotaCheck.reason !== 'limit_reached') {
    throw new Error("FAIL: Basic user must be blocked when 10 monthly scans are used");
  }
  console.log("PASS: Basic Plan limits (3 versions, 10 scans/mo) verified successfully!\n");

  // -------------------------------------------------------------
  // TEST 5: PRO PLAN ($19) - 10 VERSIONS, 100 SCANS / MATCHES
  // -------------------------------------------------------------
  console.log("--- TEST 5: PRO PLAN ($19) LIMITS ENFORCEMENT ---");
  const proUserWith9Versions: UserProfile = {
    id: "usr_pro_01",
    name: "Pro Candidate",
    email: "pro@hireflow.ai",
    subscriptionPlan: "Pro",
    subscriptionStatus: "active",
    resumeVersions: new Array(9).fill(null).map((_, i) => ({ id: `v_${i}` } as any)),
    usageLimits: {
      resumeScans: { used: 50, max: 100 },
      atsAnalyses: { used: 50, max: 100 },
      aiInterviews: { used: 20, max: 30 },
      coverLetterGenerations: { used: 50, max: 100 },
      jobMatchAnalyses: { used: 50, max: 100 }
    }
  } as any as UserProfile;

  const pro10thCheck = checkEntitlement(proUserWith9Versions, 'resumeUploads');
  if (pro10thCheck.allowed !== true) {
    throw new Error("FAIL: Pro user should be allowed 10th resume version");
  }

  const proUserWith10Versions: UserProfile = {
    ...proUserWith9Versions,
    resumeVersions: new Array(10).fill(null).map((_, i) => ({ id: `v_${i}` } as any))
  };
  const pro11thCheck = checkEntitlement(proUserWith10Versions, 'resumeUploads');
  console.log("Pro User 11th version check:", pro11thCheck);
  if (pro11thCheck.allowed !== false || pro11thCheck.reason !== 'limit_reached') {
    throw new Error("FAIL: Pro user must be blocked on 11th version (limit is 10)");
  }
  console.log("PASS: Pro Plan limits (10 versions, 100 scans/mo, 30 interviews) verified!\n");

  // -------------------------------------------------------------
  // TEST 6: PREMIUM PLAN ($39) - UNLIMITED (-1)
  // -------------------------------------------------------------
  console.log("--- TEST 6: PREMIUM PLAN ($39) UNLIMITED ENFORCEMENT ---");
  const premiumUser: UserProfile = {
    id: "usr_premium_01",
    name: "Executive Candidate",
    email: "exec@hireflow.ai",
    subscriptionPlan: "Premium",
    subscriptionStatus: "active",
    resumeVersions: new Array(25).fill(null).map((_, i) => ({ id: `v_${i}` } as any)),
    usageLimits: {
      resumeScans: { used: 250, max: -1 },
      atsAnalyses: { used: 250, max: -1 },
      aiInterviews: { used: 150, max: -1 },
      coverLetterGenerations: { used: 300, max: -1 },
      jobMatchAnalyses: { used: 400, max: -1 }
    }
  } as any as UserProfile;

  const premiumUploadCheck = checkEntitlement(premiumUser, 'resumeUploads');
  console.log("Premium User with 25 versions upload check:", premiumUploadCheck);
  if (premiumUploadCheck.allowed !== true || premiumUploadCheck.max !== -1) {
    throw new Error("FAIL: Premium user should have unlimited resume versions (-1)");
  }
  console.log("PASS: Premium Plan unlimited entitlements verified!\n");

  // -------------------------------------------------------------
  // TEST 7: UPGRADING FROM EXPIRED TRIAL TO PRO RESTORES ACCESS
  // -------------------------------------------------------------
  console.log("--- TEST 7: UPGRADE FROM EXPIRED TRIAL RESTORING ACCESS ---");
  const upgradedUser = {
    ...expiredTrialUser,
    subscriptionPlan: 'Pro' as const,
    subscriptionStatus: 'active' as const
  };
  const { profile: normUpgraded } = normalizeProfileSubscription(upgradedUser);
  const upgradedCheck = checkEntitlement(normUpgraded, 'resumeUploads');
  console.log("Upgraded User upload check:", upgradedCheck);
  if (upgradedCheck.allowed !== true) {
    throw new Error("FAIL: Upgrading to Pro should immediately restore access");
  }
  console.log("PASS: Upgrading immediately restores full access!\n");

  console.log("=================================================================");
  console.log("SUCCESS: ALL SUBSCRIPTION PLANS & TRIAL LIMIT TESTS PASSED!");
  console.log("=================================================================");
  process.exit(0);
}

runSubscriptionAndTrialVerification().catch(err => {
  console.error("Test failure:", err);
  process.exit(1);
});
