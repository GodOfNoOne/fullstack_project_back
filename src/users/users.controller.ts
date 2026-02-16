import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { User, UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll(): Omit<User, 'password'>[] {
    return this.usersService.findAll();
  }

  @Get(':username')
  getUserByName(@Param('username') username: string): Omit<User, 'password'> {
    return this.usersService.findOne(username);
  }

  @Post()
  async createUser(
    @Body()
    body: {
      name: string;
      password: string;
      role?: 'bro' | 'member' | 'admin';
    },
  ): Promise<Omit<User, 'password'>> {
    return this.usersService.create(body);
  }

  @Post('login')
  async login(
    @Body() body: { name: string; password: string },
  ): Promise<Omit<User, 'password'>> {
    const user = await this.usersService.login(body.name, body.password);
    if (!user) throw new NotFoundException('Invalid username or password');
    return user;
  }
}
