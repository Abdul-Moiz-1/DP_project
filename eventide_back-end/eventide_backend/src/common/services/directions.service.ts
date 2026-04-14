import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface RouteResult {
  distance: number;
  duration: number;
  geometry: any;
}

// Strategy Interface
export interface RoutingStrategy {
  getRoute(fromLat: number, fromLng: number, toLat: number, toLng: number): Promise<RouteResult | null>;
}

// Concrete Strategy 1: OSRM
class OsrmStrategy implements RoutingStrategy {
  private readonly logger = new Logger(OsrmStrategy.name);
  constructor(private readonly baseUrl: string) {}

  async getRoute(fromLat: number, fromLng: number, toLat: number, toLng: number): Promise<RouteResult | null> {
    try {
      const url = `${this.baseUrl}/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}?overview=full&geometries=geojson`;
      const response = await fetch(url, {
        headers: { 'User-Agent': 'Eventide/1.0 (event-management-app)' },
      });

      if (!response.ok) {
        this.logger.warn(`OSRM returned ${response.status}`);
        return null;
      }

      const data = await response.json();
      const route = data.routes?.[0];
      if (!route) return null;

      return {
        distance: route.distance || 0,
        duration: route.duration || 0,
        geometry: route.geometry,
      };
    } catch (error) {
      this.logger.error('OSRM directions request failed:', error);
      return null;
    }
  }
}

// Concrete Strategy 2: OpenRouteService
class OrsStrategy implements RoutingStrategy {
  private readonly logger = new Logger(OrsStrategy.name);

  constructor(private readonly apiKey: string) {}

  async getRoute(fromLat: number, fromLng: number, toLat: number, toLng: number): Promise<RouteResult | null> {
    if (!this.apiKey) return null;
    
    try {
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
      this.logger.error('ORS directions request failed:', error);
      return null;
    }
  }
}

// Context: DirectionsService
@Injectable()
export class DirectionsService {
  private readonly logger = new Logger(DirectionsService.name);
  private strategies: RoutingStrategy[] = [];

  constructor(private configService: ConfigService) {
    // Register strategies in priority order
    const osrmUrl = this.configService.get<string>('OSRM_URL', 'https://router.project-osrm.org');
    this.strategies.push(new OsrmStrategy(osrmUrl));
    
    const orsKey = this.configService.get<string>('ORS_API_KEY', '');
    if (orsKey) {
      this.strategies.push(new OrsStrategy(orsKey));
    }
  }

  /**
   * Executes the routing strategies in order until one succeeds.
   * This is an implementation of the Strategy Design Pattern combined with Chain of Responsibility.
   */
  async getDirections(fromLat: number, fromLng: number, toLat: number, toLng: number): Promise<RouteResult | null> {
    for (const strategy of this.strategies) {
      const result = await strategy.getRoute(fromLat, fromLng, toLat, toLng);
      if (result) {
        this.logger.log(`Successfully fetched directions using ${strategy.constructor.name}`);
        return result;
      }
    }
    
    this.logger.warn('All routing strategies failed to find a route.');
    return null;
  }
}
