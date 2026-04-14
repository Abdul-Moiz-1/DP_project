import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { multerConfig } from '../upload/multer.config';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { Event } from '../entities/event.entity';
import { EventLocation } from '../entities/event-location.entity';
import { EventImage } from '../entities/event-image.entity';
import { Ticket } from '../entities/ticket.entity';
import { Category } from '../entities/category.entity';
import { User } from '../entities/user.entity';
import { Booking } from 'src/entities/booking.entity';
import { UserPreference } from 'src/entities/user-preference.entity';
import { UploadService } from 'src/upload/upload.service';
import { GeocodingService } from 'src/common/services/geocoding.service';
import { DirectionsService } from 'src/common/services/directions.service';
import { Follow } from 'src/entities/follow.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Event,
      EventLocation,
      EventImage,
      Ticket,
      Category,
      User,
      Booking,
      UserPreference,
      Follow,
    ]),
    MulterModule.register({
      storage: multerConfig.storage,
    }),
  ],
  controllers: [EventsController],
  providers: [EventsService, UploadService, GeocodingService, DirectionsService],
  exports: [EventsService],
})
export class EventsModule {}
