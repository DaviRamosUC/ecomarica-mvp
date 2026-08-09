import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HomologarColetorDto } from './dto/homologar-coletor.dto';

const PERFIL_INCLUDE = {
  usuario: {
    select: { nome: true, email: true, telefone: true, criadoEm: true },
  },
};

@Injectable()
export class ColetoresService {
  constructor(private readonly prisma: PrismaService) {}

  async listar() {
    return this.prisma.coletor.findMany({
      include: PERFIL_INCLUDE,
      orderBy: [{ homologado: 'asc' }, { usuario: { criadoEm: 'asc' } }],
    });
  }

  async statusHomologacao(usuarioId: string) {
    const coletor = await this.prisma.coletor.findUnique({
      where: { usuarioId },
      include: PERFIL_INCLUDE,
    });
    if (!coletor) {
      throw new NotFoundException('Coletor não encontrado');
    }
    return coletor;
  }

  async homologar(usuarioId: string, dto: HomologarColetorDto) {
    await this.statusHomologacao(usuarioId);
    return this.prisma.coletor.update({
      where: { usuarioId },
      data: { homologado: dto.homologado },
      include: PERFIL_INCLUDE,
    });
  }
}
