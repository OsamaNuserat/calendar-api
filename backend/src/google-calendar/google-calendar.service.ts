import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';

@Injectable()
export class GoogleCalendarService {
  private calendar: any;
  private calendarId: string;

  constructor(private configService: ConfigService) {
    this.calendarId = this.configService.get<string>('GOOGLE_CALENDAR_ID') || 'primary';
    this.initializeCalendar();
  }

  private async initializeCalendar() {
    try {
      const keyFile = this.configService.get<string>('GOOGLE_APPLICATION_CREDENTIALS');
      const isEnabled = this.configService.get<string>('GOOGLE_CALENDAR_ENABLED') === 'true';
      
      if (!isEnabled || !keyFile) {
        console.warn('Google Calendar integration is disabled or credentials not provided');
        return;
      }

      const auth = new google.auth.GoogleAuth({
        keyFile: keyFile,
        scopes: ['https://www.googleapis.com/auth/calendar'],
      });

      this.calendar = google.calendar({ version: 'v3', auth });
      
      // Log authentication type for debugging
      console.log('Google Calendar initialized with service account authentication');
      console.log('Note: Service accounts cannot invite attendees without Domain-Wide Delegation of Authority');
    } catch (error) {
      console.warn('Failed to initialize Google Calendar:', error.message);
    }
  }

  private isServiceAccount(): boolean {
    if (!this.calendar) return false;
    const auth = this.calendar.context._options.auth;
    
    // Check if we have a keyFile configured (service account)
    if (auth && auth.keyFile) {
      return true;
    }
    
    // Check if we have GOOGLE_APPLICATION_CREDENTIALS environment variable
    const credentialsPath = this.configService.get<string>('GOOGLE_APPLICATION_CREDENTIALS');
    if (credentialsPath) {
      return true;
    }
    
    return false;
  }

  getAuthInfo(): { isServiceAccount: boolean; canInviteAttendees: boolean; message?: string } {
    const isServiceAccount = this.isServiceAccount();
    return {
      isServiceAccount,
      canInviteAttendees: !isServiceAccount,
      message: isServiceAccount 
        ? 'Using service account: attendees cannot be invited to Google Calendar events without Domain-Wide Delegation of Authority'
        : 'Using OAuth2: attendees can be invited to Google Calendar events'
    };
  }

  async createEvent(eventData: any): Promise<any> {
    if (!this.calendar) {
      throw new Error('Google Calendar is not initialized');
    }

    // Ensure dates are properly converted to Date objects
    const startTime = eventData.startTime instanceof Date ? eventData.startTime : new Date(eventData.startTime);
    const endTime = eventData.endTime instanceof Date ? eventData.endTime : new Date(eventData.endTime);

    const event: any = {
      summary: eventData.title,
      description: eventData.description,
      location: eventData.location,
      start: {
        dateTime: startTime.toISOString(),
        timeZone: 'UTC',
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: 'UTC',
      },
    };

    // Only add attendees if we're not using a service account
    // Service accounts cannot invite attendees without Domain-Wide Delegation
    if (eventData.attendees && eventData.attendees.length > 0) {
      if (this.isServiceAccount()) {
        console.warn('Service account detected: attendees will not be added to Google Calendar event due to API limitations');
        console.warn('Attendees will still be stored in your local database');
        // You can still store attendees in your local database
      } else {
        event.attendees = eventData.attendees.map(email => ({ email }));
      }
    }

    const response = await this.calendar.events.insert({
      calendarId: this.calendarId,
      resource: event,
    });

    return response.data;
  }

  async updateEvent(eventId: string, eventData: any): Promise<any> {
    if (!this.calendar) {
      throw new Error('Google Calendar is not initialized');
    }

    // Ensure dates are properly converted to Date objects
    const startTime = eventData.startTime instanceof Date ? eventData.startTime : new Date(eventData.startTime);
    const endTime = eventData.endTime instanceof Date ? eventData.endTime : new Date(eventData.endTime);

    const event: any = {
      summary: eventData.title,
      description: eventData.description,
      location: eventData.location,
      start: {
        dateTime: startTime.toISOString(),
        timeZone: 'UTC',
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: 'UTC',
      },
    };

    // Only add attendees if we're not using a service account
    // Service accounts cannot invite attendees without Domain-Wide Delegation
    if (eventData.attendees && eventData.attendees.length > 0) {
      if (this.isServiceAccount()) {
        console.warn('Service account detected: attendees will not be updated in Google Calendar event due to API limitations');
        console.warn('Attendees will still be stored in your local database');
        // You can still store attendees in your local database
      } else {
        event.attendees = eventData.attendees.map(email => ({ email }));
      }
    }

    const response = await this.calendar.events.update({
      calendarId: this.calendarId,
      eventId: eventId,
      resource: event,
    });

    return response.data;
  }

  async deleteEvent(eventId: string): Promise<void> {
    if (!this.calendar) {
      throw new Error('Google Calendar is not initialized');
    }

    await this.calendar.events.delete({
      calendarId: this.calendarId,
      eventId: eventId,
    });
  }

  async listEvents(): Promise<any[]> {
    if (!this.calendar) {
      throw new Error('Google Calendar is not initialized');
    }

    const now = new Date();
    const oneMonthFromNow = new Date();
    oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);

    const response = await this.calendar.events.list({
      calendarId: this.calendarId,
      timeMin: now.toISOString(),
      timeMax: oneMonthFromNow.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });

    return response.data.items || [];
  }

  async getEvent(eventId: string): Promise<any> {
    if (!this.calendar) {
      throw new Error('Google Calendar is not initialized');
    }

    const response = await this.calendar.events.get({
      calendarId: this.calendarId,
      eventId: eventId,
    });

    return response.data;
  }
} 