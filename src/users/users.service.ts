import { Injectable, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { DbService } from 'src/db/db.service';

export interface User {
  username: string;
  password: string;
  role: 'bro' | 'member' | 'admin';
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: DbService) {}
  private saltRounds = 10;

  async login(username: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return null;
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return null;
    }

    return {
      username: user.username,
      role: user.role.toLowerCase() as 'bro' | 'member' | 'admin',
    };
  }

  async register(username: string, password: string) {
    const hashedPassword = await bcrypt.hash(password, this.saltRounds);

    try {
      const user = await this.prisma.user.create({
        data: {
          username,
          password: hashedPassword,
        },
      });

      return {
        username: user.username,
        role: user.role.toLowerCase() as 'bro' | 'member' | 'admin',
      };
    } catch (error) {
      // Unique constraint violation
      throw new ConflictException('Username already exists');
    }
  }

  async getUserRole(username: string) {
    const user = await this.prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return null;
    }

    return {
      username: user.username,
      role: user.role.toLowerCase() as 'bro' | 'member' | 'admin',
    };
  }
}
