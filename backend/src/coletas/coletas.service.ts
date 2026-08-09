import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { StatusColeta } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NotificacoesService } from '../notificacoes/notificacoes.service';
import { CriarColetaDto } from './dto/criar-coleta.dto';
import { ConfirmarColetaDto } from './dto/confirmar-coleta.dto';

interface ColetaProxima {
  id: string;
  distanciaMetros: number;
}

const COLETA_ACEITA_INCLUDE = {
  tipoResiduo: true,
  endereco: true,
  doador: { include: { usuario: { select: { nome: true, telefone: true } } } },
};

const STATUS_CONFIRMAVEL: StatusColeta[] = [
  StatusColeta.ACEITA,
  StatusColeta.A_CAMINHO,
];

@Injectable()
export class ColetasService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificacoesService: NotificacoesService,
  ) {}

  async criar(doadorId: string, dto: CriarColetaDto) {
    const tipoResiduo = await this.prisma.tipoResiduo.findUnique({
      where: { id: dto.tipoResiduoId },
    });
    if (!tipoResiduo || !tipoResiduo.ativo) {
      throw new BadRequestException('Tipo de resíduo inválido ou inativo');
    }

    const endereco = await this.prisma.endereco.findUnique({
      where: { id: dto.enderecoId },
    });
    if (!endereco || endereco.doadorId !== doadorId) {
      throw new BadRequestException('Endereço inválido');
    }

    return this.prisma.coleta.create({
      data: {
        doadorId,
        tipoResiduoId: dto.tipoResiduoId,
        quantidadeEstimadaKg: dto.quantidadeEstimadaKg,
        enderecoId: endereco.id,
        latitude: endereco.latitude,
        longitude: endereco.longitude,
        fotoEvidenciaUrl: dto.fotoEvidenciaUrl,
      },
      include: { tipoResiduo: true, endereco: true },
    });
  }

  async listarPorDoador(doadorId: string, status?: StatusColeta) {
    return this.prisma.coleta.findMany({
      where: { doadorId, ...(status ? { status } : {}) },
      include: { tipoResiduo: true, endereco: true },
      orderBy: { dataSolicitacao: 'desc' },
    });
  }

  async listarPorColetor(coletorId: string, status?: StatusColeta) {
    return this.prisma.coleta.findMany({
      where: { coletorId, ...(status ? { status } : {}) },
      include: COLETA_ACEITA_INCLUDE,
      orderBy: { dataSolicitacao: 'desc' },
    });
  }

  async listarDisponiveis(lat: number, lng: number, raioKm: number) {
    const raioMetros = raioKm * 1000;

    const proximas = await this.prisma.$queryRaw<ColetaProxima[]>`
      SELECT
        id,
        ST_Distance(
          ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography,
          ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography
        ) AS "distanciaMetros"
      FROM coletas
      WHERE status = 'AGUARDANDO'
        AND "coletorId" IS NULL
        AND ST_DWithin(
          ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography,
          ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography,
          ${raioMetros}
        )
      ORDER BY "distanciaMetros" ASC
    `;

    if (proximas.length === 0) {
      return [];
    }

    const coletas = await this.prisma.coleta.findMany({
      where: { id: { in: proximas.map((p) => p.id) } },
      include: { tipoResiduo: true, endereco: true },
    });
    const coletasPorId = new Map(coletas.map((coleta) => [coleta.id, coleta]));

    return proximas
      .map((proxima) => {
        const coleta = coletasPorId.get(proxima.id);
        if (!coleta) return null;
        return { ...coleta, distanciaMetros: Number(proxima.distanciaMetros) };
      })
      .filter(
        (coleta): coleta is NonNullable<typeof coleta> => coleta !== null,
      );
  }

  async aceitar(usuarioColetorId: string, coletaId: string) {
    const coletor = await this.prisma.coletor.findUnique({
      where: { usuarioId: usuarioColetorId },
    });
    if (!coletor) {
      throw new NotFoundException('Perfil de coletor não encontrado');
    }
    if (!coletor.homologado) {
      throw new ForbiddenException(
        'Coletor ainda não homologado pela Prefeitura',
      );
    }

    const resultado = await this.prisma.coleta.updateMany({
      where: { id: coletaId, status: StatusColeta.AGUARDANDO },
      data: { coletorId: usuarioColetorId, status: StatusColeta.ACEITA },
    });

    if (resultado.count === 0) {
      const coleta = await this.prisma.coleta.findUnique({
        where: { id: coletaId },
      });
      if (!coleta) {
        throw new NotFoundException('Coleta não encontrada');
      }
      throw new ConflictException(
        'Coleta não está mais disponível para aceite',
      );
    }

    const coletaAceita = await this.prisma.coleta.findUniqueOrThrow({
      where: { id: coletaId },
      include: COLETA_ACEITA_INCLUDE,
    });

    await this.notificacoesService.criar(
      coletaAceita.doadorId,
      `Sua coleta de ${coletaAceita.tipoResiduo.nome} foi aceita por um coletor.`,
    );

    return coletaAceita;
  }

  async confirmar(
    usuarioColetorId: string,
    coletaId: string,
    dto: ConfirmarColetaDto,
  ) {
    const coleta = await this.prisma.coleta.findUnique({
      where: { id: coletaId },
      include: { tipoResiduo: true, endereco: true },
    });
    if (!coleta) {
      throw new NotFoundException('Coleta não encontrada');
    }
    if (coleta.coletorId !== usuarioColetorId) {
      throw new ForbiddenException('Esta coleta não foi aceita por você');
    }
    if (!STATUS_CONFIRMAVEL.includes(coleta.status)) {
      throw new ConflictException('Coleta não está em um status confirmável');
    }

    const pontos = Math.round(
      coleta.tipoResiduo.fatorPontuacaoPorKg.toNumber() * dto.quantidadeRealKg,
    );

    const coletaConfirmada = await this.prisma.$transaction(async (tx) => {
      const coletaAtualizada = await tx.coleta.update({
        where: { id: coletaId },
        data: {
          status: StatusColeta.CONFIRMADA,
          quantidadeRealKg: dto.quantidadeRealKg,
          fotoEvidenciaUrl: dto.fotoEvidenciaUrl,
          dataColeta: new Date(),
          pontosGerados: pontos,
        },
        include: { tipoResiduo: true, endereco: true },
      });

      await tx.pontosTransacao.create({
        data: { doadorId: coleta.doadorId, coletaId: coleta.id, pontos },
      });

      await tx.doador.update({
        where: { usuarioId: coleta.doadorId },
        data: { saldoPontos: { increment: pontos } },
      });

      return coletaAtualizada;
    });

    await this.notificacoesService.criar(
      coleta.doadorId,
      `Sua coleta de ${coleta.tipoResiduo.nome} foi confirmada! Você ganhou ${pontos} pontos.`,
    );

    return coletaConfirmada;
  }

  async cancelar(usuarioColetorId: string, coletaId: string) {
    const coleta = await this.prisma.coleta.findUnique({
      where: { id: coletaId },
    });
    if (!coleta) {
      throw new NotFoundException('Coleta não encontrada');
    }
    if (coleta.coletorId !== usuarioColetorId) {
      throw new ForbiddenException('Esta coleta não foi aceita por você');
    }
    if (!STATUS_CONFIRMAVEL.includes(coleta.status)) {
      throw new ConflictException('Coleta não está em um status cancelável');
    }

    return this.prisma.coleta.update({
      where: { id: coletaId },
      data: { status: StatusColeta.CANCELADA },
      include: { tipoResiduo: true, endereco: true },
    });
  }
}
