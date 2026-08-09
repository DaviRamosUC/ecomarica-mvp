import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';

export class AtualizarBannerDto {
  @IsOptional()
  @IsString()
  imagemUrl?: string;

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
