import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { GetUser } from 'src/common/decorators/get-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  create(@Body() dto: CreateTicketDto, @GetUser('userId') userId: number) {
    return this.ticketsService.create(dto, userId);
  }

  @Get()
  findAll() {
    return this.ticketsService.findAll();
  }

  @Get('my-tickets')
  getUserTickets(@GetUser('userId') userId: number) {
    return this.ticketsService.getUserTickets(userId);
  }

  @Get('event/:eventId')
  getEventTickets(@Param('eventId', ParseIntPipe) eventId: number) {
    return this.ticketsService.getEventTickets(eventId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ticketsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTicketDto,
    @GetUser('userId') userId: number,
  ) {
    return this.ticketsService.update(id, dto, userId);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @GetUser('userId') userId: number) {
    return this.ticketsService.remove(id, userId);
  }
}
