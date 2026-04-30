import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import { EventsService } from './events.service';
import {
  CreateEventDto,
  UpdateEventDto,
  FindEventsDto,
  EventResponseDto,
} from './dto/event.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles/roles.guard';
import { Role } from '../auth/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';
import { GetUser } from '../common/decorators/get-user.decorator';
import { FilesInterceptor } from '@nestjs/platform-express';
import { FilesValidationPipe } from 'src/common/pipes/multiple-files-validation.pipe';
import { DirectionsService } from 'src/common/services/directions.service';

@Controller('events')
export class EventsController {
  constructor(
    private readonly eventsService: EventsService,
    private readonly directionsService: DirectionsService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(UserRole.ORGANIZER)
  @UseInterceptors(FilesInterceptor('files', 5))
  create(
    @Body() dto: CreateEventDto,
    @Body('name') rawName: string,
    @Body('description') rawDescription: string,
    @Body('startDate') rawStartDate: string,
    @Body('endDate') rawEndDate: string,
    @Body('capacity') rawCapacity: string,
    @Body('location') rawLocation: string,
    @Body('tickets') rawTickets: string,
    @Body('categoryIds') rawCategoryIds: string,
    @GetUser('userId') userId: number,
    @UploadedFiles(
      new FilesValidationPipe({
        maxSize: 2 * 1024 * 1024,
        allowedTypes: ['image/png', 'image/jpeg'],
        requireFilesInEachField: false,
      }),
  )
  files: Express.Multer.File[],
  ): Promise<EventResponseDto> {
    return this.eventsService.create(dto, userId, files, {
      name: rawName,
      description: rawDescription,
      startDate: rawStartDate,
      endDate: rawEndDate,
      capacity: rawCapacity,
      location: rawLocation,
      tickets: rawTickets,
      categoryIds: rawCategoryIds,
    });
  }

  @Get()
  findAll(@Query() dto: FindEventsDto): Promise<{
    items: EventResponseDto[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  }> {
    return this.eventsService.findAll(dto);
  }

  @Get('recommended')
  @UseGuards(JwtAuthGuard)
  getRecommended(
    @GetUser('userId') userId: number,
    @Query('latitude') latitude?: number,
    @Query('longitude') longitude?: number,
    @Query('limit') limit?: number,
  ) {
    return this.eventsService.getRecommended(userId, limit || 10, latitude, longitude);
  }

  @Get('trending')
  getTrending(@Query('limit') limit?: number) {
    return this.eventsService.getTrending(limit || 10);
  }

  @Get('nearby')
  getNearby(
    @Query('latitude') latitude: number,
    @Query('longitude') longitude: number,
    @Query('radius') radius?: number,
    @Query('limit') limit?: number,
  ) {
    if (latitude === undefined || longitude === undefined) {
      throw new BadRequestException('latitude and longitude are required');
    }
    return this.eventsService.getNearby(latitude, longitude, radius || 50, limit || 10);
  }

  @Get('my-events')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(UserRole.ORGANIZER)
  getMyEvents(@GetUser('userId') userId: number): Promise<EventResponseDto[]> {
    return this.eventsService.getMyEvents(userId);
  }

  @Get('organizer-stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(UserRole.ORGANIZER)
  getOrganizerStats(@GetUser('userId') userId: number) {
    return this.eventsService.getOrganizerStats(userId);
  }

  @Get(':id/analytics')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(UserRole.ORGANIZER)
  getEventAnalytics(
    @Param('id', ParseIntPipe) id: number,
    @GetUser('userId') userId: number,
  ) {
    return this.eventsService.getEventAnalytics(id, userId);
  }

  @Get(':id/manage')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(UserRole.ORGANIZER)
  getManageEvent(
    @Param('id', ParseIntPipe) id: number,
    @GetUser('userId') userId: number,
  ) {
    return this.eventsService.findManagedEvent(id, userId);
  }

  @Get(':id/directions')
  async getDirections(
    @Param('id', ParseIntPipe) id: number,
    @Query('fromLat') fromLat: number,
    @Query('fromLng') fromLng: number,
  ) {
    if (fromLat === undefined || fromLng === undefined) {
      throw new BadRequestException('fromLat and fromLng are required');
    }
    const event = await this.eventsService.findOne(id);
    const toLat = event.location?.latitude;
    const toLng = event.location?.longitude;
    if (!toLat || !toLng) {
      throw new BadRequestException('Event location coordinates not available');
    }
    const route = await this.directionsService.getDirections(fromLat, fromLng, toLat, toLng);
    if (!route) {
      throw new BadRequestException('Unable to calculate directions');
    }
    return route;
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<EventResponseDto> {
    return this.eventsService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(UserRole.ORGANIZER)
  @UseInterceptors(FilesInterceptor('files', 5))
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEventDto,
    @Body('name') rawName: string,
    @Body('description') rawDescription: string,
    @Body('startDate') rawStartDate: string,
    @Body('endDate') rawEndDate: string,
    @Body('capacity') rawCapacity: string,
    @Body('location') rawLocation: string,
    @Body('tickets') rawTickets: string,
    @Body('categoryIds') rawCategoryIds: string,
    @Body('imageUrls') rawImageUrls: string,
    @GetUser('userId') userId: number,
    @UploadedFiles(
      new FilesValidationPipe({
        maxSize: 2 * 1024 * 1024,
        allowedTypes: ['image/png', 'image/jpeg'],
        requireFilesInEachField: false,
      }),
  )
  files?: Express.Multer.File[],
  ): Promise<EventResponseDto> {
    return this.eventsService.update(id, dto, userId, files, {
      name: rawName,
      description: rawDescription,
      startDate: rawStartDate,
      endDate: rawEndDate,
      capacity: rawCapacity,
      location: rawLocation,
      tickets: rawTickets,
      categoryIds: rawCategoryIds,
      imageUrls: rawImageUrls,
    });
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(UserRole.ORGANIZER)
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: string,
    @GetUser('userId') userId: number,
  ) {
    return this.eventsService.updateStatus(id, status, userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(UserRole.ORGANIZER)
  remove(
    @Param('id', ParseIntPipe) id: number,
    @GetUser('userId') userId: number,
  ): Promise<void> {
    return this.eventsService.remove(id, userId);
  }
}
