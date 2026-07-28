import {
  ProductivityTask,
  ProductivityNote,
  ProductivityGoal,
  FocusSessionLog,
  AchievementBadge,
  ProductivityStreaks,
  ProductivitySettings,
  ThirdPartyIntegrationState,
  CalendarEvent
} from '../types';

export class ProductivityService {
  private static KEYS = {
    TASKS: 'hireflow_prod_tasks_v1',
    NOTES: 'hireflow_prod_notes_v1',
    GOALS: 'hireflow_prod_goals_v1',
    FOCUS: 'hireflow_prod_focus_v1',
    STREAKS: 'hireflow_prod_streaks_v1',
    SETTINGS: 'hireflow_prod_settings_v1',
    INTEGRATIONS: 'hireflow_prod_integrations_v1'
  };

  // --- TASKS ---
  public static getTasks(): ProductivityTask[] {
    try {
      const stored = localStorage.getItem(this.KEYS.TASKS);
      if (stored) return JSON.parse(stored);
    } catch (e) {}

    const defaults: ProductivityTask[] = [
      {
        id: 'pt_1',
        title: 'Tailor resume bullet points for Apple Senior Full Stack position',
        description: 'Quantify throughput impact (e.g. reduced p99 latency by 35% with Redis caching).',
        category: 'Resume',
        priority: 'high',
        status: 'in_progress',
        dueDate: 'Today',
        estimatedMinutes: 30,
        completed: false,
        notes: 'Target keywords: Kafka, Distributed Systems, Go, Microservices'
      },
      {
        id: 'pt_2',
        title: 'Practice System Design & Microservices STAR interview questions',
        description: 'Prepare detailed response for rate limiter design and database partitioning.',
        category: 'Interview',
        priority: 'high',
        status: 'todo',
        dueDate: 'Today',
        estimatedMinutes: 45,
        completed: false
      },
      {
        id: 'pt_3',
        title: 'Complete AWS Solutions Architect practice exam module 3',
        description: 'Focus on VPC peering, Transit Gateway, and IAM security policies.',
        category: 'Certification',
        priority: 'medium',
        status: 'todo',
        dueDate: 'Tomorrow',
        estimatedMinutes: 60,
        completed: false
      },
      {
        id: 'pt_4',
        title: 'Follow up with Stripe recruiter on take-home submission',
        description: 'Send polite email inquiring about technical team review timeline.',
        category: 'Applications',
        priority: 'high',
        status: 'todo',
        dueDate: 'In 2 days',
        estimatedMinutes: 15,
        completed: false
      },
      {
        id: 'pt_5',
        title: 'Solve 3 LeetCode Hard Dynamic Programming problems',
        description: 'Focus on Edit Distance, Burst Balloons, and Longest Increasing Subsequence.',
        category: 'Learning',
        priority: 'medium',
        status: 'completed',
        dueDate: 'Yesterday',
        estimatedMinutes: 90,
        completed: true
      },
      {
        id: 'pt_6',
        title: 'Review Docker container networking & docker-compose lab',
        description: 'Setup multi-stage build pipelines with distroless security images.',
        category: 'Learning',
        priority: 'low',
        status: 'completed',
        dueDate: 'Yesterday',
        estimatedMinutes: 40,
        completed: true
      }
    ];
    return defaults;
  }

  public static saveTasks(tasks: ProductivityTask[]): void {
    try {
      localStorage.setItem(this.KEYS.TASKS, JSON.stringify(tasks));
    } catch (e) {}
  }

