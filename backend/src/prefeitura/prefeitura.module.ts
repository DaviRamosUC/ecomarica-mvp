import { Module } from '@nestjs/common';
import { PrefeituraController } from './prefeitura.controller';
import { PrefeituraService } from './prefeitura.service';

@Module({
  controllers: [PrefeituraController],
  providers: [PrefeituraService],
})
export class PrefeituraModule {}
