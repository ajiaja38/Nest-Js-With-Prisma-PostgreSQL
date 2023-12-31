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
import { LoginDto } from './dto/Login.dto';
import { JwtPayloadInterface } from 'src/auth/interface';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(payload: CreateUserDto): Promise<User> {
    const { email, name, password, roles } = payload;

    const userId = `User-${uuidv4()}`;
    const now = new Date();
    now.setHours(now.getHours() + 7);
    const createdAt = now.toISOString();
    const updatedAt = createdAt;
    const result = await this.prisma.user.create({
      data: {
        id: userId,
        email,
        name,
        password: await bcrypt.hash(password, 12),
        createdAt,
        updatedAt,
        roles: {
          create: roles.map((roleId) => ({
            role: {
              connect: { id: roleId },
            },
          })),
        },
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
      include: {
        roles: {
          select: {
            role: true,
          },
        },
        post: true,
      },
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
    const result = await this.prisma.$queryRaw`
    SELECT
      "User"."id",
      "User"."email",
      "User"."name",
      "User"."createdAt",
      "User"."updatedAt",
      jsonb_agg(jsonb_build_object('name', "Role"."name")) as "roles",
      CASE
        WHEN COUNT("Post"."id") > 0 THEN jsonb_agg(jsonb_build_object('title', "Post"."title", 'content', "Post"."content", 'createdAt', "Post"."createdAt", 'updatedAt', "Post"."updatedAt"))
        ELSE '[]'::jsonb
      END as "posts"
    FROM
      "User"
    LEFT JOIN
      "RoleUser" ON "User"."id" = "RoleUser"."userId"
    LEFT JOIN
      "Role" ON "RoleUser"."roleId" = "Role"."id"
    LEFT JOIN
      "Post" ON "User"."id" = "Post"."authorId"
    WHERE
      "User"."id" = ${id}
    GROUP BY
      "User"."id";
  `;

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

  async validateCredentials(payload: LoginDto): Promise<JwtPayloadInterface> {
    const { email, password } = payload;

    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      throw new NotFoundException('Email atau password salah!');
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new NotFoundException('Email atau password salah!');
    }

    return {
      id: user.id,
      name: user.name,
    };
  }
}
