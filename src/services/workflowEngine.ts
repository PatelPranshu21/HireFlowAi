import {
  CentralCareerProfile,
  JobRecommendation,
  ApplicationCard,
  NotificationItem,
  ActivityLog,
  ProactiveCoachMessage,
  TaskItem,
  ResumeVersion
} from '../types';
import { EmployabilityScoreService } from './employabilityScoreService';
import { AiMemoryService } from './aiMemoryService';
import { CalendarService } from './calendarService';

export interface WorkflowResult {
  updatedProfile: CentralCareerProfile;
  updatedJobs: JobRecommendation[];
  updatedApplications: ApplicationCard[];
  updatedNotifications: NotificationItem[];
  updatedActivities: ActivityLog[];
  updatedTasks: TaskItem[];
  newCoachMessage?: ProactiveCoachMessage;
}

export class WorkflowEngine {
  /**
   * Event Pipeline 1: RESUME_UPDATED
   * Triggered whenever a user uploads, parses, or edits a resume version.
   */
  public static handleResumeUpdated(
    profile: CentralCareerProfile,
    jobs: JobRecommendation[],
    applications: ApplicationCard[],
    notifications: NotificationItem[],
    activities: ActivityLog[],
    tasks: TaskItem[],
    resumeFileText: string,
    fileName: string,
    parsedSkills?: string[]
  ): WorkflowResult {
    // 1. Calculate new ATS score & extract skills
    const newAtsScore = Math.min(98, (profile.atsScore || 85) + 3);
    const newSkills = Array.from(new Set([
      ...(profile.skills || []),
      ...(parsedSkills || ['System Architecture', 'Microservices', 'Kafka', 'Redis', 'Docker'])
    ]));

    // 2. Add new Resume Version & Upload History
    const newVersion: ResumeVersion = {
      id: `ver_${Date.now()}`,
      versionName: fileName,
      fileName,
      uploadedAt: 'Just now',
      score: newAtsScore,
      content: resumeFileText
    };

    const updatedVersions = [newVersion, ...(profile.resumeVersions || [])];

    // 3. Update profile draft
    const profileDraft: CentralCareerProfile = {
      ...profile,
      resumeText: resumeFileText || profile.resumeText || '',
      atsScore: newAtsScore,
      skills: newSkills,
      resumeVersions: updatedVersions,
      hasUploadedResume: true
    };

    // 4. Recalculate Employability & Readiness Scores
    const newAnalytics = EmployabilityScoreService.calculateScores(profileDraft);
    profileDraft.analytics = newAnalytics;

    // 5. Refresh Job Recommendations & recalculate match scores
    const refreshedJobs = AiMemoryService.refineJobMatches(jobs, profileDraft);

    // 6. Push Notification
    const newNotification: NotificationItem = {
      id: `notif_${Date.now()}`,
      title: 'Resume analysed',
      message: `Your resume "${fileName}" was analysed. ATS Score: ${newAtsScore}%. ${refreshedJobs.filter(j => j.matchScore >= 90).length} high-match job opportunities updated!`,
      time: 'Just now',
      read: false,
      type: 'success'
    };

    // 7. Add Activity Log
    const newActivity: ActivityLog = {
      id: `act_${Date.now()}`,
      title: `Resume Updated: ${fileName}`,
      subtitle: `ATS Score: ${newAtsScore}% • Matched ${refreshedJobs.length} jobs`,
      timestamp: 'Just now',
      type: 'analysis'
    };

    // 8. Auto-generated Task
    const newTask: TaskItem = {
      id: `task_${Date.now()}`,
      title: `Review ${refreshedJobs.length} refreshed jobs matching updated resume`,
      tag: 'Ecosystem Workflow',
      tagColor: '#0052ff',
      completed: false
    };

    // 9. Proactive Coach Insight
    const newCoachMessage: ProactiveCoachMessage = {
      id: `coach_${Date.now()}`,
      type: 'milestone',
      message: `Great progress! Your ATS Score increased to ${newAtsScore}%. You are now highly eligible for ${refreshedJobs.filter(j => j.matchScore >= 85).length} Senior Full Stack & Staff roles!`,
      actionText: 'Explore Recommended Jobs',
      actionTab: 'job-suite',
      timestamp: 'Just now'
    };

    return {
      updatedProfile: profileDraft,
      updatedJobs: refreshedJobs,
      updatedApplications: applications,
      updatedNotifications: [newNotification, ...notifications],
      updatedActivities: [newActivity, ...activities],
      updatedTasks: [newTask, ...tasks],
      newCoachMessage
    };
  }

