import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from 'src/user/user.service';
import { LoginDto } from 'src/user/dto/Login.dto';
import { JwtPayloadInterface } from './interface';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Post('login')
  async loginHandler(@Body() payload: LoginDto): Promise<JwtPayloadInterface> {
    return await this.userService.validateCredentials(payload);
  }
}
