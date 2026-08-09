import {
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
} from 'class-validator';

export class CriarColetaDto {
  @IsUUID()
  tipoResiduoId: string;

  @IsUUID()
  enderecoId: string;

  @IsNumber()
  @IsPositive()
  quantidadeEstimadaKg: number;

  @IsOptional()
  @IsString()
  fotoEvidenciaUrl?: string;
}
