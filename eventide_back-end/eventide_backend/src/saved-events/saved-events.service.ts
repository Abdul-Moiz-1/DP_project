import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SavedEvent } from '../entities/saved-event.entity';
import { Event } from '../entities/event.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class SavedEventsService {
  constructor(
    @InjectRepository(SavedEvent)
    private savedEventRepo: Repository<SavedEvent>,
    @InjectRepository(Event) private eventRepo: Repository<Event>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  async save(eventId: number, userId: number) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const event = await this.eventRepo.findOne({ where: { id: eventId } });
    if (!event) throw new NotFoundException('Event not found');

    const existing = await this.savedEventRepo.findOne({
      where: { user: { id: userId }, event: { id: eventId } },
    });
    if (existing) throw new BadRequestException('Event already saved');

    const saved = this.savedEventRepo.create({ user, event });
    await this.savedEventRepo.save(saved);

    return { message: 'Event saved successfully' };
  }

  async unsave(eventId: number, userId: number) {
    const saved = await this.savedEventRepo.findOne({
      where: { user: { id: userId }, event: { id: eventId } },
    });
    if (!saved) throw new NotFoundException('Saved event not found');

    await this.savedEventRepo.remove(saved);
    return { message: 'Event removed from saved' };
  }

  async getMySavedEvents(userId: number) {
    const saved = await this.savedEventRepo.find({
      where: { user: { id: userId } },
      relations: [
        'event',
        'event.location',
        'event.images',
        'event.categories',
        'event.tickets',
        'event.organizer',
      ],
      order: { createdAt: 'DESC' },
    });

    return saved.map((s) => ({
      id: s.id,
      savedAt: s.createdAt,
      event: {
        id: s.event.id,
        name: s.event.name,
        description: s.event.description,
        startDate: s.event.startDate,
        endDate: s.event.endDate,
        capacity: s.event.capacity,
        location: s.event.location
          ? {
              city: s.event.location.city,
              country: s.event.location.country,
            }
          : null,
        images:
          s.event.images?.map((i) => ({
            id: i.id,
            imageUrl: i.imageUrl,
          })) || [],
        categories:
          s.event.categories?.map((c) => ({ id: c.id, name: c.name })) || [],
        minPrice: s.event.tickets?.length
          ? Math.min(...s.event.tickets.map((t) => Number(t.price)))
          : 0,
      },
    }));
  }

  async isEventSaved(eventId: number, userId: number) {
    const saved = await this.savedEventRepo.findOne({
      where: { user: { id: userId }, event: { id: eventId } },
    });
    return { isSaved: !!saved };
  }
}
