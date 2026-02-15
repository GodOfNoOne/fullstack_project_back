import { Body, Controller, Get, Param, Post } from '@nestjs/common';
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
}
