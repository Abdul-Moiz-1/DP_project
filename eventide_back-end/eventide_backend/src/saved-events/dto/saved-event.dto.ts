import { IsNumber, IsNotEmpty } from 'class-validator';

export class SaveEventDto {
  @IsNumber()
  @IsNotEmpty()
  eventId: number;
}
