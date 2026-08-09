import {
  IsEmail,
  IsEnum,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsString,
  MinLength,
  ValidateIf,
} from 'class-validator';

export enum PapelRegistro {
  DOADOR = 'DOADOR',
  COLETOR = 'COLETOR',
}

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  senha: string;

  @IsString()
  @IsNotEmpty()
  telefone: string;

  @IsEnum(PapelRegistro)
  papel: PapelRegistro;

  @ValidateIf((dto: RegisterDto) => dto.papel === PapelRegistro.DOADOR)
  @IsString()
  @IsNotEmpty()
  endereco?: string;

  @ValidateIf((dto: RegisterDto) => dto.papel === PapelRegistro.DOADOR)
  @IsString()
  @IsNotEmpty()
  bairro?: string;

  @ValidateIf((dto: RegisterDto) => dto.papel === PapelRegistro.DOADOR)
  @IsLatitude()
  latitude?: number;

  @ValidateIf((dto: RegisterDto) => dto.papel === PapelRegistro.DOADOR)
  @IsLongitude()
  longitude?: number;

  @ValidateIf((dto: RegisterDto) => dto.papel === PapelRegistro.COLETOR)
  @IsString()
  @IsNotEmpty()
  veiculo?: string;

  @ValidateIf((dto: RegisterDto) => dto.papel === PapelRegistro.COLETOR)
  @IsString()
  @IsNotEmpty()
  areaAtuacao?: string;
}
