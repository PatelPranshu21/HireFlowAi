import { CentralCareerProfile, AnalyticsScores } from '../types';

export class EmployabilityScoreService {
  /**
   * Dynamically calculates the global Employability Score (0-100),
   * Career Readiness Score (0-100), AI Match Score, Strengths, Weaknesses,
   * and Priority Improvements based on the user's Central Career Profile.
   */
  public static calculateScores(profile: CentralCareerProfile): AnalyticsScores {
    // 1. Resume & ATS Quality (30% weight)
    const atsScore = profile.atsScore || 0;
    const resumeWeight = (atsScore / 100) * 30;

    // 2. Skills & Technologies Breadth (25% weight)
    const skillCount = (profile.skills || []).length;
    const techCount = (profile.technologies || []).length;
    const skillScore = Math.min(100, (skillCount * 5) + (techCount * 3));
    const skillWeight = (skillScore / 100) * 25;

    // 3. Interview Performance (20% weight)
    const mockScores = profile.interviewMetrics || {
      mockScoreOverall: 75,
      technicalScore: 75,
      behavioralScore: 80,
      systemDesignScore: 70
    };
    const avgInterviewScore = (
      mockScores.mockScoreOverall +
      mockScores.technicalScore +
      mockScores.behavioralScore +
      mockScores.systemDesignScore
    ) / 4;
    const interviewWeight = (avgInterviewScore / 100) * 20;

    // 4. Projects & Certifications (15% weight)
    const projectCount = (profile.projects || []).length;
    const certCount = (profile.certifications || []).length;
    const certsEarnedCount = (profile.certificationsEarned || []).length;
    const projectScore = Math.min(100, (projectCount * 30) + ((certCount + certsEarnedCount) * 25));
    const projectWeight = (projectScore / 100) * 15;

    // 5. Learning Progress & Applications Activity (10% weight)
    const completedCourses = (profile.coursesCompleted || []).length;
    const activeApps = (profile.appliedJobIds || []).length;
    const activityScore = Math.min(100, 50 + (completedCourses * 15) + (activeApps * 10));
    const activityWeight = (activityScore / 100) * 10;

    // Sum overall score
    const totalEmployability = Math.round(
      resumeWeight + skillWeight + interviewWeight + projectWeight + activityWeight
    );

    // Career Readiness
    const careerReadiness = Math.round((atsScore * 0.4) + (avgInterviewScore * 0.4) + (skillScore * 0.2));

    // AI Match Score average across roles
    const aiMatchScore = Math.min(99, Math.round((totalEmployability * 0.7) + (atsScore * 0.3)));

    // Generate Strengths
    const strengths: string[] = [];
    if (atsScore >= 85) strengths.push(`High ATS Resume Optimization (${atsScore}/100) with key action metrics.`);
    if (skillCount >= 10) strengths.push(`Extensive technology stack (${skillCount} verified skills & frameworks).`);
    if (avgInterviewScore >= 80) strengths.push(`Strong Mock Interview Performance (${Math.round(avgInterviewScore)}% avg score).`);
    if (projectCount >= 2 || certCount >= 1) strengths.push(`Verified portfolio projects and cloud certifications.`);
    if (strengths.length < 3) strengths.push('Active job applications and ongoing career roadmap updates.');

    // Generate Weaknesses
    const weaknesses: string[] = [];
    if (atsScore < 85) weaknesses.push('Resume ATS score can be optimized by adding missing key industry terms.');
    if (mockScores.systemDesignScore < 80) weaknesses.push(`System Design interview readiness is at ${mockScores.systemDesignScore}%.`);
    if (skillCount < 8) weaknesses.push('Skill portfolio would benefit from additional cloud/DevOps frameworks.');
    if (certCount === 0) weaknesses.push('No cloud or framework certifications listed yet.');
    if (weaknesses.length === 0) weaknesses.push('Ensure experience bullet points include dollar impact or latency metrics.');

    // Priority Improvements
    const priorityImprovements: string[] = [];
    if (atsScore < 90) priorityImprovements.push('Tailor resume bullet points using AI Tailoring Engine for +5% ATS increase');
    if (mockScores.systemDesignScore < 85) priorityImprovements.push('Complete System Design & Microservices study module');
    if (certCount < 2) priorityImprovements.push('Earn AWS or Kubernetes certification to unlock top-tier roles (+12% match boost)');
    if (profile.appliedJobIds.length < 5) priorityImprovements.push('Apply to 3 recommended high-match software positions this week');

    return {
      employabilityScore: Math.min(99, Math.max(50, totalEmployability)),
      careerReadinessScore: Math.min(99, Math.max(50, careerReadiness)),
      aiMatchScore: Math.min(99, Math.max(50, aiMatchScore)),
      strengths,
      weaknesses,
      priorityImprovements
    };
  }
}
