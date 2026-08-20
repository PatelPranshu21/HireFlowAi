import "dotenv/config";
import axios from 'axios';
import { DbJobRecord, dbSaveJobsDetailed, dbExpireStaleJobs } from '../src/db/postgres';
import { JobMatchingService } from '../src/services/jobMatchingService';

export const ADZUNA_TECH_QUERIES = [
  'software engineer',
  'software developer',
  'backend developer',
  'frontend developer',
  'full stack developer',
  'Python developer',
  'Java developer',
  'JavaScript developer',
  'React developer',
  'Node.js developer',
  'Django developer',
  'data analyst',
  'data scientist',
  'DevOps engineer',
  'cloud engineer',
  'machine learning engineer',
  'AI engineer',
  'QA engineer',
  'cybersecurity',
  'database engineer'
];

export interface AdzunaFetchOptions {
  country?: string;
  queries?: string[];
  resultsPerPage?: number;
  maxPagesPerQuery?: number;
  maxTotalJobs?: number;
  location?: string;
  category?: string;
  expireStale?: boolean;
}

export interface AdzunaIngestionStats {
  fetched: number;
  inserted: number;
  updated: number;
  skipped: number;
  expired: number;
}

/**
 * Strips HTML tags and unescapes standard HTML entities from Adzuna API strings.
 */
