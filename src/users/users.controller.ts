import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { User, UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async getUserRole(@Query('username') username: string) {
    return this.usersService.getUserRole(username);
  }

  @Post('login')
  async login(@Body() body: { username: string; password: string }) {
    const user = await this.usersService.login(body.username, body.password);

    if (!user) {
      throw new UnauthorizedException('Invalid username or password');
    }

    return user;
  }

  @Post()
  async register(@Body() body: { username: string; password: string }) {
    return this.usersService.register(body.username, body.password);
  }
}
