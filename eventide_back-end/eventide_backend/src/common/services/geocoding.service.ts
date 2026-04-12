import { Injectable, Logger } from '@nestjs/common';

interface GeocodingResult {
  latitude: number;
  longitude: number;
}

@Injectable()
export class GeocodingService {
  private readonly logger = new Logger(GeocodingService.name);

  async geocodeAddress(address: string, city: string, country: string): Promise<GeocodingResult | null> {
    try {
      const query = encodeURIComponent(`${address}, ${city}, ${country}`);
      const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`;

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Eventide/1.0 (event-management-app)',
        },
      });

      if (!response.ok) {
        this.logger.warn(`Nominatim returned ${response.status}`);
        return null;
      }

      const data = await response.json();
      if (data && data.length > 0) {
        return {
          latitude: parseFloat(data[0].lat),
          longitude: parseFloat(data[0].lon),
        };
      }

      return null;
    } catch (error) {
      this.logger.error('Geocoding failed:', error);
      return null;
    }
  }
}
