import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { GeocodingService } from 'src/common/services/geocoding.service';

@Controller('geo')
export class GeoController {
  constructor(private readonly geocodingService: GeocodingService) {}

  @Get('search')
  searchPlaces(
    @Query('query') query: string,
    @Query('limit') limit?: number,
  ) {
    if (!query?.trim()) {
      throw new BadRequestException('query is required');
    }

    return this.geocodingService.searchPlaces(query, limit || 5);
  }

  @Get('reverse')
  async reverseGeocode(
    @Query('latitude') latitude: number,
    @Query('longitude') longitude: number,
  ) {
    if (latitude === undefined || longitude === undefined) {
      throw new BadRequestException('latitude and longitude are required');
    }

    const result = await this.geocodingService.reverseGeocode(latitude, longitude);
    if (!result) {
      throw new BadRequestException('Unable to resolve coordinates');
    }

    return result;
  }
}
