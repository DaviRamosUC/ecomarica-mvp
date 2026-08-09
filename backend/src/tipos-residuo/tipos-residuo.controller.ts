import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Papel } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { TiposResiduoService } from './tipos-residuo.service';
import { CriarTipoResiduoDto } from './dto/criar-tipo-residuo.dto';
import { AtualizarTipoResiduoDto } from './dto/atualizar-tipo-residuo.dto';

@UseGuards(JwtAuthGuard)
@Controller('tipos-residuo')
export class TiposResiduoController {
  constructor(private readonly tiposResiduoService: TiposResiduoService) {}

  @Get()
  listar() {
    return this.tiposResiduoService.listar();
  }

  @UseGuards(RolesGuard)
  @Roles(Papel.PREFEITURA)
  @Post()
  criar(@Body() dto: CriarTipoResiduoDto) {
    return this.tiposResiduoService.criar(dto);
  }

  @UseGuards(RolesGuard)
  @Roles(Papel.PREFEITURA)
  @Patch(':id')
  atualizar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AtualizarTipoResiduoDto,
  ) {
    return this.tiposResiduoService.atualizar(id, dto);
  }
}
