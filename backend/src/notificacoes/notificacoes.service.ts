import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificacoesService {
  constructor(private readonly prisma: PrismaService) {}

  async criar(usuarioId: string, mensagem: string) {
    return this.prisma.notificacao.create({ data: { usuarioId, mensagem } });
  }

  async listar(usuarioId: string) {
    return this.prisma.notificacao.findMany({
      where: { usuarioId },
      orderBy: { data: 'desc' },
    });
  }

  async marcarComoLida(usuarioId: string, notificacaoId: string) {
    const notificacao = await this.prisma.notificacao.findUnique({
      where: { id: notificacaoId },
    });
    if (!notificacao) {
      throw new NotFoundException('Notificação não encontrada');
    }
    if (notificacao.usuarioId !== usuarioId) {
      throw new ForbiddenException('Esta notificação não pertence a você');
    }

    return this.prisma.notificacao.update({
      where: { id: notificacaoId },
      data: { lida: true },
    });
  }
}
