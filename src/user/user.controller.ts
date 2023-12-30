import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from '@prisma/client';
import { CreateUserDto } from './dto/CreateUser.dto';
import { UpdateUserDto } from './dto/UpdateUser.dto';
import { JwtAuthGuard } from 'src/utils/guard/JwtAuth.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async createUserHandler(@Body() payload: CreateUserDto): Promise<User> {
    return await this.userService.createUser(payload);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getAllUsersHandler(
    @Query('search') search: string,
    @Query('page', ParseIntPipe) page: number,
    @Query('limit', ParseIntPipe) limit: number,
  ): Promise<User[] | []> {
    return await this.userService.getAllUsers(search, page, limit);
  }

  @Get(':id')
  async getUserByIdHandler(@Param('id') id: string): Promise<User> {
    return await this.userService.getUserById(id);
  }

  @Put(':id')
  async updateUserByIdHandler(
    @Param('id') id: string,
    @Body() payload: UpdateUserDto,
  ): Promise<User> {
    return await this.userService.updateUserById(id, payload);
  }

  @Delete(':id')
  async deleteUserByIdHandler(@Param('id') id: string): Promise<void> {
    return await this.userService.deleteUserById(id);
  }
}
