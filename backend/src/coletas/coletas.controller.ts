import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Papel } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { ColetasService } from './coletas.service';
import { CriarColetaDto } from './dto/criar-coleta.dto';
import { ListarColetasQueryDto } from './dto/listar-coletas-query.dto';
import { ColetasDisponiveisQueryDto } from './dto/coletas-disponiveis-query.dto';
import { ConfirmarColetaDto } from './dto/confirmar-coleta.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('coletas')
export class ColetasController {
  constructor(private readonly coletasService: ColetasService) {}

  @Roles(Papel.DOADOR)
  @Post()
  criar(@CurrentUser() user: AuthenticatedUser, @Body() dto: CriarColetaDto) {
    return this.coletasService.criar(user.id, dto);
  }

  @Roles(Papel.DOADOR, Papel.COLETOR)
  @Get()
  listar(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ListarColetasQueryDto,
  ) {
    return user.papel === Papel.COLETOR
      ? this.coletasService.listarPorColetor(user.id, query.status)
      : this.coletasService.listarPorDoador(user.id, query.status);
  }

  @Roles(Papel.COLETOR)
  @Get('disponiveis')
  disponiveis(@Query() query: ColetasDisponiveisQueryDto) {
    return this.coletasService.listarDisponiveis(
      query.lat,
      query.lng,
      query.raioKm ?? 5,
    );
  }

  @Roles(Papel.COLETOR)
  @Post(':id/aceitar')
  aceitar(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.coletasService.aceitar(user.id, id);
  }

  @Roles(Papel.COLETOR)
  @Post(':id/confirmar')
  confirmar(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ConfirmarColetaDto,
  ) {
    return this.coletasService.confirmar(user.id, id, dto);
  }

  @Roles(Papel.COLETOR)
  @Post(':id/cancelar')
  cancelar(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.coletasService.cancelar(user.id, id);
  }
}
