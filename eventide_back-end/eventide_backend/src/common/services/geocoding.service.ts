import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface GeocodingResult {
  latitude: number;
  longitude: number;
}

export interface PlaceSuggestion {
  displayName: string;
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

type NominatimAddress = {
  road?: string;
  house_number?: string;
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
  county?: string;
  state?: string;
  country?: string;
  postcode?: string;
};

@Injectable()
export class GeocodingService {
  private readonly logger = new Logger(GeocodingService.name);
  constructor(private readonly configService: ConfigService) {}

  private getBaseUrl() {
    return this.configService.get<string>('NOMINATIM_URL', 'https://nominatim.openstreetmap.org');
  }

  private buildPlaceSuggestion(item: {
    display_name?: string;
    lat: string;
    lon: string;
    address?: NominatimAddress;
  }): PlaceSuggestion {
    const address = item.address || {};
    const streetParts = [address.house_number, address.road].filter(Boolean);

    return {
      displayName: item.display_name || streetParts.join(' ') || 'Unnamed location',
      latitude: parseFloat(item.lat),
      longitude: parseFloat(item.lon),
      address: streetParts.join(' '),
      city:
        address.city ||
        address.town ||
        address.village ||
        address.municipality ||
        address.county ||
        '',
      state: address.state || '',
      country: address.country || '',
      postalCode: address.postcode || '',
    };
  }

  async geocodeAddress(address: string, city: string, country: string): Promise<GeocodingResult | null> {
    try {
      const query = encodeURIComponent(`${address}, ${city}, ${country}`);
      const baseUrl = this.getBaseUrl();
      const url = `${baseUrl}/search?q=${query}&format=json&limit=1`;

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

  async searchPlaces(query: string, limit: number = 5): Promise<PlaceSuggestion[]> {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return [];

    try {
      const encodedQuery = encodeURIComponent(trimmedQuery);
      const baseUrl = this.getBaseUrl();
      const url = `${baseUrl}/search?q=${encodedQuery}&format=jsonv2&addressdetails=1&limit=${Math.min(limit, 10)}`;

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Eventide/1.0 (event-management-app)',
        },
      });

      if (!response.ok) {
        this.logger.warn(`Nominatim search returned ${response.status}`);
        return [];
      }

      const data: {
        display_name?: string;
        lat: string;
        lon: string;
        address?: NominatimAddress;
      }[] = await response.json();

      return data.map((item) => this.buildPlaceSuggestion(item));
    } catch (error) {
      this.logger.error('Place search failed:', error);
      return [];
    }
  }

  async reverseGeocode(latitude: number, longitude: number): Promise<PlaceSuggestion | null> {
    try {
      const baseUrl = this.getBaseUrl();
      const url = `${baseUrl}/reverse?lat=${latitude}&lon=${longitude}&format=jsonv2&addressdetails=1`;

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Eventide/1.0 (event-management-app)',
        },
      });

      if (!response.ok) {
        this.logger.warn(`Nominatim reverse geocoding returned ${response.status}`);
        return null;
      }

      const data: {
        display_name?: string;
        lat: string;
        lon: string;
        address?: NominatimAddress;
      } = await response.json();

      if (!data?.lat || !data?.lon) {
        return null;
      }

      return this.buildPlaceSuggestion(data);
    } catch (error) {
      this.logger.error('Reverse geocoding failed:', error);
      return null;
    }
  }
}