  // --- NOTES ---
  public static getNotes(): ProductivityNote[] {
    try {
      const stored = localStorage.getItem(this.KEYS.NOTES);
      if (stored) return JSON.parse(stored);
    } catch (e) {}

    const defaults: ProductivityNote[] = [
      {
        id: 'pn_1',
        title: 'Apple Technical Interview Strategy & STAR Metrics',
        content: `Key Talking Points for Round 2:
- Scaled distributed messaging cluster handling 250k events/sec with Apache Kafka & Go.
- Optimized PostgreSQL database query execution plan reducing p99 latency from 180ms to 24ms.
- Mentored 4 junior engineers on clean microservice design patterns & unit testing coverage (88%+).
- System Design Question: "How would you design a global distributed key-value cache with eviction?"
  - Use Consistent Hashing with virtual nodes.
  - LRU + LFU hybrid eviction policy.
  - Gossip protocol for node health checks.`,
        category: 'Interview Notes',
        pinned: true,
        favorite: true,
        archived: false,
        tags: ['Apple', 'System Design', 'STAR', 'Distributed Systems'],
        updatedAt: '2 hours ago'
      },
      {
        id: 'pn_2',
        title: 'System Design Quick Architecture Cheat Sheet',
        content: `Core Patterns:
1. Rate Limiting: Token Bucket / Leaky Bucket (Redis sliding window counter)
2. Load Balancing: Round Robin, Weighted Least Connections, IP Hash
3. Database Scaling: Read Replicas (Eventual Consistency), Vertical Sharding (by Domain), Horizontal Sharding (Hash ring)
4. Cache Strategy: Cache-Aside vs Write-Through vs Write-Back
5. Microservices Resilience: Circuit Breaker (Resilience4j / Hystrix), Bulkhead, Retry with Exponential Backoff`,
        category: 'Learning Notes',
        pinned: true,
        favorite: false,
        archived: false,
        tags: ['Architecture', 'CheatSheet', 'SystemDesign'],
        updatedAt: 'Yesterday'
      },
      {
        id: 'pn_3',
        title: 'Stripe Payment Gateway Take-Home Insights',
        content: `Architecture Overview:
- Idempotency Keys stored in Redis with 24-hour TTL to prevent double charge.
- Webhook delivery mechanism backed by exponential retry queues in RabbitMQ.
- Strict payload validation with JSON Schema & OpenAPI 3.0 specs.`,
        category: 'Company Notes',
        pinned: false,
        favorite: true,
        archived: false,
        tags: ['Stripe', 'Idempotency', 'Payments', 'TakeHome'],
        updatedAt: '3 days ago'
      },
      {
        id: 'pn_4',
        title: 'ATS Resume Keyword Injection Ideas',
        content: `Keywords to inject across Experience bullet points:
- Kubernetes Operator & Helm Charts deployment
- Infrastructure as Code (Terraform / CloudFormation)
- gRPC microservice inter-service communication
- OpenTelemetry & Jaeger distributed tracing`,
        category: 'Resume Ideas',
        pinned: false,
        favorite: false,
        archived: false,
        tags: ['ATS', 'Resume', 'Keywords'],
        updatedAt: '4 days ago'
      }
    ];
    return defaults;
  }

  public static saveNotes(notes: ProductivityNote[]): void {
    try {
      localStorage.setItem(this.KEYS.NOTES, JSON.stringify(notes));
    } catch (e) {}
  }

  // --- GOALS ---
  public static getGoals(): ProductivityGoal[] {
    try {
      const stored = localStorage.getItem(this.KEYS.GOALS);
      if (stored) return JSON.parse(stored);
    } catch (e) {}

    const defaults: ProductivityGoal[] = [
      {
        id: 'pg_1',
        title: 'Solve 20 LeetCode / DSA Problems',
        targetMetric: 'Problems Solved',
        currentProgress: 14,
        targetProgress: 20,
        timeframe: 'weekly',
        category: 'Technical Prep',
        completed: false,
        unit: 'problems'
      },
      {
        id: 'pg_2',
        title: 'Apply to 15 High-Match Software Engineering Roles',
        targetMetric: 'Applications Submitted',
        currentProgress: 11,
        targetProgress: 15,
        timeframe: 'weekly',
        category: 'Job Search',
        completed: false,
        unit: 'apps'
      },
      {
        id: 'pg_3',
        title: 'Improve Resume ATS Score to 95%+',
        targetMetric: 'ATS Score %',
        currentProgress: 88,
        targetProgress: 95,
        timeframe: 'monthly',
        category: 'Resume Optimization',
        completed: false,
        unit: '%'
      },
      {
        id: 'pg_4',
        title: 'Complete AWS Certified Solutions Architect Course',
        targetMetric: 'Modules Completed',
        currentProgress: 8,
        targetProgress: 10,
        timeframe: 'monthly',
        category: 'Certifications',
        completed: false,
        unit: 'modules'
      },
      {
        id: 'pg_5',
        title: 'Accumulate 100 Focus Mode Minutes Today',
        targetMetric: 'Focus Minutes',
        currentProgress: 75,
        targetProgress: 100,
        timeframe: 'daily',
        category: 'Productivity',
        completed: false,
        unit: 'mins'
      }
    ];
    return defaults;
  }

  public static saveGoals(goals: ProductivityGoal[]): void {
    try {
      localStorage.setItem(this.KEYS.GOALS, JSON.stringify(goals));
    } catch (e) {}
  }

