import axios from 'axios';
import { Event, CreateEventDto, UpdateEventDto } from '../types/event';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const eventService = {
  async getAllEvents(): Promise<Event[]> {
    const response = await api.get('/events');
    return response.data.map((event: any) => ({
      ...event,
      startTime: new Date(event.startTime),
      endTime: new Date(event.endTime),
      createdAt: new Date(event.createdAt),
      updatedAt: new Date(event.updatedAt),
    }));
  },

  async getEvent(id: string): Promise<Event> {
    const response = await api.get(`/events/${id}`);
    const event = response.data;
    return {
      ...event,
      startTime: new Date(event.startTime),
      endTime: new Date(event.endTime),
      createdAt: new Date(event.createdAt),
      updatedAt: new Date(event.updatedAt),
    };
  },

  async createEvent(eventData: CreateEventDto): Promise<Event> {
    const response = await api.post('/events', eventData);
    const event = response.data;
    return {
      ...event,
      startTime: new Date(event.startTime),
      endTime: new Date(event.endTime),
      createdAt: new Date(event.createdAt),
      updatedAt: new Date(event.updatedAt),
    };
  },

  async updateEvent(id: string, eventData: UpdateEventDto): Promise<Event> {
    const response = await api.patch(`/events/${id}`, eventData);
    const event = response.data;
    return {
      ...event,
      startTime: new Date(event.startTime),
      endTime: new Date(event.endTime),
      createdAt: new Date(event.createdAt),
      updatedAt: new Date(event.updatedAt),
    };
  },

  async deleteEvent(id: string): Promise<void> {
    await api.delete(`/events/${id}`);
  },

  async syncFromGoogleCalendar(): Promise<Event[]> {
    const response = await api.post('/events/sync/from-google');
    return response.data.map((event: any) => ({
      ...event,
      startTime: new Date(event.startTime),
      endTime: new Date(event.endTime),
      createdAt: new Date(event.createdAt),
      updatedAt: new Date(event.updatedAt),
    }));
  },

  async syncToGoogleCalendar(): Promise<void> {
    await api.post('/events/sync/to-google');
  },
}; 