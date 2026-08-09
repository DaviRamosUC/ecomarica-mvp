import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { StatusMoedaSocialTransacao } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NotificacoesService } from '../notificacoes/notificacoes.service';
import { UpdateDoadorDto } from './dto/update-doador.dto';
import { ConverterPontosDto } from './dto/converter-pontos.dto';

const PERFIL_INCLUDE = {
  usuario: {
    select: { nome: true, email: true, telefone: true, criadoEm: true },
  },
  enderecos: true,
};

@Injectable()
export class DoadoresService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificacoesService: NotificacoesService,
  ) {}

  async buscarPerfil(usuarioId: string) {
    const doador = await this.prisma.doador.findUnique({
      where: { usuarioId },
      include: PERFIL_INCLUDE,
    });
    if (!doador) {
      throw new NotFoundException('Perfil de doador não encontrado');
    }
    return doador;
  }

  async atualizarPerfil(usuarioId: string, dto: UpdateDoadorDto) {
    await this.buscarPerfil(usuarioId);
    return this.prisma.doador.update({
      where: { usuarioId },
      data: dto,
      include: PERFIL_INCLUDE,
    });
  }

  async extratoPontos(usuarioId: string) {
    await this.buscarPerfil(usuarioId);
    return this.prisma.pontosTransacao.findMany({
      where: { doadorId: usuarioId },
      include: { coleta: { include: { tipoResiduo: true } } },
      orderBy: { data: 'desc' },
    });
  }

  async converterPontos(usuarioId: string, dto: ConverterPontosDto) {
    const doador = await this.buscarPerfil(usuarioId);
    if (dto.pontos > doador.saldoPontos) {
      throw new BadRequestException('Saldo de pontos insuficiente');
    }

    const taxaConversao = await this.prisma.taxaConversao.findFirstOrThrow({
      orderBy: { atualizadoEm: 'desc' },
    });
    const valorMoeda = Number(
      (dto.pontos * taxaConversao.valorPorPonto.toNumber()).toFixed(2),
    );

    const transacao = await this.prisma.$transaction(async (tx) => {
      await tx.doador.update({
        where: { usuarioId },
        data: {
          saldoPontos: { decrement: dto.pontos },
          saldoMoedaSocial: { increment: valorMoeda },
        },
      });

      return tx.moedaSocialTransacao.create({
        data: {
          doadorId: usuarioId,
          pontosConvertidos: dto.pontos,
          valorMoeda,
          status: StatusMoedaSocialTransacao.CONCLUIDA,
        },
      });
    });

    await this.notificacoesService.criar(
      usuarioId,
      `Sua conversão de ${dto.pontos} pontos em R$ ${valorMoeda.toFixed(2)} de moeda social foi processada.`,
    );

    return transacao;
  }
}