function cleanHtmlEntities(text: string): string {
  if (!text) return '';
  return text
    .replace(/<[^>]*>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Normalizes salary numbers into Indian Rupee (INR) display or standard currency.
 */
function formatSalary(salaryMin?: number, salaryMax?: number): string {
  if (salaryMin && salaryMax) {
    const minFormatted = Math.round(salaryMin).toLocaleString('en-IN');
    const maxFormatted = Math.round(salaryMax).toLocaleString('en-IN');
    return `₹${minFormatted} - ₹${maxFormatted} / yr`;
  }
  if (salaryMin) {
    return `₹${Math.round(salaryMin).toLocaleString('en-IN')} / yr`;
  }
  if (salaryMax) {
    return `Up to ₹${Math.round(salaryMax).toLocaleString('en-IN')} / yr`;
  }
  return 'Competitive';
}

export class ExternalJobFetcher {
  /**
   * Normalizes raw Adzuna listing into DbJobRecord format.
   */
  public static normalizeAdzunaJob(raw: any): DbJobRecord {
    const rawId = raw.id ? raw.id.toString() : '';
    const title = cleanHtmlEntities(raw.title || 'Software Engineer');
    const description = cleanHtmlEntities(raw.description || '');
    const companyName = cleanHtmlEntities(raw.company?.display_name || '').trim() || 'Unknown Company';
    const locationName = cleanHtmlEntities(raw.location?.display_name || 'India');
    const redirectUrl = raw.redirect_url || '';

    // Extract canonical skills
    const extractedSkills = JobMatchingService.extractSkills(`${title} ${description}`);

    // Determine employment type
    let employmentType = 'Full-Time';
    if (raw.contract_time === 'full_time') {
      employmentType = 'Full-Time';
    } else if (raw.contract_time === 'part_time') {
      employmentType = 'Part-Time';
    } else if (raw.contract_time === 'contract' || raw.contract_type === 'contract') {
      employmentType = 'Contract';
    }

    const salaryStr = formatSalary(raw.salary_min, raw.salary_max);
    const categoryLabel = cleanHtmlEntities(raw.category?.label || 'Technology & Software');

    return {
      id: `adzuna_${rawId}`,
      external_job_id: rawId,
      source: 'adzuna',
      company: companyName,
      title: title,
      location: locationName,
      description: description,
      url: redirectUrl,
      posted_at: raw.created ? new Date(raw.created).toISOString() : new Date().toISOString(),
      employment_type: employmentType,
      experience_required: '2+ Years',
      salary: salaryStr,
      skills: extractedSkills,
      tags: [categoryLabel, 'India Tech'],
      responsibilities: [],
      requirements: [],
      company_logo: null,
      company_website: null,
      industry: categoryLabel,
      is_active: true
    };
  }

  /**
   * Fetches real jobs from Adzuna API India and normalizes them.
   */
  public static async fetchAdzunaJobs(options: AdzunaFetchOptions = {}): Promise<DbJobRecord[]> {
    const appId = process.env.ADZUNA_APP_ID;
    const appKey = process.env.ADZUNA_APP_KEY;
    const country = options.country || process.env.ADZUNA_COUNTRY || 'in';

    if (!appId || !appKey) {
      console.warn('[AdzunaIngestion] ADZUNA_APP_ID or ADZUNA_APP_KEY is not configured in environment. Skipping live fetch.');
      return [];
    }

    const queries = options.queries && options.queries.length > 0 ? options.queries : ADZUNA_TECH_QUERIES;
    const resultsPerPage = Math.min(50, Math.max(10, options.resultsPerPage || 20));
    const maxPagesPerQuery = options.maxPagesPerQuery || 1;
    const maxTotalJobs = options.maxTotalJobs || 300;

    const collectedJobs: DbJobRecord[] = [];
    const seenExternalIds = new Set<string>();

    console.log(`[AdzunaIngestion] Starting Adzuna India job ingestion (country: ${country}, queries: ${queries.length}, resultsPerPage: ${resultsPerPage})...`);

    for (const query of queries) {
      if (collectedJobs.length >= maxTotalJobs) break;

      for (let page = 1; page <= maxPagesPerQuery; page++) {
        if (collectedJobs.length >= maxTotalJobs) break;

        try {
          const endpointUrl = `https://api.adzuna.com/v1/api/jobs/${country}/search/${page}`;
          const params: Record<string, any> = {
            app_id: appId,
            app_key: appKey,
            results_per_page: resultsPerPage,
            what: query,
            'content-type': 'application/json'
          };

          if (options.location) {
            params.where = options.location;
          }
          if (options.category) {
            params.category = options.category;
          }

          const response = await axios.get(endpointUrl, {
            params,
            timeout: 15000,
            headers: {
              'User-Agent': 'HireFlowAI/1.0 (JobIngestionService)'
            }
          });

          const results = response.data?.results;
          if (Array.isArray(results) && results.length > 0) {
            for (const raw of results) {
              if (!raw || !raw.id) continue;
              const extId = raw.id.toString();
              if (seenExternalIds.has(extId)) continue;
              seenExternalIds.add(extId);

              const normalized = this.normalizeAdzunaJob(raw);
              if (normalized.url && normalized.url !== '#') {
                collectedJobs.push(normalized);
              }

              if (collectedJobs.length >= maxTotalJobs) break;
            }
          }
        } catch (err: any) {
          const status = err.response?.status;
          const statusText = err.response?.statusText || err.message;
          // Never log credentials or full URL with secret query parameters
          console.error(`[AdzunaIngestion] API error for query "${query}" (page ${page}): ${status || 'Network Error'} - ${statusText}`);
          // If rate limited or unauthenticated, break outer loop gracefully
          if (status === 401 || status === 403 || status === 429) {
            console.warn(`[AdzunaIngestion] Halting further requests due to response status ${status}.`);
            return collectedJobs;
          }
        }
      }
    }

    console.log(`[AdzunaIngestion] Ingestion complete. Total unique jobs fetched: ${collectedJobs.length}.`);
    return collectedJobs;
  }

  /**
   * Main refresh function: fetches from Adzuna, deduplicates, upserts into PostgreSQL,
   * expires stale listings, and returns detailed ingestion statistics.
   */
  public static async refreshAdzunaJobs(options: AdzunaFetchOptions = {}): Promise<AdzunaIngestionStats> {
    const jobs = await this.fetchAdzunaJobs(options);
    const fetched = jobs.length;

    if (fetched === 0) {
      return {
        fetched: 0,
        inserted: 0,
        updated: 0,
        skipped: 0,
        expired: 0
      };
    }

    // Upsert into PostgreSQL with deduplication on (id) and (source, external_job_id)
    const upsertStats = await dbSaveJobsDetailed(jobs);

    let expired = 0;
    if (options.expireStale) {
      const activeIds = jobs.map(j => j.external_job_id).filter(Boolean) as string[];
      expired = await dbExpireStaleJobs(activeIds, 'adzuna');
    }

    return {
      fetched,
      inserted: upsertStats.inserted,
      updated: upsertStats.updated,
      skipped: upsertStats.skipped,
      expired
    };
  }

  /**
   * Backward-compatible syncJobs helper returning total upserted count.
   */
  public static async syncJobs(): Promise<number> {
    const stats = await this.refreshAdzunaJobs({ expireStale: false });
    return stats.inserted + stats.updated;
  }

  /**
   * Normalizes manual bulk JSON payloads for admin upload.
   */
  public static normalizeManualJobs(jobsPayload: any[]): DbJobRecord[] {
    return jobsPayload.map((raw, index) => {
      const title = cleanHtmlEntities(raw.title || 'Software Engineer');
      const description = cleanHtmlEntities(raw.description || '');
      const company = cleanHtmlEntities(raw.company || 'Unknown Company');
      const location = cleanHtmlEntities(raw.location || 'India');
      const extId = raw.external_job_id ? raw.external_job_id.toString() : `manual_${Date.now()}_${index}`;
      const url = raw.url || raw.applyUrl || raw.redirect_url || '';

      const extractedSkills = raw.skills && raw.skills.length > 0 
        ? raw.skills.map((s: string) => JobMatchingService.normalizeSkillName(s))
        : JobMatchingService.extractSkills(`${title} ${description}`);

      return {
        id: raw.id || `manual_${extId}`,
        external_job_id: extId,
        source: raw.source || 'manual_ingest',
        company,
        title,
        location,
        description,
        url,
        posted_at: raw.posted_at || new Date().toISOString(),
        employment_type: raw.employment_type || 'Full-Time',
        experience_required: raw.experience_required || '2+ Years',
        salary: raw.salary || 'Competitive',
        skills: Array.from(new Set(extractedSkills)) as string[],
        tags: raw.tags || ['Technology'],
        responsibilities: raw.responsibilities || [],
        requirements: raw.requirements || [],
        company_logo: raw.company_logo || null,
        company_website: raw.company_website || null,
        industry: raw.industry || 'Technology & Software',
        is_active: raw.is_active !== false
      };
    });
  }
}
