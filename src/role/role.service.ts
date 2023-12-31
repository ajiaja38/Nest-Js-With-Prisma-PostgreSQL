import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateRoleDto } from './dto/CreateRole.dto';
import { Role } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class RoleService {
  constructor(private readonly prismaService: PrismaService) {}

  async createRole(createRoleDto: CreateRoleDto): Promise<Role> {
    const result = await this.prismaService.role.create({
      data: {
        id: `Role-${uuidv4()}`,
        name: createRoleDto.name,
      },
    });

    if (!result) {
      throw new BadRequestException(
        'Role gagal ditambahkan!, pastikan sesuai dengan ketentuan',
      );
    }

    return result;
  }

  async getAllRoles(): Promise<Role[]> {
    const result = await this.prismaService.role.findMany();
    return result;
  }

  async getRoleById(id: string): Promise<Role> {
    const result = await this.prismaService.role.findUnique({
      where: {
        id,
      },
    });

    if (!result) {
      throw new NotFoundException('Role tidak ditemukan!, id tidak terdaftar');
    }

    return result;
  }
}
