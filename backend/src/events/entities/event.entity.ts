export interface Event {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  allDay?: boolean;
  color?: string;
  attendees?: string[];
  googleCalendarId?: string;
  createdAt: Date;
  updatedAt: Date;
} 