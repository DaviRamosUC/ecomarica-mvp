import { IsEnum, IsOptional } from 'class-validator';
import { StatusColeta } from '@prisma/client';

export class ListarColetasQueryDto {
  @IsOptional()
  @IsEnum(StatusColeta)
  status?: StatusColeta;
}
