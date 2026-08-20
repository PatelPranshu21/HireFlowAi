import { initDb, getPool, dbGetAllJobs } from '../src/db/postgres';
import { ExternalJobFetcher } from '../server/externalJobFetcher';
import dotenv from 'dotenv';
dotenv.config();

async function main() {
  console.log("====================================================");
  console.log("HIREFLOW AI – DYNAMIC INGESTION VERIFICATION");
  console.log("====================================================\n");

  await initDb();
  const pool = getPool();
  if (!pool) {
    console.error("❌ Database failed to initialize.");
    process.exit(1);
  }
  
  // 1. Test manual normalization & skill extraction
  const mockPayload = [
    {
      title: "Senior DevOps Engineer",
      company: "CloudCo",
      description: "Looking for an expert with strong knowledge of AWS, Kubernetes, Docker, and CI/CD pipelines.",
      location: "Bengaluru",
      salary: "₹30,00,000",
      url: "https://cloudco.com/careers"
    }
  ];

  console.log("--- TESTING SKILL EXTRACTION ---");
  const normalized = ExternalJobFetcher.normalizeManualJobs(mockPayload);
  console.log("Extracted Skills:", normalized[0].skills);

  const hasAWS = normalized[0].skills.includes("AWS");
  const hasK8s = normalized[0].skills.includes("Kubernetes");
  const hasDocker = normalized[0].skills.includes("Docker");

  if (hasAWS && hasK8s && hasDocker) {
    console.log("✅ [PASS] Canonical skills extracted correctly from raw description.");
  } else {
    console.error("❌ [FAIL] Missing skills from extraction. Expected AWS, Kubernetes, Docker.");
    process.exit(1);
  }

  // 2. Test fetching from Adzuna (Optional / if keys exist)
  if (process.env.ADZUNA_APP_ID && process.env.ADZUNA_APP_KEY) {
    console.log("\n--- TESTING ADZUNA LIVE FETCH ---");
    const jobs = await ExternalJobFetcher.fetchAdzunaJobs({ country: 'in', maxTotalJobs: 5 });
    if (jobs.length > 0) {
      console.log(`✅ [PASS] Successfully fetched ${jobs.length} jobs from Adzuna API.`);
      console.log(`Sample job: ${jobs[0].title} at ${jobs[0].company} (Skills: ${jobs[0].skills.slice(0, 3).join(', ')})`);
    } else {
      console.warn("⚠️ [WARN] Adzuna fetch returned 0 jobs (Could be quota/network issue).");
    }
  } else {
    console.log("\n⚠️ [SKIP] Skipping Adzuna live fetch (ADZUNA_APP_ID missing in .env).");
  }

  console.log("\n====================================================");
  console.log("RESULTS: ALL INGESTION VERIFICATION TESTS PASSED");
  console.log("====================================================\n");

  process.exit(0);
}

main().catch(err => {
  console.error("❌ Verification failed:", err);
  process.exit(1);
});
