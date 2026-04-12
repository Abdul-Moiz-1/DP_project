import * as path from 'path';
import { Booking } from 'src/entities/booking.entity';
import { Category } from 'src/entities/category.entity';
import { Event } from 'src/entities/event.entity';
import { EventImage } from 'src/entities/event-image.entity';
import { EventLocation } from 'src/entities/event-location.entity';
import { OrganizerProfile } from 'src/entities/organizer-profile.entity';
import { Review } from 'src/entities/review.entity';
import { Ticket } from 'src/entities/ticket.entity';
import { SavedEvent } from 'src/entities/saved-event.entity';
import { User } from 'src/entities/user.entity';
import { UserPreference } from 'src/entities/user-preference.entity';
import { Follow } from 'src/entities/follow.entity';
import { PromoCode } from 'src/entities/promo-code.entity';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions.js';

export default (): PostgresConnectionOptions => ({
  url: process.env.DATABASE_URL,
  type: 'postgres',
  port: 5432,
  entities: [
    User,
    Ticket,
    Review,
    OrganizerProfile,
    Event,
    EventLocation,
    EventImage,
    Category,
    Booking,
    SavedEvent,
    UserPreference,
    Follow,
    PromoCode,
  ],
  synchronize: true, // this is only for development env (set to false for production)
  ssl: {
    rejectUnauthorized: false,
  },
});
