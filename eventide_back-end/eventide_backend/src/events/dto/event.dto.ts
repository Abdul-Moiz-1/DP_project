import { IsString, IsNotEmpty, IsDateString, IsNumber, IsArray, ValidateNested, IsOptional, Min } from 'class-validator';
import { Type, Transform } from 'class-transformer';

// Nested DTOs
export class LocationDto {
  @IsString() @IsNotEmpty() address: string;
  @IsString() @IsNotEmpty() city: string;
  @IsString() @IsNotEmpty() state: string;
  @IsString() @IsNotEmpty() country: string;
  @IsString() @IsNotEmpty() postalCode: string;
  @IsOptional() @IsNumber() latitude?: number;
  @IsOptional() @IsNumber() longitude?: number;
  @IsOptional() @IsString() googleMapsLink?: string;
}

export class TicketDto {
  @IsString() @IsNotEmpty() name: string;
  @IsNumber() @Min(0) price: number;
  @IsDateString() salesStartDate: string;
  @IsDateString() salesEndDate: string;
}

// Base Event DTO
export class BaseEventDto {
  @IsString() @IsNotEmpty() name: string;
  @IsString() @IsNotEmpty() description: string;
  @IsDateString() startDate: string;
  @IsDateString() endDate: string;
  @Transform(({ value }) => Number(value))
  @IsNumber() @Min(1) capacity: number;
}

// Create Event
export class CreateEventDto extends BaseEventDto {
  @Transform(({ value }) => { try { return typeof value === 'string' ? JSON.parse(value) : value; } catch { return value; } })
  @ValidateNested() @Type(() => LocationDto) location: LocationDto;
  
  @Transform(({ value }) => { try { return typeof value === 'string' ? JSON.parse(value) : value; } catch { return value; } })
  @IsOptional() @IsArray() @IsString({ each: true }) imageUrls?: string[];
  
  @Transform(({ value }) => { try { return typeof value === 'string' ? JSON.parse(value) : value; } catch { return value; } })
  @IsArray() @ValidateNested({ each: true }) @Type(() => TicketDto) tickets: TicketDto[];
  
  @Transform(({ value }) => { try { return typeof value === 'string' ? JSON.parse(value) : value; } catch { return value; } })
  @IsOptional() @IsArray() @IsNumber({}, { each: true }) categoryIds?: number[];
}

// Update Event
export class UpdateEventDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsDateString() startDate?: string;
  @IsOptional() @IsDateString() endDate?: string;
  @IsOptional() @Transform(({ value }) => Number(value)) @IsNumber() @Min(1) capacity?: number;
  
  @IsOptional() 
  @Transform(({ value }) => { try { return typeof value === 'string' ? JSON.parse(value) : value; } catch { return value; } })
  @ValidateNested() @Type(() => LocationDto) location?: LocationDto;
  
  @IsOptional() 
  @Transform(({ value }) => { try { return typeof value === 'string' ? JSON.parse(value) : value; } catch { return value; } })
  @IsArray() @IsString({ each: true }) imageUrls?: string[];
  
  @IsOptional() 
  @Transform(({ value }) => { try { return typeof value === 'string' ? JSON.parse(value) : value; } catch { return value; } })
  @IsArray() @IsNumber({}, { each: true }) categoryIds?: number[];
  
  @IsOptional() 
  @Transform(({ value }) => { try { return typeof value === 'string' ? JSON.parse(value) : value; } catch { return value; } })
  @IsArray() @ValidateNested({ each: true }) @Type(() => TicketDto) tickets: TicketDto[];

}

// Query
export class FindEventsDto {
  @IsOptional() @Type(() => Number) page?: number = 1;
  @IsOptional() @Type(() => Number) limit?: number = 10;
  @IsOptional() @IsString() search?: string;
  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsString() country?: string;
  @IsOptional() @Type(() => Number) categoryId?: number;
  @IsOptional() @IsDateString() startDate?: string;
  @IsOptional() @IsDateString() endDate?: string;
  @IsOptional() @Type(() => Number) minPrice?: number;
  @IsOptional() @Type(() => Number) maxPrice?: number;
  @IsOptional() @Type(() => Number) latitude?: number;
  @IsOptional() @Type(() => Number) longitude?: number;
  @IsOptional() @Type(() => Number) radius?: number;
  @IsOptional() @IsString() sortBy?: 'date' | 'price' | 'distance';
}

// Response
export class EventResponseDto {
  id: number;
  name: string;
  description: string;
  status?: string;
  startDate: Date;
  endDate: Date;
  capacity: number;
  organizer: {
    id: number; name: string; email: string,
    organizerProfile?: {
      organizationName: string;
      address: string;
      city: string;
      state: string;
      country: string;
    }
  };
  location: LocationDto & { id: number };
  images: { id: number; imageUrl: string }[];
  tickets: { id: number; name: string; price: number; salesStartDate: Date; salesEndDate: Date }[];
  bookings?: number
  categories: { id: number; name: string }[];
  createdAt: Date;
  recommendationScore?: number;
  recommendationReasons?: string[];
  distanceKm?: number;
}
