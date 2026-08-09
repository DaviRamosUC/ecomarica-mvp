import {
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CriarEnderecoDto {
  @IsOptional()
  @IsString()
  apelido?: string;

  @IsString()
  @IsNotEmpty()
  rua: string;

  @IsString()
  @IsNotEmpty()
  bairro: string;

  @IsLatitude()
  latitude: number;

  @IsLongitude()
  longitude: number;
}
