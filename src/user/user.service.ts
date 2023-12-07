import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/CreateUser.dto';
import { v4 as uuidv4 } from 'uuid';
import { UpdateUserDto } from './dto/UpdateUser.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(payload: CreateUserDto): Promise<User> {
    const now = new Date();
    now.setHours(now.getHours() + 7);
    const createdAt = now.toISOString();
    const updatedAt = createdAt;
    const result = await this.prisma.user.create({
      data: {
        id: `User-${uuidv4()}`,
        ...payload,
        createdAt,
        updatedAt,
      },
    });

    if (!result) {
      throw new BadRequestException('User gagal ditambahkan!');
    }

    return result;
  }

  async getAllUsers(): Promise<User[] | []> {
    return await this.prisma.user.findMany();
  }

  async getUserById(id: string): Promise<any> {
    const result = await this.prisma.user.findUnique({
      where: { id },
      include: {
        post: true,
      },
    });

    if (!result) {
      throw new NotFoundException('User tidak ditemukan!');
    }

    return result;
  }

  async updateUserById(id: string, payload: UpdateUserDto): Promise<User> {
    const now = new Date();
    now.setHours(now.getHours() + 7);
    const updatedAt = now.toISOString();
    const result = await this.prisma.user.update({
      where: {
        id,
      },
      data: {
        ...payload,
        updatedAt,
      },
    });

    if (!result) {
      throw new NotFoundException('User tidak ditemukan!');
    }

    return result;
  }

  async deleteUserById(id: string): Promise<void> {
    const result = await this.prisma.user.delete({ where: { id } });

    if (!result) {
      throw new NotFoundException('User tidak ditemukan!');
    }
  }
}
