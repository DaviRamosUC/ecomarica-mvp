import { Module } from '@nestjs/common';
import { TiposResiduoController } from './tipos-residuo.controller';
import { TiposResiduoService } from './tipos-residuo.service';

@Module({
  controllers: [TiposResiduoController],
  providers: [TiposResiduoService],
})
export class TiposResiduoModule {}
