import { Injectable } from '@nestjs/common';
import { StatusColeta, StatusMoedaSocialTransacao } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AtualizarTaxaConversaoDto } from './dto/atualizar-taxa-conversao.dto';

interface ImpactoBairroRaw {
  bairro: string;
  pesoColetadoKg: unknown;
}

@Injectable()
export class PrefeituraService {
  constructor(private readonly prisma: PrismaService) {}

  async dashboard() {
    const [
      agregadoColetas,
      doadoresAtivos,
      coletoresHomologados,
      agregadoMoeda,
      impactoPorBairro,
    ] = await Promise.all([
      this.prisma.coleta.aggregate({
        where: { status: StatusColeta.CONFIRMADA },
        _count: true,
        _sum: { quantidadeRealKg: true, pontosGerados: true },
      }),
      this.prisma.doador.count(),
      this.prisma.coletor.count({ where: { homologado: true } }),
      this.prisma.moedaSocialTransacao.aggregate({
        where: { status: StatusMoedaSocialTransacao.CONCLUIDA },
        _sum: { valorMoeda: true },
      }),
      this.prisma.$queryRaw<ImpactoBairroRaw[]>`
          SELECT e.bairro AS bairro, SUM(c."quantidadeRealKg") AS "pesoColetadoKg"
          FROM coletas c
          JOIN enderecos e ON e.id = c."enderecoId"
          WHERE c.status = 'CONFIRMADA'
          GROUP BY e.bairro
          ORDER BY "pesoColetadoKg" DESC
        `,
    ]);

    return {
      totalColetas: agregadoColetas._count,
      totalPesoColetadoKg:
        agregadoColetas._sum.quantidadeRealKg?.toNumber() ?? 0,
      totalPontosDistribuidos: agregadoColetas._sum.pontosGerados ?? 0,
      doadoresAtivos,
      coletoresHomologados,
      totalMoedaSocialEmitida: agregadoMoeda._sum.valorMoeda?.toNumber() ?? 0,
      impactoPorBairro: impactoPorBairro.map((item) => ({
        bairro: item.bairro,
        pesoColetadoKg: Number(item.pesoColetadoKg),
      })),
    };
  }

  async obterTaxaConversao() {
    return this.prisma.taxaConversao.findFirstOrThrow({
      orderBy: { atualizadoEm: 'desc' },
    });
  }

  async atualizarTaxaConversao(dto: AtualizarTaxaConversaoDto) {
    const taxa = await this.prisma.taxaConversao.findFirst({
      orderBy: { atualizadoEm: 'desc' },
    });

    if (!taxa) {
      return this.prisma.taxaConversao.create({
        data: { valorPorPonto: dto.valorPorPonto },
      });
    }

    return this.prisma.taxaConversao.update({
      where: { id: taxa.id },
      data: { valorPorPonto: dto.valorPorPonto },
    });
  }
}
