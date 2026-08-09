import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CriarBannerDto } from './dto/criar-banner.dto';
import { AtualizarBannerDto } from './dto/atualizar-banner.dto';

@Injectable()
export class BannersService {
  constructor(private readonly prisma: PrismaService) {}

  async listarAtivos() {
    return this.prisma.banner.findMany({
      where: { ativo: true },
      orderBy: { ordem: 'asc' },
    });
  }

  async listarTodos() {
    return this.prisma.banner.findMany({ orderBy: { ordem: 'asc' } });
  }

  async criar(dto: CriarBannerDto) {
    const ordem = dto.ordem ?? (await this.prisma.banner.count());
    return this.prisma.banner.create({ data: { ...dto, ordem } });
  }

  private async buscar(id: string) {
    const banner = await this.prisma.banner.findUnique({ where: { id } });
    if (!banner) {
      throw new NotFoundException('Banner não encontrado');
    }
    return banner;
  }

  async atualizar(id: string, dto: AtualizarBannerDto) {
    await this.buscar(id);
    return this.prisma.banner.update({ where: { id }, data: dto });
  }

  async remover(id: string) {
    await this.buscar(id);
    await this.prisma.banner.delete({ where: { id } });
  }
}