  /**
   * Event Pipeline 2: JOB_APPLIED
   * Triggered whenever a user applies for a job in Job Hub or Dashboard.
   */
  public static handleJobApplied(
    profile: CentralCareerProfile,
    jobs: JobRecommendation[],
    applications: ApplicationCard[],
    notifications: NotificationItem[],
    activities: ActivityLog[],
    tasks: TaskItem[],
    job: { id: string; title: string; company: string; companyLogo?: string; location?: string; salary?: string }
  ): WorkflowResult {
    // 1. Record AI Memory
    AiMemoryService.recordJobInteraction('apply', {
      title: job.title,
      company: job.company
    });

    // 2. Schedule Calendar Events (Study session, mock interview, follow up)
    CalendarService.scheduleJobApplicationWorkflow(job.title, job.company, job.id);

    // 3. Create or update Application Card
    const existingIndex = applications.findIndex(a => a.id === job.id || (a.jobTitle === job.title && a.company === job.company));
    let updatedApplications = [...applications];

    if (existingIndex >= 0) {
      updatedApplications[existingIndex] = {
        ...updatedApplications[existingIndex],
        status: 'applied',
        appliedDate: 'Today',
        timeAgo: 'Just now'
      };
    } else {
      const newCard: ApplicationCard = {
        id: job.id || `app_${Date.now()}`,
        jobTitle: job.title,
        company: job.company,
        companyLogo: job.companyLogo || 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?auto=format&fit=crop&q=80&w=100',
        status: 'applied',
        locationType: 'Remote',
        appliedDate: 'Today',
        timeAgo: 'Just now',
        salaryOffered: job.salary || '$160,000 - $210,000',
        aiAnalyzed: true,
        matchScore: 92
      };
      updatedApplications = [newCard, ...updatedApplications];
    }

    // 4. Update Profile Applied IDs
    const updatedAppliedIds = Array.from(new Set([...(profile.appliedJobIds || []), job.id]));
    const profileDraft: CentralCareerProfile = {
      ...profile,
      appliedJobIds: updatedAppliedIds
    };

    // 5. Recalculate Scores
    profileDraft.analytics = EmployabilityScoreService.calculateScores(profileDraft);

    // 6. Push Notification
    const newNotif: NotificationItem = {
      id: `notif_${Date.now()}`,
      title: 'Application submitted',
      message: `Your application for ${job.title} at ${job.company} has been submitted. Automated study sessions and interview reminders created.`,
      time: 'Just now',
      read: false,
      type: 'success'
    };

    // 7. Activity Log
    const newAct: ActivityLog = {
      id: `act_${Date.now()}`,
      title: `Applied to ${job.title} at ${job.company}`,
      subtitle: 'Interview preparation roadmap created • Just now',
      timestamp: 'Just now',
      type: 'application'
    };

    // 8. Auto Task
    const newTask: TaskItem = {
      id: `task_${Date.now()}`,
      title: `Prepare ${job.company} Company Prep & System Design questions`,
      tag: 'Interview Hub',
      tagColor: '#571bc1',
      completed: false
    };

    // 9. Coach Message
    const newCoachMessage: ProactiveCoachMessage = {
      id: `coach_${Date.now()}`,
      type: 'recommendation',
      message: `Application submitted for ${job.title} at ${job.company}! I've generated an automated interview prep plan and added study sessions to your Calendar.`,
      actionText: 'View Interview Prep',
      actionTab: 'interviews',
      timestamp: 'Just now'
    };

    return {
      updatedProfile: profileDraft,
      updatedJobs: jobs,
      updatedApplications,
      updatedNotifications: [newNotif, ...notifications],
      updatedActivities: [newAct, ...activities],
      updatedTasks: [newTask, ...tasks],
      newCoachMessage
    };
  }

  /**
   * Event Pipeline 3: CERTIFICATION_COMPLETED
   * Triggered whenever a user completes a course or certification.
   */
  public static handleCertificationCompleted(
    profile: CentralCareerProfile,
    jobs: JobRecommendation[],
    notifications: NotificationItem[],
    activities: ActivityLog[],
    certName: string
  ) {
    const updatedCerts = Array.from(new Set([...(profile.certifications || []), certName]));
    const updatedEarned = Array.from(new Set([...(profile.certificationsEarned || []), certName]));
    const updatedSkills = Array.from(new Set([...(profile.skills || []), certName.replace('AWS', '').replace('Certified', '').trim()]));

    const profileDraft: CentralCareerProfile = {
      ...profile,
      certifications: updatedCerts,
      certificationsEarned: updatedEarned,
      skills: updatedSkills
    };

    profileDraft.analytics = EmployabilityScoreService.calculateScores(profileDraft);
    const refreshedJobs = AiMemoryService.refineJobMatches(jobs, profileDraft);

    const newNotif: NotificationItem = {
      id: `notif_${Date.now()}`,
      title: `Certification Milestone: ${certName}`,
      message: `Your skill portfolio and Employability Score updated. Job match confidence boosted!`,
      time: 'Just now',
      read: false,
      type: 'success'
    };

    const newAct: ActivityLog = {
      id: `act_${Date.now()}`,
      title: `Earned Certification: ${certName}`,
      subtitle: `Employability Score: ${profileDraft.analytics.employabilityScore}% • Just now`,
      timestamp: 'Just now',
      type: 'alert'
    };

    const newCoachMessage: ProactiveCoachMessage = {
      id: `coach_${Date.now()}`,
      type: 'success',
      message: `Congratulations on completing ${certName}! Your Employability Score increased to ${profileDraft.analytics.employabilityScore}%.`,
      actionText: 'View Career Analytics',
      actionTab: 'dashboard',
      timestamp: 'Just now'
    };

    return {
      updatedProfile: profileDraft,
      updatedJobs: refreshedJobs,
      updatedNotifications: [newNotif, ...notifications],
      updatedActivities: [newAct, ...activities],
      newCoachMessage
    };
  }
}
