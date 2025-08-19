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

export interface CreateEventDto {
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  location?: string;
  allDay?: boolean;
  color?: string;
  attendees?: string[];
}

export interface UpdateEventDto extends Partial<CreateEventDto> {} 