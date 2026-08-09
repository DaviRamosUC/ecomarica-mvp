import {
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class AtualizarEnderecoDto {
  @IsOptional()
  @IsString()
  apelido?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  rua?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  bairro?: string;

  @IsOptional()
  @IsLatitude()
  latitude?: number;

  @IsOptional()
  @IsLongitude()
  longitude?: number;
}
