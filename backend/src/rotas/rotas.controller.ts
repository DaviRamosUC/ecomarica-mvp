import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { Papel } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { RotasService } from './rotas.service';
import { RotaHojeQueryDto } from './dto/rota-hoje-query.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('rotas')
export class RotasController {
  constructor(private readonly rotasService: RotasService) {}

  @Roles(Papel.COLETOR)
  @Get('hoje')
  rotaDeHoje(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: RotaHojeQueryDto,
  ) {
    return this.rotasService.rotaDeHoje(user.id, query.lat, query.lng);
  }
}
