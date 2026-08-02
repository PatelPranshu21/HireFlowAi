import { CalendarEvent } from '../types';
import { UserService } from './userService';

export class CalendarService {
  private static getActiveUserId(): string {
    return UserService.getActiveUserId() || 'guest';
  }

  public static getEvents(userId?: string): CalendarEvent[] {
    const targetUserId = userId || this.getActiveUserId();
    return UserService.getUserScopedData<CalendarEvent[]>(targetUserId, 'calendar_events', []);
  }

  public static addEvent(event: Omit<CalendarEvent, 'id'>, userId?: string): CalendarEvent {
    const targetUserId = userId || this.getActiveUserId();
    const events = this.getEvents(targetUserId);
    const newEvent: CalendarEvent = {
      ...event,
      id: `evt_${Date.now()}`
    };
    const updated = [newEvent, ...events];
    UserService.setUserScopedData(targetUserId, 'calendar_events', updated);
    return newEvent;
  }

  public static toggleEvent(id: string, userId?: string): CalendarEvent[] {
    const targetUserId = userId || this.getActiveUserId();
    const events = this.getEvents(targetUserId);
    const updated = events.map(e => e.id === id ? { ...e, completed: !e.completed } : e);
    UserService.setUserScopedData(targetUserId, 'calendar_events', updated);
    return updated;
  }

  /**
   * Automatically schedule interview & prep study sessions when user applies for a job
   */
  public static scheduleJobApplicationWorkflow(jobTitle: string, company: string, jobId?: string, userId?: string): CalendarEvent[] {
    const targetUserId = userId || this.getActiveUserId();
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

    const current = this.getEvents(targetUserId);
    const updated = [...newEvents, ...current];
    UserService.setUserScopedData(targetUserId, 'calendar_events', updated);
    return updated;
  }
}

