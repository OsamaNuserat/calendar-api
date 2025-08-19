import { Injectable, NotFoundException } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { GoogleCalendarService } from '../google-calendar/google-calendar.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { Event } from './entities/event.entity';

@Injectable()
export class EventsService {
  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly googleCalendarService: GoogleCalendarService,
  ) {}

  async create(createEventDto: CreateEventDto): Promise<Event> {
    const eventData = {
      ...createEventDto,
      startTime: new Date(createEventDto.startTime),
      endTime: new Date(createEventDto.endTime),
    };

    // If Google Calendar sync is enabled, create event in Google Calendar
    if (process.env.GOOGLE_CALENDAR_ENABLED === 'true') {
      try {
        const googleEvent = await this.googleCalendarService.createEvent(eventData);
        eventData.googleCalendarId = googleEvent.id;
      } catch (error) {
        console.error('Failed to create Google Calendar event:', error);
      }
    }

    const event = await this.firebaseService.createEvent(eventData);
    return event;
  }

  async findAll(): Promise<Event[]> {
    return this.firebaseService.getAllEvents();
  }

  async findOne(id: string): Promise<Event> {
    const event = await this.firebaseService.getEvent(id);
    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }
    return event;
  }

  async update(id: string, updateEventDto: UpdateEventDto): Promise<Event> {
    const existingEvent = await this.findOne(id);
    
    const eventData = {
      ...updateEventDto,
      ...(updateEventDto.startTime && { startTime: new Date(updateEventDto.startTime) }),
      ...(updateEventDto.endTime && { endTime: new Date(updateEventDto.endTime) }),
    };

    // If Google Calendar sync is enabled and event has Google Calendar ID, update it
    if (process.env.GOOGLE_CALENDAR_ENABLED === 'true' && existingEvent.googleCalendarId) {
      try {
        await this.googleCalendarService.updateEvent(existingEvent.googleCalendarId, eventData);
      } catch (error) {
        console.error('Failed to update Google Calendar event:', error);
      }
    }

    const event = await this.firebaseService.updateEvent(id, eventData);
    return event;
  }

  async remove(id: string): Promise<void> {
    const existingEvent = await this.findOne(id);

    // If Google Calendar sync is enabled and event has Google Calendar ID, delete it
    if (process.env.GOOGLE_CALENDAR_ENABLED === 'true' && existingEvent.googleCalendarId) {
      try {
        await this.googleCalendarService.deleteEvent(existingEvent.googleCalendarId);
      } catch (error) {
        console.error('Failed to delete Google Calendar event:', error);
      }
    }

    await this.firebaseService.deleteEvent(id);
  }

  async syncFromGoogleCalendar(): Promise<Event[]> {
    if (process.env.GOOGLE_CALENDAR_ENABLED !== 'true') {
      throw new Error('Google Calendar sync is not enabled');
    }

    const googleEvents = await this.googleCalendarService.listEvents();
    const syncedEvents: Event[] = [];

    for (const googleEvent of googleEvents) {
      // Check if event already exists locally
      const existingEvents = await this.firebaseService.getAllEvents();
      const existingEvent = existingEvents.find(event => 
        event.googleCalendarId === googleEvent.id
      );

      if (existingEvent) {
        // Update existing event
        const updatedEvent = await this.update(existingEvent.id, {
          title: googleEvent.summary,
          description: googleEvent.description,
          startTime: googleEvent.start.dateTime || googleEvent.start.date,
          endTime: googleEvent.end.dateTime || googleEvent.end.date,
          location: googleEvent.location,
          attendees: googleEvent.attendees?.map(attendee => attendee.email),
        });
        syncedEvents.push(updatedEvent);
      } else {
        // Create new event
        const newEvent = await this.create({
          title: googleEvent.summary,
          description: googleEvent.description,
          startTime: googleEvent.start.dateTime || googleEvent.start.date,
          endTime: googleEvent.end.dateTime || googleEvent.end.date,
          location: googleEvent.location,
          attendees: googleEvent.attendees?.map(attendee => attendee.email),
          googleCalendarId: googleEvent.id,
        });
        syncedEvents.push(newEvent);
      }
    }

    return syncedEvents;
  }

  async syncToGoogleCalendar(): Promise<void> {
    if (process.env.GOOGLE_CALENDAR_ENABLED !== 'true') {
      throw new Error('Google Calendar sync is not enabled');
    }

    const localEvents = await this.findAll();
    
    for (const event of localEvents) {
      if (!event.googleCalendarId) {
        try {
          const googleEvent = await this.googleCalendarService.createEvent(event);
          await this.firebaseService.updateEvent(event.id, {
            googleCalendarId: googleEvent.id,
          });
        } catch (error) {
          console.error(`Failed to sync event ${event.id} to Google Calendar:`, error);
        }
      }
    }
  }

  getGoogleCalendarAuthInfo(): any {
    if (process.env.GOOGLE_CALENDAR_ENABLED !== 'true') {
      return {
        enabled: false,
        message: 'Google Calendar sync is not enabled'
      };
    }
    
    return {
      enabled: true,
      ...this.googleCalendarService.getAuthInfo()
    };
  }
} 