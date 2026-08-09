import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { Papel } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ColetoresService } from './coletores.service';
import { HomologarColetorDto } from './dto/homologar-coletor.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Papel.PREFEITURA)
@Controller('coletores')
export class ColetoresController {
  constructor(private readonly coletoresService: ColetoresService) {}

  @Get()
  listar() {
    return this.coletoresService.listar();
  }

  @Get(':id/homologar')
  statusHomologacao(@Param('id', ParseUUIDPipe) id: string) {
    return this.coletoresService.statusHomologacao(id);
  }

  @Patch(':id/homologar')
  homologar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: HomologarColetorDto,
  ) {
    return this.coletoresService.homologar(id, dto);
  }
}
