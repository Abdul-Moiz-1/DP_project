import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  Validate,
  ValidateNested,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

const parseJson = <T>(value: unknown, fallback: T): T => {
  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  }

  if (value === undefined || value === null) {
    return fallback;
  }

  return value as T;
};

const parseNumberValue = (value: unknown) => {
  if (value === '' || value === null || value === undefined) {
    return value;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? value : parsed;
};

@ValidatorConstraint({ name: 'TicketDatesValidConstraint', async: false })
class TicketDatesValidConstraint implements ValidatorConstraintInterface {
  validate(tickets: TicketDto[], args: ValidationArguments) {
    if (!Array.isArray(tickets) || tickets.length === 0) return true;

    const dto = args.object as CreateEventDto | UpdateEventDto;
    const eventStartValue = dto.startDate;
    if (!eventStartValue) return true;

    const eventStart = new Date(eventStartValue);
    if (Number.isNaN(eventStart.getTime())) return false;

    return tickets.every((ticket) => {
      const salesStart = new Date(ticket.salesStartDate);
      const salesEnd = new Date(ticket.salesEndDate);

      if (Number.isNaN(salesStart.getTime()) || Number.isNaN(salesEnd.getTime())) {
        return false;
      }

      return salesStart < salesEnd && salesEnd <= eventStart;
    });
  }

  defaultMessage() {
    return 'Ticket sales must end before the event starts';
  }
}

export class LocationDto {
  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  state: string;

  @IsString()
  @IsNotEmpty()
  country: string;

  @IsString()
  @IsNotEmpty()
  postalCode: string;

  @IsOptional()
  @Transform(({ value }) => parseNumberValue(value))
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @Transform(({ value }) => parseNumberValue(value))
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsString()
  googleMapsLink?: string;
}

export class TicketDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @Transform(({ value }) => parseNumberValue(value))
  @IsNumber()
  @Min(0)
  price: number;

  @IsDateString()
  salesStartDate: string;

  @IsDateString()
  salesEndDate: string;
}

export class BaseEventDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @Transform(({ value }) => parseNumberValue(value))
  @IsNumber()
  @Min(1)
  capacity: number;
}

export class CreateEventDto extends BaseEventDto {
  @Transform(({ value }) => parseJson<LocationDto | unknown>(value, value as LocationDto))
  @ValidateNested()
  @Type(() => LocationDto)
  location: LocationDto;

  @Transform(({ value }) => parseJson<string[]>(value, []))
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imageUrls?: string[];

  @Transform(({ value }) => parseJson<TicketDto[]>(value, []))
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TicketDto)
  @Validate(TicketDatesValidConstraint)
  tickets: TicketDto[];

  @Transform(({ value }) => {
    const parsed = parseJson<unknown[]>(value, []);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item) => Number(item)).filter((item) => !Number.isNaN(item));
  })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  categoryIds?: number[];
}

export class UpdateEventDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @Transform(({ value }) => parseNumberValue(value))
  @IsNumber()
  @Min(1)
  capacity?: number;

  @IsOptional()
  @Transform(({ value }) => parseJson<LocationDto | unknown>(value, value as LocationDto))
  @ValidateNested()
  @Type(() => LocationDto)
  location?: LocationDto;

  @IsOptional()
  @Transform(({ value }) => parseJson<string[]>(value, []))
  @IsArray()
  @IsString({ each: true })
  imageUrls?: string[];

  @IsOptional()
  @Transform(({ value }) => {
    const parsed = parseJson<unknown[]>(value, []);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item) => Number(item)).filter((item) => !Number.isNaN(item));
  })
  @IsArray()
  @IsNumber({}, { each: true })
  categoryIds?: number[];

  @IsOptional()
  @Transform(({ value }) => parseJson<TicketDto[]>(value, []))
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TicketDto)
  @Validate(TicketDatesValidConstraint)
  tickets?: TicketDto[];
}

export class FindEventsDto {
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @Type(() => Number)
  categoryId?: number;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @Type(() => Number)
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  maxPrice?: number;

  @IsOptional()
  @Type(() => Number)
  latitude?: number;

  @IsOptional()
  @Type(() => Number)
  longitude?: number;

  @IsOptional()
  @Type(() => Number)
  radius?: number;

  @IsOptional()
  @IsString()
  sortBy?: 'date' | 'price' | 'distance';
}

export class EventResponseDto {
  id: number;
  name: string;
  description: string;
  status?: string;
  startDate: Date;
  endDate: Date;
  capacity: number;
  organizer: {
    id: number;
    name: string;
    email: string;
    organizerProfile?: {
      organizationName: string;
      address: string;
      city: string;
      state: string;
      country: string;
    };
  };
  location: LocationDto & { id: number };
  images: { id: number; imageUrl: string }[];
  tickets: { id: number; name: string; price: number; salesStartDate: Date; salesEndDate: Date }[];
  bookings?: number;
  categories: { id: number; name: string }[];
  createdAt: Date;
  recommendationScore?: number;
  recommendationReasons?: string[];
  distanceKm?: number;
}
