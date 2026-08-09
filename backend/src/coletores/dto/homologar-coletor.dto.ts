import { IsBoolean } from 'class-validator';

export class HomologarColetorDto {
  @IsBoolean()
  homologado: boolean;
}
