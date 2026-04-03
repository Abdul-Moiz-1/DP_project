import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  Body,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { SavedEventsService } from './saved-events.service';
import { SaveEventDto } from './dto/saved-event.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';

@Controller('saved-events')
@UseGuards(JwtAuthGuard)
export class SavedEventsController {
  constructor(private readonly savedEventsService: SavedEventsService) {}

  @Post()
  save(@Body() dto: SaveEventDto, @GetUser('userId') userId: number) {
    return this.savedEventsService.save(dto.eventId, userId);
  }

  @Delete(':eventId')
  unsave(
    @Param('eventId', ParseIntPipe) eventId: number,
    @GetUser('userId') userId: number,
  ) {
    return this.savedEventsService.unsave(eventId, userId);
  }

  @Get()
  getMySavedEvents(@GetUser('userId') userId: number) {
    return this.savedEventsService.getMySavedEvents(userId);
  }

  @Get('check/:eventId')
  isEventSaved(
    @Param('eventId', ParseIntPipe) eventId: number,
    @GetUser('userId') userId: number,
  ) {
    return this.savedEventsService.isEventSaved(eventId, userId);
  }
}
