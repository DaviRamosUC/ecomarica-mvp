import { IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';

export class ConfirmarColetaDto {
  @IsNumber()
  @IsPositive()
  quantidadeRealKg: number;

  @IsString()
  @IsNotEmpty()
  fotoEvidenciaUrl: string;
}
