import { Injectable, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { DbService } from 'src/db/db.service';
import { Roles } from 'src/models/role.model';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: DbService) {}
  private saltRounds = 10;

  async validateUser(username: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { username } });

    if (!user) return null;

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return null;

    return user;
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

      return user;
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
      role: user.role.toLowerCase() as Roles,
    };
  }
}
