import { IsString, IsDateString, IsOptional, IsBoolean, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEventDto {
  @ApiProperty({ description: 'Event title' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Event description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Event start time' })
  @IsDateString()
  startTime: string;

  @ApiProperty({ description: 'Event end time' })
  @IsDateString()
  endTime: string;

  @ApiPropertyOptional({ description: 'Event location' })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiPropertyOptional({ description: 'Whether the event is all day' })
  @IsBoolean()
  @IsOptional()
  allDay?: boolean;

  @ApiPropertyOptional({ description: 'Event color' })
  @IsString()
  @IsOptional()
  color?: string;

  @ApiPropertyOptional({ description: 'Event attendees' })
  @IsArray()
  @IsOptional()
  attendees?: string[];

  @ApiPropertyOptional({ description: 'Google Calendar event ID' })
  @IsString()
  @IsOptional()
  googleCalendarId?: string;
} 