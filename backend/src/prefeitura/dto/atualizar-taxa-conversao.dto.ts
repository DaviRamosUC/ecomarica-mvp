import { IsNumber, IsPositive } from 'class-validator';

export class AtualizarTaxaConversaoDto {
  @IsNumber()
  @IsPositive()
  valorPorPonto: number;
}
