import { Injectable } from '@nestjs/common';
import { StatusRota } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

interface ColetaProxima {
  id: string;
  distanciaMetros: number;
}

const COLETA_ROTA_INCLUDE = {
  tipoResiduo: true,
  endereco: true,
  doador: { include: { usuario: { select: { nome: true, telefone: true } } } },
};

function inicioDoDiaUtc(): Date {
  const hoje = new Date();
  return new Date(
    Date.UTC(hoje.getUTCFullYear(), hoje.getUTCMonth(), hoje.getUTCDate()),
  );
}

@Injectable()
export class RotasService {
  constructor(private readonly prisma: PrismaService) {}

  async rotaDeHoje(usuarioColetorId: string, lat: number, lng: number) {
    const proximas = await this.prisma.$queryRaw<ColetaProxima[]>`
      SELECT
        id,
        ST_Distance(
          ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography,
          ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography
        ) AS "distanciaMetros"
      FROM coletas
      WHERE "coletorId" = ${usuarioColetorId}::uuid
        AND status IN ('ACEITA', 'A_CAMINHO')
      ORDER BY "distanciaMetros" ASC
    `;

    const coletasPorId = new Map(
      (
        await this.prisma.coleta.findMany({
          where: { id: { in: proximas.map((p) => p.id) } },
          include: COLETA_ROTA_INCLUDE,
        })
      ).map((coleta) => [coleta.id, coleta]),
    );

    const coletas = proximas
      .map((proxima) => {
        const coleta = coletasPorId.get(proxima.id);
        if (!coleta) return null;
        return { ...coleta, distanciaMetros: Number(proxima.distanciaMetros) };
      })
      .filter(
        (coleta): coleta is NonNullable<typeof coleta> => coleta !== null,
      );

    const data = inicioDoDiaUtc();
    const coletaIds = coletas.map((coleta) => coleta.id);

    const rotaExistente = await this.prisma.rota.findFirst({
      where: { coletorId: usuarioColetorId, data },
    });

    const rota = rotaExistente
      ? rotaExistente.status === StatusRota.CONCLUIDA
        ? rotaExistente
        : await this.prisma.rota.update({
            where: { id: rotaExistente.id },
            data: { coletaIds },
          })
      : await this.prisma.rota.create({
          data: {
            coletorId: usuarioColetorId,
            data,
            status: StatusRota.PLANEJADA,
            coletaIds,
          },
        });

    return { ...rota, coletas };
  }
}
