import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CriarBannerDto {
  @IsString()
  @IsNotEmpty()
  imagemUrl: string;

  @IsOptional()
  @IsString()
  titulo?: string;

  @IsOptional()
  @IsInt()
  ordem?: number;

  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}
