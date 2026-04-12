import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PromoCode } from 'src/entities/promo-code.entity';
import { Event } from 'src/entities/event.entity';

@Injectable()
export class PromoCodesService {
  constructor(
    @InjectRepository(PromoCode) private promoRepo: Repository<PromoCode>,
    @InjectRepository(Event) private eventRepo: Repository<Event>,
  ) {}

  async create(dto: {
    code: string;
    discountPercent: number;
    validFrom: string;
    validUntil: string;
    maxUses: number;
    eventId?: number;
  }, userId: number) {
    const existing = await this.promoRepo.findOne({ where: { code: dto.code } });
    if (existing) throw new BadRequestException('Promo code already exists');

    let event: Event | null = null;
    if (dto.eventId) {
      event = await this.eventRepo.findOne({ where: { id: dto.eventId }, relations: ['organizer'] });
      if (!event) throw new NotFoundException('Event not found');
      if (event.organizer.id !== userId) throw new ForbiddenException('Access denied');
    }

    const promo = this.promoRepo.create({
      code: dto.code.toUpperCase(),
      discountPercent: dto.discountPercent,
      validFrom: new Date(dto.validFrom),
      validUntil: new Date(dto.validUntil),
      maxUses: dto.maxUses,
      event: event || undefined,
      createdBy: { id: userId } as any,
    });

    return this.promoRepo.save(promo);
  }

  async validate(code: string, eventId?: number) {
    const promo = await this.promoRepo.findOne({
      where: { code: code.toUpperCase(), isActive: true },
      relations: ['event'],
    });

    if (!promo) throw new NotFoundException('Promo code not found');

    const now = new Date();
    if (now < promo.validFrom || now > promo.validUntil) {
      throw new BadRequestException('Promo code has expired');
    }
    if (promo.maxUses > 0 && promo.timesUsed >= promo.maxUses) {
      throw new BadRequestException('Promo code usage limit reached');
    }
    if (promo.event && eventId && promo.event.id !== eventId) {
      throw new BadRequestException('Promo code not valid for this event');
    }

    return { valid: true, discountPercent: promo.discountPercent };
  }

  async getMyPromoCodes(userId: number) {
    return this.promoRepo.find({
      where: { createdBy: { id: userId } },
      relations: ['event'],
      order: { createdAt: 'DESC' },
    });
  }

  async deactivate(id: number, userId: number) {
    const promo = await this.promoRepo.findOne({
      where: { id },
      relations: ['createdBy'],
    });
    if (!promo) throw new NotFoundException('Promo code not found');
    if (promo.createdBy.id !== userId) throw new ForbiddenException('Access denied');

    promo.isActive = false;
    return this.promoRepo.save(promo);
  }
}
