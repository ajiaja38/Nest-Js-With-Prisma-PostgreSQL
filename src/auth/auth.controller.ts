import { Body, Controller, Post } from '@nestjs/common';
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
}
