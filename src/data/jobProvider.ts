import { CompanyInfo, JobRecommendation, UserProfile } from '../types';
import { JobMatchingService } from '../services/jobMatchingService';

export const mockCompanies: CompanyInfo[] = [];
export const mockJobsList: JobRecommendation[] = [];

// Helper: Calculate deterministic match score dynamically based on user profile and preferences
export function calculateDynamicMatchScore(job: JobRecommendation, user: UserProfile): {
  score: number;
  confidence: 'Very High' | 'High' | 'Moderate' | 'Low';
  matchingSkills: string[];
  missingSkills: string[];
  reason: string;
} {
  const resumeText = user.resumeText || user.primaryResumeText || '';
  const skills = user.skills || [];

  const match = JobMatchingService.calculateJobMatch(
    resumeText,
    skills,
    job
  );

  return {
    score: match.matchScore,
    confidence: match.confidence,
    matchingSkills: match.matchedSkills,
    missingSkills: match.missingSkills,
    reason: match.whyMatch
  };
}

// Generate job recommendations tailored specifically to the active resume's content, skills, and target role
export function getRecommendationsForResume(
  jobs: JobRecommendation[],
  resumeText: string,
  skills: string[],
  targetRole: string = 'Software Engineer'
): JobRecommendation[] {
  return JobMatchingService.matchResumeAgainstJobs(resumeText, skills, jobs, targetRole);
}
