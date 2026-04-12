import { IsString, IsNumber, IsDateString, IsOptional, Min } from 'class-validator';

export class UpdateTicketDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsNumber() @Min(0) price?: number;
  @IsOptional() @IsDateString() salesStartDate?: string;
  @IsOptional() @IsDateString() salesEndDate?: string;
}
