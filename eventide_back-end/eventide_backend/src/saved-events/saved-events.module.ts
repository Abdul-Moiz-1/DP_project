import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SavedEventsController } from './saved-events.controller';
import { SavedEventsService } from './saved-events.service';
import { SavedEvent } from '../entities/saved-event.entity';
import { Event } from '../entities/event.entity';
import { User } from '../entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SavedEvent, Event, User])],
  controllers: [SavedEventsController],
  providers: [SavedEventsService],
})
export class SavedEventsModule {}
