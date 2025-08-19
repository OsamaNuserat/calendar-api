import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { EventsModule } from './events/events.module';
import { GoogleCalendarModule } from './google-calendar/google-calendar.module';
import { FirebaseModule } from './firebase/firebase.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ScheduleModule.forRoot(),
    FirebaseModule,
    EventsModule,
    GoogleCalendarModule,
  ],
})
export class AppModule {} 