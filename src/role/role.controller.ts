import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/CreateRole.dto';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from 'src/utils/guard/JwtAuth.guard';

@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  async createRoleHandler(@Body() createRoleDto: CreateRoleDto): Promise<Role> {
    return await this.roleService.createRole(createRoleDto);
  }

  @Get()
  async getAllRolesHandler(): Promise<Role[]> {
    return await this.roleService.getAllRoles();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getRoleByIdHandler(@Param('id') id: string): Promise<Role> {
    return await this.roleService.getRoleById(id);
  }
}
