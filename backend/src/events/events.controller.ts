import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { Event } from './entities/event.entity';

@ApiTags('events')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new event' })
  @ApiResponse({ status: 201, description: 'Event created successfully', type: Event })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(@Body() createEventDto: CreateEventDto): Promise<Event> {
    return this.eventsService.create(createEventDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all events' })
  @ApiResponse({ status: 200, description: 'List of all events', type: [Event] })
  findAll(): Promise<Event[]> {
    return this.eventsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get event by ID' })
  @ApiResponse({ status: 200, description: 'Event found', type: Event })
  @ApiResponse({ status: 404, description: 'Event not found' })
  findOne(@Param('id') id: string): Promise<Event> {
    return this.eventsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an event' })
  @ApiResponse({ status: 200, description: 'Event updated successfully', type: Event })
  @ApiResponse({ status: 404, description: 'Event not found' })
  update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto): Promise<Event> {
    return this.eventsService.update(id, updateEventDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an event' })
  @ApiResponse({ status: 204, description: 'Event deleted successfully' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  remove(@Param('id') id: string): Promise<void> {
    return this.eventsService.remove(id);
  }

  @Post('sync/from-google')
  @ApiOperation({ summary: 'Sync events from Google Calendar to local calendar' })
  @ApiResponse({ status: 200, description: 'Events synced successfully', type: [Event] })
  @ApiResponse({ status: 400, description: 'Google Calendar sync not enabled' })
  syncFromGoogleCalendar(): Promise<Event[]> {
    return this.eventsService.syncFromGoogleCalendar();
  }

  @Post('sync/to-google')
  @ApiOperation({ summary: 'Sync events from local calendar to Google Calendar' })
  @ApiResponse({ status: 200, description: 'Events synced successfully' })
  @ApiResponse({ status: 400, description: 'Google Calendar sync not enabled' })
  syncToGoogleCalendar(): Promise<void> {
    return this.eventsService.syncToGoogleCalendar();
  }

  @Get('google-calendar/auth-info')
  @ApiOperation({ summary: 'Get Google Calendar authentication information' })
  @ApiResponse({ status: 200, description: 'Authentication information retrieved successfully' })
  getGoogleCalendarAuthInfo(): any {
    return this.eventsService.getGoogleCalendarAuthInfo();
  }
} 