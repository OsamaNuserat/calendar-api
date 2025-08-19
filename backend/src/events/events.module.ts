import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { FirebaseService } from '../firebase/firebase.service';
import { GoogleCalendarModule } from '../google-calendar/google-calendar.module';

@Module({
  imports: [GoogleCalendarModule],
  controllers: [EventsController],
  providers: [EventsService, FirebaseService],
  exports: [EventsService],
})
export class EventsModule {} 