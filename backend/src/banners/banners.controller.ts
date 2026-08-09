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
import { BannersService } from './banners.service';
import { CriarBannerDto } from './dto/criar-banner.dto';
import { AtualizarBannerDto } from './dto/atualizar-banner.dto';

@UseGuards(JwtAuthGuard)
@Controller('banners')
export class BannersController {
  constructor(private readonly bannersService: BannersService) {}

  @Get()
  listarAtivos() {
    return this.bannersService.listarAtivos();
  }

  @UseGuards(RolesGuard)
  @Roles(Papel.PREFEITURA)
  @Get('admin')
  listarTodos() {
    return this.bannersService.listarTodos();
  }

  @UseGuards(RolesGuard)
  @Roles(Papel.PREFEITURA)
  @Post()
  criar(@Body() dto: CriarBannerDto) {
    return this.bannersService.criar(dto);
  }

  @UseGuards(RolesGuard)
  @Roles(Papel.PREFEITURA)
  @Patch(':id')
  atualizar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AtualizarBannerDto,
  ) {
    return this.bannersService.atualizar(id, dto);
  }

  @UseGuards(RolesGuard)
  @Roles(Papel.PREFEITURA)
  @Delete(':id')
  @HttpCode(204)
  remover(@Param('id', ParseUUIDPipe) id: string) {
    return this.bannersService.remover(id);
  }
}
