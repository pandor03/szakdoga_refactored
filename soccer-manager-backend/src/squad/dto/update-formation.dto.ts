import { IsString } from 'class-validator';

export class UpdateFormationDto {
  @IsString()
  formation: string;
}