import { Module } from '@nestjs/common';
import { NotificacoesModule } from '../notificacoes/notificacoes.module';
import { ColetasController } from './coletas.controller';
import { ColetasService } from './coletas.service';

@Module({
  imports: [NotificacoesModule],
  controllers: [ColetasController],
  providers: [ColetasService],
  exports: [ColetasService],
})
export class ColetasModule {}
