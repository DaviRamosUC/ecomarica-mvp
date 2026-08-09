import { IsInt, IsPositive } from 'class-validator';

export class ConverterPontosDto {
  @IsInt()
  @IsPositive()
  pontos: number;
}
