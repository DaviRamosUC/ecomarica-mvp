import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { Papel, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, PapelRegistro } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

const USUARIO_COM_PERFIL = {
  include: {
    doador: { include: { enderecos: true } },
    coletor: true,
    agentePrefeitura: true,
  },
} satisfies Prisma.UsuarioDefaultArgs;

type UsuarioComPerfil = Prisma.UsuarioGetPayload<typeof USUARIO_COM_PERFIL>;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existente = await this.prisma.usuario.findUnique({
      where: { email: dto.email },
    });
    if (existente) {
      throw new ConflictException('E-mail já cadastrado');
    }

    const senhaHash = await bcrypt.hash(dto.senha, 10);

    const usuario = await this.prisma.usuario.create({
      data: {
        nome: dto.nome,
        email: dto.email,
        senhaHash,
        telefone: dto.telefone,
        papel:
          dto.papel === PapelRegistro.DOADOR ? Papel.DOADOR : Papel.COLETOR,
        doador:
          dto.papel === PapelRegistro.DOADOR
            ? {
                create: {
                  enderecos: {
                    create: {
                      rua: dto.endereco!,
                      bairro: dto.bairro!,
                      latitude: dto.latitude!,
                      longitude: dto.longitude!,
                    },
                  },
                },
              }
            : undefined,
        coletor:
          dto.papel === PapelRegistro.COLETOR
            ? {
                create: {
                  veiculo: dto.veiculo!,
                  areaAtuacao: dto.areaAtuacao!,
                },
              }
            : undefined,
      },
      ...USUARIO_COM_PERFIL,
    });

    return this.buildAuthResponse(usuario);
  }

  async login(dto: LoginDto) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { email: dto.email },
      ...USUARIO_COM_PERFIL,
    });
    if (!usuario) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const senhaValida = await bcrypt.compare(dto.senha, usuario.senhaHash);
    if (!senhaValida) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    return this.buildAuthResponse(usuario);
  }

  async me(usuarioId: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      ...USUARIO_COM_PERFIL,
    });
    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return this.sanitize(usuario);
  }

  private buildAuthResponse(usuario: UsuarioComPerfil) {
    const accessToken = this.jwtService.sign({
      sub: usuario.id,
      papel: usuario.papel,
    });
    return { accessToken, usuario: this.sanitize(usuario) };
  }

  private sanitize(usuario: UsuarioComPerfil) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { senhaHash, ...usuarioSemSenha } = usuario;
    return usuarioSemSenha;
  }
}
