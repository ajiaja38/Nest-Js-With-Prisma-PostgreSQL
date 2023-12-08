import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/CreateUser.dto';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './dto/UpdateUser.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(payload: CreateUserDto): Promise<User> {
    const { email, name, password } = payload;

    const now = new Date();
    now.setHours(now.getHours() + 7);
    const createdAt = now.toISOString();
    const updatedAt = createdAt;
    const result = await this.prisma.user.create({
      data: {
        id: `User-${uuidv4()}`,
        email,
        name,
        password: await bcrypt.hash(password, 12),
        createdAt,
        updatedAt,
      },
    });

    if (!result) {
      throw new BadRequestException('User gagal ditambahkan!');
    }

    return result;
  }

  async getAllUsers(search: string, page: number, limit: number): Promise<any> {
    let where: any = {};

    if (search) {
      where = {
        OR: [
          { email: { contains: search, mode: 'insensitive' } },
          { name: { contains: search, mode: 'insensitive' } },
        ],
      };
    }

    const totalData = await this.prisma.user.count({ where });
    const totalPage = Math.ceil(totalData / limit);
    const data = await this.prisma.user.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      totalData,
      totalPage,
      page,
      data,
    };
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
