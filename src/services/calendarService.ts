import { CalendarEvent } from '../types';

export class CalendarService {
  private static STORAGE_KEY = 'hireflow_calendar_events_v1';

  public static getEvents(): CalendarEvent[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      // Fallback
    }

    const defaultEvents: CalendarEvent[] = [
      {
        id: 'evt_1',
        title: 'Senior Software Engineer Round 2 Technical Interview',
        company: 'Apple',
        jobId: 'job_1',
        date: 'Tomorrow',
        time: '2:00 PM',
        type: 'interview',
        description: 'Deep dive into distributed systems streaming and System Design architecture.',
        completed: false
      },
      {
        id: 'evt_2',
        title: 'Stripe Staff Infrastructure Take-Home Deadline',
        company: 'Stripe',
        jobId: 'job_2',
        date: 'In 2 days',
        time: '11:59 PM',
        type: 'deadline',
        description: 'Submit payment gateway microservice routing repository.',
        completed: false
      },
      {
        id: 'evt_3',
        title: 'Docker & Microservices Orchestration Study Session',
        date: 'Friday',
        time: '10:00 AM',
        type: 'study_session',
        description: 'Complete hands-on container networking & docker-compose lab.',
        completed: false
      },
      {
        id: 'evt_4',
        title: 'System Design Mock Interview & STAR Refinement',
        date: 'Saturday',
        time: '4:00 PM',
        type: 'mock_interview',
        description: 'Practice high-scale database partitioning and rate limiting.',
        completed: false
      }
    ];

    return defaultEvents;
  }

  public static addEvent(event: Omit<CalendarEvent, 'id'>): CalendarEvent {
    const events = this.getEvents();
    const newEvent: CalendarEvent = {
      ...event,
      id: `evt_${Date.now()}`
    };
    const updated = [newEvent, ...events];
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Error saving calendar event:', e);
    }
    return newEvent;
  }

  public static toggleEvent(id: string): CalendarEvent[] {
    const events = this.getEvents();
    const updated = events.map(e => e.id === id ? { ...e, completed: !e.completed } : e);
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.error('Error updating calendar event:', err);
    }
    return updated;
  }

  /**
   * Automatically schedule interview & prep study sessions when user applies for a job
   */
  public static scheduleJobApplicationWorkflow(jobTitle: string, company: string, jobId?: string): CalendarEvent[] {
    const newEvents: CalendarEvent[] = [
      {
        id: `evt_prep_${Date.now()}_1`,
        title: `Company Tech Stack Prep: ${company}`,
        company,
        jobId,
        date: 'In 2 days',
        time: '10:00 AM',
        type: 'study_session',
        description: `Review ${company}'s core technology stack, recent engineering blogs, and system architecture.`,
        completed: false
      },
      {
        id: `evt_prep_${Date.now()}_2`,
        title: `Mock Technical Interview: ${jobTitle}`,
        company,
        jobId,
        date: 'In 4 days',
        time: '3:00 PM',
        type: 'mock_interview',
        description: `AI-guided technical & coding practice session tailored for ${company}.`,
        completed: false
      },
      {
        id: `evt_follow_${Date.now()}_3`,
        title: `Recruiter Application Follow-up`,
        company,
        jobId,
        date: 'Next Week',
        time: '11:00 AM',
        type: 'followup',
        description: `Send personalized follow-up note to ${company} hiring team.`,
        completed: false
      }
    ];

    const current = this.getEvents();
    const updated = [...newEvents, ...current];
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Error saving automated calendar events:', e);
    }
    return updated;
  }
}
