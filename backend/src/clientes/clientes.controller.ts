import { Controller, Post, Body, Get, Delete, Param, Put } from '@nestjs/common';
import { ClientesService } from './clientes.service';
import { ClienteDto } from './dto/client.dto';

@Controller('clientes')
export class ClientesController {
  constructor(private readonly clientesService: ClientesService) {}

  @Post()
  async create(@Body() dto: ClienteDto) {
    return this.clientesService.create(dto);
  }

  @Get()
  async findAll() {
    return this.clientesService.findAll();
  }

  @Get(":id")
  async findOne(@Param("id") id: string) {
    return this.clientesService.findOne(id);
  }

  @Put(':id')
  async update( @Param('id') id: string, @Body() dto: ClienteDto) {
    return this.clientesService.update(id, dto);
  }

  @Delete(":id")
  async remove(@Param("id") id: string) {
    return this.clientesService.remove(id);
}
}
