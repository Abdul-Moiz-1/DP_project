import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface RouteResult {
  distance: number;
  duration: number;
  geometry: any;
}

@Injectable()
export class DirectionsService {
  private readonly logger = new Logger(DirectionsService.name);
  private readonly apiKey: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('ORS_API_KEY', '');
  }

  async getDirections(
    fromLat: number,
    fromLng: number,
    toLat: number,
    toLng: number,
  ): Promise<RouteResult | null> {
    try {
      if (!this.apiKey) {
        this.logger.warn('ORS_API_KEY not configured, returning null');
        return null;
      }

      const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${this.apiKey}&start=${fromLng},${fromLat}&end=${toLng},${toLat}`;

      const response = await fetch(url, {
        headers: { Accept: 'application/json, application/geo+json' },
      });

      if (!response.ok) {
        this.logger.warn(`ORS returned ${response.status}`);
        return null;
      }

      const data = await response.json();
      const feature = data.features?.[0];
      if (!feature) return null;

      return {
        distance: feature.properties?.segments?.[0]?.distance || 0,
        duration: feature.properties?.segments?.[0]?.duration || 0,
        geometry: feature.geometry,
      };
    } catch (error) {
      this.logger.error('Directions request failed:', error);
      return null;
    }
  }
}
