import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CriarTipoResiduoDto } from './dto/criar-tipo-residuo.dto';
import { AtualizarTipoResiduoDto } from './dto/atualizar-tipo-residuo.dto';

@Injectable()
export class TiposResiduoService {
  constructor(private readonly prisma: PrismaService) {}

  async listar() {
    return this.prisma.tipoResiduo.findMany({ orderBy: { nome: 'asc' } });
  }

  async criar(dto: CriarTipoResiduoDto) {
    const existente = await this.prisma.tipoResiduo.findUnique({
      where: { nome: dto.nome },
    });
    if (existente) {
      throw new ConflictException('Já existe um tipo de resíduo com esse nome');
    }

    return this.prisma.tipoResiduo.create({ data: dto });
  }

  async atualizar(id: string, dto: AtualizarTipoResiduoDto) {
    const existente = await this.prisma.tipoResiduo.findUnique({
      where: { id },
    });
    if (!existente) {
      throw new NotFoundException('Tipo de resíduo não encontrado');
    }

    return this.prisma.tipoResiduo.update({ where: { id }, data: dto });
  }
}
