import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { Papel } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { DoadoresService } from './doadores.service';
import { UpdateDoadorDto } from './dto/update-doador.dto';
import { ConverterPontosDto } from './dto/converter-pontos.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Papel.DOADOR)
@Controller('doadores')
export class DoadoresController {
  constructor(private readonly doadoresService: DoadoresService) {}

  @Get('me')
  me(@CurrentUser() user: AuthenticatedUser) {
    return this.doadoresService.buscarPerfil(user.id);
  }

  @Patch('me')
  atualizar(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateDoadorDto,
  ) {
    return this.doadoresService.atualizarPerfil(user.id, dto);
  }

  @Get('me/pontos')
  extratoPontos(@CurrentUser() user: AuthenticatedUser) {
    return this.doadoresService.extratoPontos(user.id);
  }

  @Post('me/converter')
  converterPontos(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ConverterPontosDto,
  ) {
    return this.doadoresService.converterPontos(user.id, dto);
  }
}
