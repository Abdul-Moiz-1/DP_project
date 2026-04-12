import { Controller, Post, Get, Patch, Body, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { PromoCodesService } from './promo-codes.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles/roles.guard';
import { Role } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/entities/user.entity';
import { GetUser } from 'src/common/decorators/get-user.decorator';

@Controller('promo-codes')
@UseGuards(JwtAuthGuard)
export class PromoCodesController {
  constructor(private readonly service: PromoCodesService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Role(UserRole.ORGANIZER)
  create(
    @Body() dto: {
      code: string;
      discountPercent: number;
      validFrom: string;
      validUntil: string;
      maxUses: number;
      eventId?: number;
    },
    @GetUser('userId') userId: number,
  ) {
    return this.service.create(dto, userId);
  }

  @Get('validate')
  validate(@Query('code') code: string, @Query('eventId') eventId?: number) {
    return this.service.validate(code, eventId);
  }

  @Get('my-codes')
  @UseGuards(RolesGuard)
  @Role(UserRole.ORGANIZER)
  getMyPromoCodes(@GetUser('userId') userId: number) {
    return this.service.getMyPromoCodes(userId);
  }

  @Patch(':id/deactivate')
  @UseGuards(RolesGuard)
  @Role(UserRole.ORGANIZER)
  deactivate(@Param('id', ParseIntPipe) id: number, @GetUser('userId') userId: number) {
    return this.service.deactivate(id, userId);
  }
}
