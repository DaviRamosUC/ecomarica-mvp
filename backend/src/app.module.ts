import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { DoadoresModule } from './doadores/doadores.module';
import { ColetasModule } from './coletas/coletas.module';
import { RotasModule } from './rotas/rotas.module';
import { NotificacoesModule } from './notificacoes/notificacoes.module';
import { TiposResiduoModule } from './tipos-residuo/tipos-residuo.module';
import { ColetoresModule } from './coletores/coletores.module';
import { PrefeituraModule } from './prefeitura/prefeitura.module';
import { EnderecosModule } from './enderecos/enderecos.module';
import { BannersModule } from './banners/banners.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    HealthModule,
    AuthModule,
    DoadoresModule,
    ColetasModule,
    RotasModule,
    NotificacoesModule,
    TiposResiduoModule,
    ColetoresModule,
    PrefeituraModule,
    EnderecosModule,
    BannersModule,
  ],
})
export class AppModule {}
