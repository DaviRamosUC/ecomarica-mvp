import { IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';

export class CriarTipoResiduoDto {
  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsNumber()
  @IsPositive()
  fatorPontuacaoPorKg: number;
}
