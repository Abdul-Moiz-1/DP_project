import { IsString, IsNotEmpty, IsNumber, IsDateString, Min } from 'class-validator';

export class CreateTicketDto {
  @IsString() @IsNotEmpty() name: string;
  @IsNumber() @Min(0) price: number;
  @IsDateString() salesStartDate: string;
  @IsDateString() salesEndDate: string;
  @IsNumber() eventId: number;
}
