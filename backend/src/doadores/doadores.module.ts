import { Module } from '@nestjs/common';
import { NotificacoesModule } from '../notificacoes/notificacoes.module';
import { DoadoresController } from './doadores.controller';
import { DoadoresService } from './doadores.service';

@Module({
  imports: [NotificacoesModule],
  controllers: [DoadoresController],
  providers: [DoadoresService],
})
export class DoadoresModule {}
