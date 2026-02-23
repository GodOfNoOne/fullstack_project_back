import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(username: string, password: string) {
    const user = await this.usersService.validateUser(username, password);

    if (!user) {
      throw new UnauthorizedException('Invalid username or password');
    }

    return this.generateToken(user);
  }

  async register(username: string, password: string) {
    const user = await this.usersService.register(username, password);

    return this.generateToken(user);
  }

  private generateToken(user: any) {
    const payload = {
      username: user.username,
    };

    return {
      access_token: this.jwtService.sign(payload),
      username: user.username,
      role: user.role.toLowerCase(),
    };
  }
}
