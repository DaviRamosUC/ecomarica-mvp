import { Module } from '@nestjs/common';
import { ColetoresController } from './coletores.controller';
import { ColetoresService } from './coletores.service';

@Module({
  controllers: [ColetoresController],
  providers: [ColetoresService],
})
export class ColetoresModule {}
