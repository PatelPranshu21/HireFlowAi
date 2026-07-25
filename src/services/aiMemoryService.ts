import { CentralCareerProfile, JobRecommendation } from '../types';

export class AiMemoryService {
  private static MEMORY_STORAGE_KEY = 'hireflow_ai_memory_v1';

  public static getMemory() {
    try {
      const stored = localStorage.getItem(this.MEMORY_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      // Fallback
    }
    return {
      interactedCompanies: [] as string[],
      likedTechnologies: [] as string[],
      appliedJobTitles: [] as string[],
      rejectedCompanies: [] as string[],
      interviewScoreTrend: [] as { date: string; score: number }[],
      frequentlySearchedKeywords: [] as string[]
    };
  }

  public static recordJobInteraction(
    type: 'save' | 'apply' | 'reject' | 'view',
    job: { title: string; company: string; tags?: string[] }
  ) {
    const memory = this.getMemory();
    if (type === 'apply' || type === 'save') {
      if (!memory.interactedCompanies.includes(job.company)) {
        memory.interactedCompanies.push(job.company);
      }
      if (!memory.appliedJobTitles.includes(job.title)) {
        memory.appliedJobTitles.push(job.title);
      }
      if (job.tags) {
        job.tags.forEach(tag => {
          if (!memory.likedTechnologies.includes(tag)) {
            memory.likedTechnologies.push(tag);
          }
        });
      }
    } else if (type === 'reject') {
      if (!memory.rejectedCompanies.includes(job.company)) {
        memory.rejectedCompanies.push(job.company);
      }
    }

    try {
      localStorage.setItem(this.MEMORY_STORAGE_KEY, JSON.stringify(memory));
    } catch (e) {
      console.error('Error saving AI Memory:', e);
    }
  }

  /**
   * Adjusts job recommendation match scores based on accumulated memory preferences
   */
  public static refineJobMatches(jobs: JobRecommendation[], profile: CentralCareerProfile): JobRecommendation[] {
    const memory = this.getMemory();
    const userSkills = profile.skills || [];
    const targetRoleLower = (profile.targetRole || '').toLowerCase();

    return jobs.map(job => {
      let baseScore = job.matchScore || 80;

      // 1. Boost score if user has applied to similar companies or titles
      if (memory.interactedCompanies.includes(job.company)) {
        baseScore += 5;
      }

      // 2. Penalize or hide rejected companies
      if (memory.rejectedCompanies.includes(job.company)) {
        baseScore -= 15;
      }

      // 3. Match against user skills
      const jobSkills = job.requiredSkills || job.tags || [];
      const matchingSkillsCount = jobSkills.filter(s =>
        userSkills.some(us => us.toLowerCase() === s.toLowerCase())
      ).length;

      if (jobSkills.length > 0) {
        const skillRatio = matchingSkillsCount / jobSkills.length;
        baseScore = Math.round((baseScore * 0.6) + (skillRatio * 100 * 0.4));
      }

      // 4. Match title against target role
      if (job.title.toLowerCase().includes('senior') && targetRoleLower.includes('senior')) {
        baseScore += 4;
      }

      const finalScore = Math.min(99, Math.max(60, baseScore));
      return {
        ...job,
        matchScore: finalScore,
        matchConfidence: finalScore >= 90 ? 'Very High' : (finalScore >= 80 ? 'High' : 'Moderate')
      };
    });
  }
}
