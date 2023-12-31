import { Body, Controller, Post, Put } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from 'src/user/dto/Login.dto';

export type token = {
  accessToken: string;
  refreshToken: string;
};

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async loginHandler(@Body() loginDto: LoginDto): Promise<token> {
    return await this.authService.generateToken(loginDto);
  }

  @Put('refreshToken')
  async refreshTokenHandler(@Body() payload: { refreshToken: string }) {
    return await this.authService.refreshAccessToken(payload.refreshToken);
  }
}
