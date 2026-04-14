import { Module } from '@nestjs/common';
import { GeoController } from './geo.controller';
import { GeocodingService } from 'src/common/services/geocoding.service';

@Module({
  controllers: [GeoController],
  providers: [GeocodingService],
})
export class GeoModule {}
