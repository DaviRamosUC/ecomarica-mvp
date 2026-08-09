import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class AtualizarTipoResiduoDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  nome?: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  fatorPontuacaoPorKg?: number;

  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}