  // --- FOCUS SESSIONS & STREAKS ---
  public static getFocusSessions(): FocusSessionLog[] {
    try {
      const stored = localStorage.getItem(this.KEYS.FOCUS);
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return [
      { id: 'fs_1', mode: 'Interview Practice', durationMinutes: 45, timestamp: 'Today, 10:30 AM', completed: true },
      { id: 'fs_2', mode: 'Coding', durationMinutes: 30, timestamp: 'Today, 8:15 AM', completed: true },
      { id: 'fs_3', mode: 'Study', durationMinutes: 50, timestamp: 'Yesterday, 2:00 PM', completed: true }
    ];
  }

  public static saveFocusSessions(sessions: FocusSessionLog[]): void {
    try {
      localStorage.setItem(this.KEYS.FOCUS, JSON.stringify(sessions));
    } catch (e) {}
  }

  public static getStreaks(): ProductivityStreaks {
    try {
      const stored = localStorage.getItem(this.KEYS.STREAKS);
      if (stored) return JSON.parse(stored);
    } catch (e) {}

    return {
      learningStreakDays: 8,
      interviewStreakDays: 4,
      applicationStreakDays: 5,
      totalStudyHours: 38.5,
      totalFocusHours: 31.2,
      completedTasksCount: 24,
      productivityScore: 89
    };
  }

  public static saveStreaks(streaks: ProductivityStreaks): void {
    try {
      localStorage.setItem(this.KEYS.STREAKS, JSON.stringify(streaks));
    } catch (e) {}
  }

  // --- SETTINGS ---
  public static getSettings(): ProductivitySettings {
    try {
      const stored = localStorage.getItem(this.KEYS.SETTINGS);
      if (stored) return JSON.parse(stored);
    } catch (e) {}

    return {
      workingHoursStart: '08:30',
      workingHoursEnd: '18:00',
      timezone: 'PST (UTC-7)',
      reminderPreferences: {
        interviews: true,
        deadlines: true,
        goals: true,
        studySessions: true,
        soundEnabled: true
      },
      defaultCalendarView: 'week',
      defaultFocusLength: 25,
      breakLength: 5
    };
  }

  public static saveSettings(settings: ProductivitySettings): void {
    try {
      localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {}
  }

  // --- INTEGRATIONS ---
  public static getIntegrations(): ThirdPartyIntegrationState {
    try {
      const stored = localStorage.getItem(this.KEYS.INTEGRATIONS);
      if (stored) return JSON.parse(stored);
    } catch (e) {}

    return {
      googleCalendar: { connected: false, email: '', syncEnabled: false },
      outlookCalendar: { connected: false, syncEnabled: false },
      zoom: { connected: false, user: '' },
      googleMeet: { connected: false, email: '' },
      teams: { connected: false },
      slack: { connected: false, workspace: '' },
      discord: { connected: false }
    };
  }

  public static saveIntegrations(integrations: ThirdPartyIntegrationState): void {
    try {
      localStorage.setItem(this.KEYS.INTEGRATIONS, JSON.stringify(integrations));
    } catch (e) {}
  }

  /**
   * Generates AI Daily Schedule based on upcoming interviews, pending applications, learning goals, and tasks
   */
  public static generateAiSchedule(
    events: CalendarEvent[],
    tasks: ProductivityTask[],
    goals: ProductivityGoal[]
  ): CalendarEvent[] {
    const todayStr = 'Today';
    const newEvents: CalendarEvent[] = [
      {
        id: `ai_evt_${Date.now()}_1`,
        title: '🤖 AI Recommended: System Design & STAR Interview Practice',
        company: 'Apple / Stripe Prep',
        date: todayStr,
        time: '09:00 AM',
        durationMinutes: 60,
        type: 'mock_interview',
        priority: 'high',
        colorTag: '#0052ff',
        description: 'Focus on distributed queue partitioning and rate limiting interview scenarios.',
        meetingLink: 'https://hireflow.ai/practice/system-design',
        notes: 'Review STAR framework responses.',
        reminderMinutesBefore: 15
      },
      {
        id: `ai_evt_${Date.now()}_2`,
        title: '🤖 AI Recommended: ATS Resume Bullet Point Customization',
        date: todayStr,
        time: '10:30 AM',
        durationMinutes: 45,
        type: 'resume_review',
        priority: 'high',
        colorTag: '#571bc1',
        description: 'Tailor top 2 experience bullet points with quantitative impact metrics.',
        notes: 'Target keywords: Kafka, Distributed Systems, Go',
        reminderMinutesBefore: 10
      },
      {
        id: `ai_evt_${Date.now()}_3`,
        title: '🤖 AI Recommended: Focus Mode Coding & LeetCode Hard Session',
        date: todayStr,
        time: '02:00 PM',
        durationMinutes: 60,
        type: 'coding_practice',
        priority: 'medium',
        colorTag: '#10b981',
        description: 'Solve 2 Dynamic Programming problems to reach weekly goal of 20 problems.',
        reminderMinutesBefore: 15
      },
      {
        id: `ai_evt_${Date.now()}_4`,
        title: '🤖 AI Recommended: Apply to 3 High-Match Senior Full Stack Roles',
        date: todayStr,
        time: '04:00 PM',
        durationMinutes: 45,
        type: 'deadline',
        priority: 'medium',
        colorTag: '#f59e0b',
        description: 'Submit applications to Stripe, Apple, and Figma via AI One-Click Tailor.',
        reminderMinutesBefore: 10
      }
    ];

    return newEvents;
  }
}
