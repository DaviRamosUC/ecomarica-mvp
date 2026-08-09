import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CriarEnderecoDto } from './dto/criar-endereco.dto';
import { AtualizarEnderecoDto } from './dto/atualizar-endereco.dto';

@Injectable()
export class EnderecosService {
  constructor(private readonly prisma: PrismaService) {}

  async listar(doadorId: string) {
    return this.prisma.endereco.findMany({
      where: { doadorId },
      orderBy: { criadoEm: 'asc' },
    });
  }

  async criar(doadorId: string, dto: CriarEnderecoDto) {
    return this.prisma.endereco.create({ data: { ...dto, doadorId } });
  }

  private async buscarDoDoador(doadorId: string, enderecoId: string) {
    const endereco = await this.prisma.endereco.findUnique({
      where: { id: enderecoId },
    });
    if (!endereco) {
      throw new NotFoundException('Endereço não encontrado');
    }
    if (endereco.doadorId !== doadorId) {
      throw new ForbiddenException('Este endereço não pertence a você');
    }
    return endereco;
  }

  async atualizar(
    doadorId: string,
    enderecoId: string,
    dto: AtualizarEnderecoDto,
  ) {
    await this.buscarDoDoador(doadorId, enderecoId);
    return this.prisma.endereco.update({
      where: { id: enderecoId },
      data: dto,
    });
  }

  async remover(doadorId: string, enderecoId: string) {
    await this.buscarDoDoador(doadorId, enderecoId);

    const emUso = await this.prisma.coleta.findFirst({
      where: { enderecoId },
    });
    if (emUso) {
      throw new ConflictException(
        'Este endereço já foi usado em uma coleta e não pode ser removido',
      );
    }

    await this.prisma.endereco.delete({ where: { id: enderecoId } });
  }
}
