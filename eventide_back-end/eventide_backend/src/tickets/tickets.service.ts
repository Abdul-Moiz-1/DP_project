import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket } from 'src/entities/ticket.entity';
import { Event } from 'src/entities/event.entity';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket) private ticketRepo: Repository<Ticket>,
    @InjectRepository(Event) private eventRepo: Repository<Event>,
  ) {}

  async create(dto: CreateTicketDto, userId: number) {
    const event = await this.eventRepo.findOne({
      where: { id: dto.eventId },
      relations: ['organizer'],
    });
    if (!event) throw new NotFoundException('Event not found');
    if (event.organizer.id !== userId) throw new ForbiddenException('Access denied');

    const salesStart = new Date(dto.salesStartDate);
    const salesEnd = new Date(dto.salesEndDate);
    if (salesStart >= salesEnd) {
      throw new BadRequestException('Sales end date must be after start date');
    }

    const ticket = this.ticketRepo.create({
      name: dto.name,
      price: dto.price,
      salesStartDate: salesStart,
      salesEndDate: salesEnd,
      event,
    });

    return this.ticketRepo.save(ticket);
  }

  async findAll() {
    return this.ticketRepo.find({ relations: ['event'] });
  }

  async findOne(id: number) {
    const ticket = await this.ticketRepo.findOne({
      where: { id },
      relations: ['event', 'bookings'],
    });
    if (!ticket) throw new NotFoundException('Ticket not found');
    return ticket;
  }

  async update(id: number, dto: UpdateTicketDto, userId: number) {
    const ticket = await this.ticketRepo.findOne({
      where: { id },
      relations: ['event', 'event.organizer'],
    });
    if (!ticket) throw new NotFoundException('Ticket not found');
    if (ticket.event.organizer.id !== userId) throw new ForbiddenException('Access denied');

    if (dto.name) ticket.name = dto.name;
    if (dto.price !== undefined) ticket.price = dto.price;
    if (dto.salesStartDate) ticket.salesStartDate = new Date(dto.salesStartDate);
    if (dto.salesEndDate) ticket.salesEndDate = new Date(dto.salesEndDate);

    return this.ticketRepo.save(ticket);
  }

  async remove(id: number, userId: number) {
    const ticket = await this.ticketRepo.findOne({
      where: { id },
      relations: ['event', 'event.organizer', 'bookings'],
    });
    if (!ticket) throw new NotFoundException('Ticket not found');
    if (ticket.event.organizer.id !== userId) throw new ForbiddenException('Access denied');
    if (ticket.bookings?.length > 0) {
      throw new BadRequestException('Cannot delete ticket with existing bookings');
    }

    await this.ticketRepo.remove(ticket);
  }

  async getUserTickets(userId: number) {
    const tickets = await this.ticketRepo.createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.event', 'event')
      .leftJoinAndSelect('event.location', 'location')
      .leftJoinAndSelect('event.images', 'images')
      .leftJoin('ticket.bookings', 'booking')
      .leftJoin('booking.user', 'user')
      .where('user.id = :userId', { userId })
      .getMany();

    return { items: tickets, total: tickets.length };
  }

  async getEventTickets(eventId: number) {
    return this.ticketRepo.find({
      where: { event: { id: eventId } },
      relations: ['bookings'],
    });
  }
}
