import { Injectable, NotFoundException, ForbiddenException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Event, EventStatus } from '../entities/event.entity';
import { EventLocation } from '../entities/event-location.entity';
import { EventImage } from '../entities/event-image.entity';
import { Ticket } from '../entities/ticket.entity';
import { Category } from '../entities/category.entity';
import { User, UserRole } from '../entities/user.entity';
import { UserPreference } from '../entities/user-preference.entity';
import { CreateEventDto, UpdateEventDto, FindEventsDto, EventResponseDto } from './dto/event.dto';
import { Booking } from 'src/entities/booking.entity';
import { UploadService } from 'src/upload/upload.service';
import { GeocodingService } from 'src/common/services/geocoding.service';
import { Follow } from 'src/entities/follow.entity';

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor(
    @InjectRepository(Event) private eventRepo: Repository<Event>,
    @InjectRepository(EventLocation) private locationRepo: Repository<EventLocation>,
    @InjectRepository(EventImage) private imageRepo: Repository<EventImage>,
    @InjectRepository(Ticket) private ticketRepo: Repository<Ticket>,
    @InjectRepository(Booking) private bookingRepo: Repository<Booking>,
    @InjectRepository(Category) private categoryRepo: Repository<Category>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(UserPreference) private prefRepo: Repository<UserPreference>,
    @InjectRepository(Follow) private followRepo: Repository<Follow>,
    private readonly uploadService: UploadService,
    private readonly geocodingService: GeocodingService,
  ) { }


  async create(dto: CreateEventDto, userId: number, files?: Express.Multer.File[]): Promise<EventResponseDto> {
    if (!userId) throw new BadRequestException('Invalid user ID');
    if (!dto) throw new BadRequestException('Event data is required');

    const organizer = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['organizerProfile']
    });

    if (!organizer) throw new NotFoundException('User not found');
    if (organizer.role !== UserRole.ORGANIZER) {
      throw new ForbiddenException('Only organizers can create events');
    }

    // Validate dates
    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new BadRequestException('Invalid date format');
    }
    if (startDate >= endDate) {
      throw new BadRequestException('End date must be after start date');
    }
    if (startDate < new Date()) {
      throw new BadRequestException('Start date must be in the future');
    }

    // Validate tickets
    if (!dto.tickets || dto.tickets.length === 0) {
      throw new BadRequestException('At least one ticket type is required');
    }

    // Validate ticket dates
    for (const ticketDto of dto.tickets) {
      const salesStart = new Date(ticketDto.salesStartDate);
      const salesEnd = new Date(ticketDto.salesEndDate);

      if (salesStart >= salesEnd) {
        throw new BadRequestException(`Ticket "${ticketDto.name}": Sales end date must be after start date`);
      }
      if (salesEnd > startDate) {
        throw new BadRequestException(`Ticket "${ticketDto.name}": Sales must end before event starts`);
      }
    }

    try {
      const locationData = { ...dto.location };
      if (locationData.latitude == null || locationData.longitude == null) {
        const coords = await this.geocodingService.geocodeAddress(
          locationData.address, locationData.city, locationData.country,
        );
        if (coords) {
          locationData.latitude = coords.latitude;
          locationData.longitude = coords.longitude;
        }
      }
      const location = await this.locationRepo.save(this.locationRepo.create(locationData));

      let categories: Category[] = [];
      if (dto.categoryIds && dto.categoryIds.length > 0) {
        categories = await this.categoryRepo.findBy({ id: In(dto.categoryIds) });
        if (categories.length !== dto.categoryIds.length) {
          throw new BadRequestException('One or more categories not found');
        }
      }

      const event = await this.eventRepo.save(
        this.eventRepo.create({
          name: dto.name,
          description: dto.description,
          startDate,
          endDate,
          capacity: dto.capacity,
          organizer,
          location,
          categories,
        })
      );

      console.log("event created:", event.id);

      if (files && files.length > 0) {
        console.log("uploading files:", files.length);
        files.forEach((f, i) => {
          console.log(`  File ${i}:`, {
            fieldname: f.fieldname,
            originalname: f.originalname,
            encoding: f.encoding,
            mimetype: f.mimetype,
            size: f.size,
            destination: f.destination,
            filename: f.filename,
            path: f.path,
          });
        });
        const uploadedFiles = this.uploadService.uploadMany(files);
        console.log("uploaded files urls:", uploadedFiles);
        dto.imageUrls = [...(dto.imageUrls || []), ...uploadedFiles];
      }

      if (dto.imageUrls && dto.imageUrls.length > 0) {
        console.log("saving images:", dto.imageUrls);
        const images = dto.imageUrls.map(url => this.imageRepo.create({ imageUrl: url, event }));
        await this.imageRepo.save(images);
      }

      console.log("creating tickets:", dto.tickets);
      const tickets = dto.tickets.map(t =>
        this.ticketRepo.create({
          name: t.name,
          price: t.price,
          salesStartDate: new Date(t.salesStartDate),
          salesEndDate: new Date(t.salesEndDate),
          event,
        })
      );

      console.log("saving tickets...");
      await this.ticketRepo.save(tickets);

      console.log("finding created event with id:", event.id);
      return this.findOne(event.id);
    } catch (error) {
      this.logger.error("Event creation error:", error);
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      // Extract error message for better debugging
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      this.logger.error(`Event creation failed: ${errorMessage}`, error);
      throw new BadRequestException(`Failed to create event: ${errorMessage}`);
    }
  }


  async findAll(dto: FindEventsDto) {
    const {
      page = 1, limit = 10, search, city, country, categoryId,
      startDate, endDate, minPrice, maxPrice,
      latitude, longitude, radius, sortBy,
    } = dto;

    if (page < 1) throw new BadRequestException('Page must be greater than 0');
    if (limit < 1 || limit > 100) throw new BadRequestException('Limit must be between 1 and 100');

    const query = this.eventRepo.createQueryBuilder('event')
      .leftJoinAndSelect('event.organizer', 'organizer')
      .leftJoinAndSelect('organizer.organizerProfile', 'organizerProfile')
      .leftJoinAndSelect('event.location', 'location')
      .leftJoinAndSelect('event.images', 'images')
      .leftJoinAndSelect('event.categories', 'categories')
      .leftJoinAndSelect('event.tickets', 'tickets')
      .leftJoin('event.bookings', 'bookings')
      .where('event.status = :status', { status: 'PUBLISHED' })
      .andWhere('event.endDate >= :now', { now: new Date() });

    if (search) {
      query.andWhere('(event.name ILIKE :search OR event.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }
    if (city) query.andWhere('location.city ILIKE :city', { city: `%${city}%` });
    if (country) query.andWhere('location.country ILIKE :country', { country: `%${country}%` });
    if (categoryId) query.andWhere('categories.id = :categoryId', { categoryId });
    if (startDate) query.andWhere('event.startDate >= :startDate', { startDate: new Date(startDate) });
    if (endDate) query.andWhere('event.endDate <= :endDate', { endDate: new Date(endDate) });

    if (minPrice !== undefined) {
      query.andWhere('tickets.price >= :minPrice', { minPrice });
    }
    if (maxPrice !== undefined) {
      query.andWhere('tickets.price <= :maxPrice', { maxPrice });
    }

    if (latitude !== undefined && longitude !== undefined && radius !== undefined) {
      const radiusKm = radius;
      query.andWhere(
        `(6371 * acos(cos(radians(:lat)) * cos(radians(location.latitude)) * cos(radians(location.longitude) - radians(:lng)) + sin(radians(:lat)) * sin(radians(location.latitude)))) <= :radius`,
        { lat: latitude, lng: longitude, radius: radiusKm },
      );
    }

    if (sortBy === 'price') {
      query.orderBy('tickets.price', 'ASC');
    } else if (sortBy === 'distance' && latitude !== undefined && longitude !== undefined) {
      query.orderBy(
        `(6371 * acos(cos(radians(:sortLat)) * cos(radians(location.latitude)) * cos(radians(location.longitude) - radians(:sortLng)) + sin(radians(:sortLat)) * sin(radians(location.latitude))))`,
        'ASC',
      );
      query.setParameters({ sortLat: latitude, sortLng: longitude });
    } else {
      query.orderBy('event.startDate', 'ASC');
    }

    const [items, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      items: items.map(e => this.toResponse(e)),
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }


  async findOne(id: number): Promise<EventResponseDto> {
    if (!id || id < 1) throw new BadRequestException('Invalid event ID');

    const event = await this.eventRepo.findOne({
      where: { id, status: EventStatus.PUBLISHED },
      relations: ['organizer', 'organizer.organizerProfile', 'location', 'images', 'tickets', 'categories', 'bookings'],
    });

    if (!event) throw new NotFoundException('Event not found');
    return this.toResponse(event);
  }

  async findManagedEvent(id: number, userId: number): Promise<EventResponseDto> {
    if (!id || id < 1) throw new BadRequestException('Invalid event ID');
    if (!userId) throw new BadRequestException('Invalid user ID');

    const event = await this.eventRepo.findOne({
      where: { id },
      relations: ['organizer', 'organizer.organizerProfile', 'location', 'images', 'tickets', 'categories', 'bookings'],
    });

    if (!event) throw new NotFoundException('Event not found');
    if (event.organizer.id !== userId) throw new ForbiddenException('Access denied');

    return this.toResponse(event);
  }


  async update(id: number, dto: UpdateEventDto, userId: number, files?: Express.Multer.File[]): Promise<EventResponseDto> {
    if (!id || id < 1) throw new BadRequestException('Invalid event ID');
    if (!userId) throw new BadRequestException('Invalid user ID');
    if (!dto || Object.keys(dto).length === 0) {
      if (!files || files.length === 0) {
        throw new BadRequestException('Update data or files are required');
      }
    }

    const event = await this.eventRepo.findOne({
      where: { id },
      relations: ['organizer', 'location', 'categories', 'tickets', 'bookings']
    });

    if (!event) throw new NotFoundException('Event not found');
    if (event.organizer.id !== userId) throw new ForbiddenException('Access denied');

    // Check if event has started (can't update past/ongoing events)
    if (new Date() >= event.startDate) {
      throw new BadRequestException('Cannot update events that have started or ended');
    }

    // Validate and update dates
    if (dto.startDate || dto.endDate) {
      const startDate = dto.startDate ? new Date(dto.startDate) : event.startDate;
      const endDate = dto.endDate ? new Date(dto.endDate) : event.endDate;

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new BadRequestException('Invalid date format');
      }
      if (startDate >= endDate) {
        throw new BadRequestException('End date must be after start date');
      }
      if (startDate < new Date()) {
        throw new BadRequestException('Start date must be in the future');
      }

      event.startDate = startDate;
      event.endDate = endDate;
    }

    // Update basic fields
    if (dto.name) event.name = dto.name;
    if (dto.description) event.description = dto.description;
    if (dto.capacity) event.capacity = dto.capacity;

    // Update location
    if (dto.location) {
      const nextLocation = { ...event.location, ...dto.location };

      if (nextLocation.latitude == null || nextLocation.longitude == null) {
        const coords = await this.geocodingService.geocodeAddress(
          nextLocation.address,
          nextLocation.city,
          nextLocation.country,
        );
        if (coords) {
          nextLocation.latitude = coords.latitude;
          nextLocation.longitude = coords.longitude;
        }
      }

      await this.locationRepo.update(event.location.id, nextLocation);
    }

    // Update categories
    if (dto.categoryIds && dto.categoryIds.length > 0) {
      const categories = await this.categoryRepo.findBy({ id: In(dto.categoryIds) });
      if (categories.length !== dto.categoryIds.length) {
        throw new BadRequestException('One or more categories not found');
      }
      event.categories = categories;
    }

    // Handle new uploaded files (merge with existing retained images)
    if (files && files.length > 0) {
      const uploadedFiles = this.uploadService.uploadMany(files);
      // Merge existing retained images with newly uploaded files
      const existingImages = dto.imageUrls ? [...dto.imageUrls] : [];
      dto.imageUrls = [...existingImages, ...uploadedFiles];
      console.log("Images after merge:", dto.imageUrls);
    }

    // Update images (only if imageUrls was explicitly sent in the request)
    if (dto.imageUrls !== undefined) {
      console.log("Updating images with:", dto.imageUrls);
      await this.imageRepo.delete({ event: { id } });
      if (dto.imageUrls.length > 0) {
        const images = dto.imageUrls.map(url => this.imageRepo.create({ imageUrl: url, event }));
        await this.imageRepo.save(images);
        console.log("Saved images:", images.length);
      }
    }

    // Update tickets (only if not restricted by bookings)
    if (dto.tickets && dto.tickets.length > 0) {
      // Check if there are existing confirmed bookings
      const existingBookings = await this.bookingRepo.count({
        where: { event: { id }, status: In(['CONFIRMED']) }
      });

      if (existingBookings > 0) {
        console.log(`Cannot update tickets - ${existingBookings} confirmed bookings exist`);
        throw new BadRequestException('Cannot update tickets when confirmed bookings exist. Please cancel bookings first.');
      }

      // Delete old tickets and create new ones
      await this.ticketRepo.delete({ event: { id } });

      const tickets = dto.tickets.map(t => {
        const salesStart = new Date(t.salesStartDate);
        const salesEnd = new Date(t.salesEndDate);

        if (salesStart >= salesEnd) {
          throw new BadRequestException(`Ticket "${t.name}": Sales end date must be after start date`);
        }

        return this.ticketRepo.create({
          name: t.name,
          price: t.price,
          salesStartDate: salesStart,
          salesEndDate: salesEnd,
          event,
        });
      });

      await this.ticketRepo.save(tickets);
    }

    await this.eventRepo.save(event);
    return this.findOne(id);
  }


  async remove(id: number, userId: number): Promise<void> {
    const event = await this.eventRepo.findOne({ where: { id }, relations: ['organizer'] });
    if (!event) throw new NotFoundException('Event not found');
    if (event.organizer.id !== userId) throw new ForbiddenException('Access denied');
    await this.eventRepo.remove(event);
  }

  async getMyEvents(userId: number): Promise<EventResponseDto[]> {
    if (!userId) throw new BadRequestException('Invalid user ID');

    const events = await this.eventRepo.find({
      where: { organizer: { id: userId } },
      relations: ['organizer', 'organizer.organizerProfile', 'location', 'images', 'tickets', 'categories'],
      order: { createdAt: 'DESC' },
    });

    return events.map(e => this.toResponse(e));
  }


  async getEventAnalytics(eventId: number, userId: number) {
    if (!eventId || eventId < 1) throw new BadRequestException('Invalid event ID');
    if (!userId) throw new BadRequestException('Invalid user ID');

    const event = await this.eventRepo.findOne({
      where: { id: eventId },
      relations: ['organizer', 'tickets', 'bookings', 'bookings.ticket'],
    });

    if (!event) throw new NotFoundException('Event not found');
    if (event.organizer.id !== userId) throw new ForbiddenException('Access denied');

    const totalBookings = event.bookings?.length || 0;
    const confirmedBookings = event.bookings?.filter(b => b.status === 'CONFIRMED').length || 0;
    const cancelledBookings = event.bookings?.filter(b => b.status === 'CANCELLED').length || 0;

    const totalRevenue = event.bookings
      ?.filter(b => b.status === 'CONFIRMED')
      .reduce((sum, b) => sum + Number(b.ticket.price), 0) || 0;

    const ticketsSold = event.tickets?.map(ticket => {
      const sold = event.bookings
        ?.filter(b => b.ticket.id === ticket.id && b.status === 'CONFIRMED').length || 0;

      return {
        ticketName: ticket.name,
        price: ticket.price,
        sold,
        revenue: sold * Number(ticket.price),
      };
    }) || [];

    return {
      eventId: event.id,
      eventName: event.name,
      capacity: event.capacity,
      totalBookings,
      confirmedBookings,
      cancelledBookings,
      availableSpots: event.capacity - confirmedBookings,
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      ticketsSold,
      eventStatus: this.getEventStatus(event),
    };
  }

  async getOrganizerStats(userId: number) {
    if (!userId) throw new BadRequestException('Invalid user ID');

    const events = await this.eventRepo.find({
      where: { organizer: { id: userId } },
      relations: ['bookings', 'bookings.ticket'],
    });

    const totalEvents = events.length;
    const now = new Date();
    const upcomingEvents = events.filter(e => e.startDate > now).length;
    const pastEvents = events.filter(e => e.endDate < now).length;
    const ongoingEvents = events.filter(e =>
      e.startDate <= now && e.endDate >= now
    ).length;

    const totalRevenue = events.reduce((sum, event) => {
      const eventRevenue = event.bookings
        ?.filter(b => b.status === 'CONFIRMED')
        .reduce((s, b) => s + Number(b.ticket.price), 0) || 0;
      return sum + eventRevenue;
    }, 0);

    const totalBookings = events.reduce((sum, event) =>
      sum + (event.bookings?.filter(b => b.status === 'CONFIRMED').length || 0), 0
    );

    return {
      totalEvents,
      upcomingEvents,
      ongoingEvents,
      pastEvents,
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      totalBookings,
    };
  }

  async getRecommended(
    userId: number,
    limit: number = 10,
    latitude?: number,
    longitude?: number,
  ): Promise<EventResponseDto[]> {
    const [preferences, bookings, follows] = await Promise.all([
      this.prefRepo.find({
        where: { user: { id: userId } },
        relations: ['category'],
      }),
      this.bookingRepo.find({
        where: { user: { id: userId } },
        relations: ['event', 'event.categories', 'event.organizer'],
      }),
      this.followRepo.find({
        where: { follower: { id: userId } },
        relations: ['organizer'],
      }),
    ])

    const categoryIds = new Set<number>();
    preferences.forEach(p => {
      if (p.category?.id) categoryIds.add(p.category.id);
    });
    bookings.forEach(b => {
      b.event?.categories?.forEach(c => categoryIds.add(c.id));
    });

    const bookedEventIds = new Set(bookings.map(b => b.event?.id).filter(Boolean));
    const followedOrganizerIds = new Set(follows.map((follow) => follow.organizer?.id).filter(Boolean));
    const bookedOrganizerIds = new Set(bookings.map((booking) => booking.event?.organizer?.id).filter(Boolean));

    const query = this.eventRepo.createQueryBuilder('event')
      .leftJoinAndSelect('event.organizer', 'organizer')
      .leftJoinAndSelect('organizer.organizerProfile', 'organizerProfile')
      .leftJoinAndSelect('event.location', 'location')
      .leftJoinAndSelect('event.images', 'images')
      .leftJoinAndSelect('event.categories', 'categories')
      .leftJoinAndSelect('event.tickets', 'tickets')
      .leftJoinAndSelect('event.bookings', 'bookings')
      .where('event.startDate > :now', { now: new Date() })
      .andWhere('event.status = :status', { status: 'PUBLISHED' });

    if (bookedEventIds.size > 0) {
      query.andWhere('event.id NOT IN (:...bookedIds)', { bookedIds: Array.from(bookedEventIds) });
    }

    const candidates = await query
      .orderBy('event.startDate', 'ASC')
      .take(Math.max(limit * 6, 40))
      .getMany();

    const scored = candidates
      .map((event) =>
        this.scoreRecommendedEvent(
          event,
          categoryIds,
          followedOrganizerIds,
          bookedOrganizerIds,
          latitude,
          longitude,
        ),
      )
      .sort((a, b) => b.score - a.score || a.event.startDate.getTime() - b.event.startDate.getTime())
      .slice(0, limit);

    return scored.map(({ event, score, reasons, distanceKm }) =>
      this.toResponse(event, {
        recommendationScore: score,
        recommendationReasons: reasons,
        distanceKm,
      }),
    );
  }

  async updateStatus(id: number, status: string, userId: number): Promise<EventResponseDto> {
    const validStatuses = ['DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    const event = await this.eventRepo.findOne({
      where: { id },
      relations: ['organizer'],
    });
    if (!event) throw new NotFoundException('Event not found');
    if (event.organizer.id !== userId) throw new ForbiddenException('Access denied');

    event.status = status as any;
    await this.eventRepo.save(event);
    return this.findOne(id);
  }

  async getTrending(limit: number = 10): Promise<EventResponseDto[]> {
    const events = await this.eventRepo.createQueryBuilder('event')
      .leftJoinAndSelect('event.organizer', 'organizer')
      .leftJoinAndSelect('organizer.organizerProfile', 'organizerProfile')
      .leftJoinAndSelect('event.location', 'location')
      .leftJoinAndSelect('event.images', 'images')
      .leftJoinAndSelect('event.categories', 'categories')
      .leftJoinAndSelect('event.tickets', 'tickets')
      .leftJoinAndSelect('event.bookings', 'bookings')
      .where('event.startDate > :now', { now: new Date() })
      .andWhere('event.status = :status', { status: 'PUBLISHED' })
      .getMany();

    // PostgreSQL stringently requires all selected fields in GROUP BY.
    // Given rapid querying, we sort the active cohort in memory.
    events.sort((a, b) => (b.bookings?.length || 0) - (a.bookings?.length || 0));
    return events.slice(0, limit).map(e => this.toResponse(e));
  }

  async getNearby(latitude: number, longitude: number, radiusKm: number = 50, limit: number = 10): Promise<EventResponseDto[]> {
    const events = await this.eventRepo.createQueryBuilder('event')
      .leftJoinAndSelect('event.organizer', 'organizer')
      .leftJoinAndSelect('organizer.organizerProfile', 'organizerProfile')
      .leftJoinAndSelect('event.location', 'location')
      .leftJoinAndSelect('event.images', 'images')
      .leftJoinAndSelect('event.categories', 'categories')
      .leftJoinAndSelect('event.tickets', 'tickets')
      .where('event.startDate > :now', { now: new Date() })
      .andWhere('event.status = :status', { status: 'PUBLISHED' })
      .andWhere('location.latitude IS NOT NULL')
      .andWhere('location.longitude IS NOT NULL')
      .andWhere(
        `(6371 * acos(cos(radians(:lat)) * cos(radians(location.latitude)) * cos(radians(location.longitude) - radians(:lng)) + sin(radians(:lat)) * sin(radians(location.latitude)))) <= :radius`,
        { lat: latitude, lng: longitude, radius: radiusKm },
      )
      .orderBy(
        `(6371 * acos(cos(radians(:lat)) * cos(radians(location.latitude)) * cos(radians(location.longitude) - radians(:lng)) + sin(radians(:lat)) * sin(radians(location.latitude))))`,
        'ASC',
      )
      .take(limit)
      .getMany();

    return events.map(e => this.toResponse(e));
  }

  private getEventStatus(event: Event): string {
    const now = new Date();
    if (now < event.startDate) return 'UPCOMING';
    if (now >= event.startDate && now <= event.endDate) return 'ONGOING';
    return 'PAST';
  }

  private scoreRecommendedEvent(
    event: Event,
    preferredCategoryIds: Set<number>,
    followedOrganizerIds: Set<number>,
    bookedOrganizerIds: Set<number>,
    latitude?: number,
    longitude?: number,
  ) {
    let score = 0;
    const reasons: string[] = [];
    const eventCategoryIds = new Set(event.categories?.map((category) => category.id) || []);

    const categoryOverlap = Array.from(eventCategoryIds).filter((id) => preferredCategoryIds.has(id)).length;
    if (categoryOverlap > 0) {
      score += Math.min(categoryOverlap * 18, 36);
      reasons.push(categoryOverlap > 1 ? 'Matches multiple interests' : 'Matches your interests');
    }

    if (followedOrganizerIds.has(event.organizer.id)) {
      score += 28;
      reasons.push('From an organizer you follow');
    } else if (bookedOrganizerIds.has(event.organizer.id)) {
      score += 14;
      reasons.push('From an organizer you booked before');
    }

    const popularityBoost = Math.min(event.bookings?.length || 0, 12);
    if (popularityBoost > 0) {
      score += popularityBoost;
      reasons.push(popularityBoost >= 6 ? 'Trending with attendees' : 'People are booking this');
    }

    const daysUntilStart = Math.max(
      0,
      Math.ceil((event.startDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
    );
    const freshnessBoost = Math.max(0, 12 - Math.min(daysUntilStart, 12));
    score += freshnessBoost;
    if (daysUntilStart <= 7) {
      reasons.push('Happening soon');
    }

    let distanceKm: number | undefined;
    if (
      latitude !== undefined &&
      longitude !== undefined &&
      event.location?.latitude != null &&
      event.location?.longitude != null
    ) {
      distanceKm = this.calculateDistanceKm(
        latitude,
        longitude,
        event.location.latitude,
        event.location.longitude,
      );

      const proximityBoost = Math.max(0, 20 - Math.min(distanceKm, 20));
      score += proximityBoost;
      if (distanceKm <= 10) {
        reasons.push('Close to your location');
      }
    }

    if (reasons.length === 0) {
      reasons.push('Popular upcoming event');
    }

    return {
      event,
      score: parseFloat(score.toFixed(2)),
      reasons: reasons.slice(0, 3),
      distanceKm: distanceKm !== undefined ? parseFloat(distanceKm.toFixed(1)) : undefined,
    };
  }

  private calculateDistanceKm(fromLat: number, fromLng: number, toLat: number, toLng: number) {
    const toRadians = (value: number) => (value * Math.PI) / 180;
    const earthRadiusKm = 6371;
    const deltaLat = toRadians(toLat - fromLat);
    const deltaLng = toRadians(toLng - fromLng);
    const a =
      Math.sin(deltaLat / 2) ** 2 +
      Math.cos(toRadians(fromLat)) *
      Math.cos(toRadians(toLat)) *
      Math.sin(deltaLng / 2) ** 2;

    return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  private toResponse(
    event: Event,
    extras?: {
      recommendationScore?: number;
      recommendationReasons?: string[];
      distanceKm?: number;
    },
  ): EventResponseDto {
    return {
      id: event.id,
      name: event.name,
      description: event.description,
      status: event.status || this.getEventStatus(event),
      startDate: event.startDate,
      endDate: event.endDate,
      capacity: event.capacity,
      organizer: {
        id: event.organizer.id,
        name: event.organizer.name,
        email: event.organizer.email,
        organizerProfile: event.organizer.organizerProfile ? {
          organizationName: event.organizer.organizerProfile.organizationName,
          address: event.organizer.organizerProfile.address,
          city: event.organizer.organizerProfile.city,
          country: event.organizer.organizerProfile.country,
          state: event.organizer.organizerProfile.state,
        } : undefined,
      },
      location: event.location ? {
        id: event.location.id,
        address: event.location.address,
        city: event.location.city,
        state: event.location.state,
        country: event.location.country,
        postalCode: event.location.postalCode,
        latitude: event.location.latitude,
        longitude: event.location.longitude,
        googleMapsLink: event.location.googleMapsLink,
      } : undefined as any,
      images: event.images?.map(i => ({ id: i.id, imageUrl: i.imageUrl })) || [],
      tickets: event.tickets?.map(t => ({ id: t.id, name: t.name, price: t.price, salesStartDate: t.salesStartDate, salesEndDate: t.salesEndDate })) || [],
      categories: event.categories?.map(c => ({ id: c.id, name: c.name })) || [],
      bookings: event.bookings?.length ?? 0,
      createdAt: event.createdAt,
      recommendationScore: extras?.recommendationScore,
      recommendationReasons: extras?.recommendationReasons,
      distanceKm: extras?.distanceKm,
    };
  }
}
