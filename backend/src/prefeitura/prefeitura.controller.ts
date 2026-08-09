import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { Papel } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { PrefeituraService } from './prefeitura.service';
import { AtualizarTaxaConversaoDto } from './dto/atualizar-taxa-conversao.dto';

@UseGuards(JwtAuthGuard)
@Controller('prefeitura')
export class PrefeituraController {
  constructor(private readonly prefeituraService: PrefeituraService) {}

  @UseGuards(RolesGuard)
  @Roles(Papel.PREFEITURA)
  @Get('dashboard')
  dashboard() {
    return this.prefeituraService.dashboard();
  }

  // Sem @Roles: qualquer usuário autenticado pode consultar a taxa vigente
  // (o doador precisa dela para exibir o equivalente em R$ do seu saldo).
  @Get('taxa-conversao')
  obterTaxaConversao() {
    return this.prefeituraService.obterTaxaConversao();
  }

  @UseGuards(RolesGuard)
  @Roles(Papel.PREFEITURA)
  @Patch('taxa-conversao')
  atualizarTaxaConversao(@Body() dto: AtualizarTaxaConversaoDto) {
    return this.prefeituraService.atualizarTaxaConversao(dto);
  }
}
