import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
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
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { EnderecosService } from './enderecos.service';
import { CriarEnderecoDto } from './dto/criar-endereco.dto';
import { AtualizarEnderecoDto } from './dto/atualizar-endereco.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Papel.DOADOR)
@Controller('doadores/me/enderecos')
export class EnderecosController {
  constructor(private readonly enderecosService: EnderecosService) {}

  @Get()
  listar(@CurrentUser() user: AuthenticatedUser) {
    return this.enderecosService.listar(user.id);
  }

  @Post()
  criar(@CurrentUser() user: AuthenticatedUser, @Body() dto: CriarEnderecoDto) {
    return this.enderecosService.criar(user.id, dto);
  }

  @Patch(':id')
  atualizar(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AtualizarEnderecoDto,
  ) {
    return this.enderecosService.atualizar(user.id, id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  remover(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.enderecosService.remover(user.id, id);
  }
}
