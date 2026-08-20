import "dotenv/config";
import { dbGetAllJobs, DbJobRecord } from '../src/db/postgres';
import { ExternalJobFetcher, AdzunaFetchOptions, AdzunaIngestionStats } from './externalJobFetcher';

export class JobIngestionService {
  private static isInitialized = false;
  private static syncPromise: Promise<AdzunaIngestionStats> | null = null;

  /**
   * Ensures the database has real active jobs ingested from Adzuna.
   * Never injects mock or fake job listings.
   */
  public static async ensureJobsIngested(): Promise<number> {
    try {
      const existing = await dbGetAllJobs();
      
      // If we already have active jobs in PostgreSQL, mark initialized and return
      if (existing.length > 0) {
        this.isInitialized = true;
        return existing.length;
      }

      // If database is empty and Adzuna credentials are provided, trigger initial live ingestion
      if (process.env.ADZUNA_APP_ID && process.env.ADZUNA_APP_KEY) {
        console.log(`[JobIngestionService] Database has 0 active jobs. Triggering initial Adzuna India job sync...`);
        await this.refreshAdzunaJobs({ resultsPerPage: 25, maxPagesPerQuery: 1 });
        const refreshed = await dbGetAllJobs();
        this.isInitialized = true;
        return refreshed.length;
      }

      this.isInitialized = true;
      return 0;
    } catch (err) {
      console.error('[JobIngestionService] Error during ensureJobsIngested:', err);
      return 0;
    }
  }

  /**
   * Refreshes real jobs from Adzuna and updates PostgreSQL catalog.
   */
  public static async refreshAdzunaJobs(options: AdzunaFetchOptions = {}): Promise<AdzunaIngestionStats> {
    // Deduplicate concurrent refresh calls
    if (this.syncPromise) {
      return this.syncPromise;
    }

    this.syncPromise = (async () => {
      try {
        const stats = await ExternalJobFetcher.refreshAdzunaJobs(options);
        console.log(`[JobIngestionService] Refresh stats: Fetched=${stats.fetched}, Inserted=${stats.inserted}, Updated=${stats.updated}, Skipped=${stats.skipped}, Expired=${stats.expired}`);
        return stats;
      } finally {
        this.syncPromise = null;
      }
    })();

    return this.syncPromise;
  }

  /**
   * Retrieves all active jobs from PostgreSQL.
   * Returns empty array if none exist; never falls back to mock jobs.
   */
  public static async getAvailableJobs(): Promise<DbJobRecord[]> {
    if (!this.isInitialized) {
      await this.ensureJobsIngested();
    }
    return dbGetAllJobs();
  }
}
