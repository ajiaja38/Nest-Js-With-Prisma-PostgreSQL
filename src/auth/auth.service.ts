import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from 'src/user/dto/Login.dto';
import { UserService } from 'src/user/user.service';
import { JwtPayloadInterface } from './interface';
import { jwtConstant } from './constant';
import { token } from './auth.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly prismaService: PrismaService,
  ) {}

  async generateToken(loginDto: LoginDto): Promise<token> {
    const user = await this.userService.validateCredentials(loginDto);
    const accessToken: string = await this.generateAccessToken(user);
    const refreshToken: string = await this.generateRefreshToken(user);

    return {
      accessToken,
      refreshToken,
    };
  }

  async generateAccessToken(user: JwtPayloadInterface): Promise<string> {
    const payload = {
      id: user.id,
      name: user.name,
    };
    return this.jwtService.sign(payload);
  }

  async generateRefreshToken(user: JwtPayloadInterface): Promise<string> {
    const payload = {
      id: user.id,
      name: user.name,
    };

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d',
      secret: jwtConstant.refreshTokenSecret,
    });

    if (!refreshToken) {
      throw new Error('Gagal Login, Refresh Token Tidak Terbuat');
    }

    const refreshTokenExpiry = new Date();
    refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 7);

    await this.prismaService.auth.create({
      data: {
        userId: user.id,
        refreshToken,
        expires: refreshTokenExpiry,
      },
    });

    return refreshToken;
  }

  async refreshAccessToken(refreshToken: string): Promise<any> {
    const user = await this.prismaService.auth.findUnique({
      where: {
        refreshToken,
      },
    });

    if (!user) {
      throw new BadRequestException(
        'Refresh Token Tidak Valid, silahkan login ulang',
      );
    }

    const payload = this.jwtService.verify(refreshToken, {
      secret: jwtConstant.refreshTokenSecret,
    });

    const accessToken: string = await this.generateAccessToken(payload);

    return {
      accessToken,
    };
  }
}
