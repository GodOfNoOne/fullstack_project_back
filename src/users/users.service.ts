import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as bcrypt from 'bcrypt';

export interface User {
  name: string;
  password: string; // hashed
  role: 'bro' | 'member' | 'admin';
}

@Injectable()
export class UsersService {
  private dataPath = path.join(process.cwd(), 'data', 'users.json');
  private saltRounds = 10;

  private readUsers(): User[] {
    if (!fs.existsSync(this.dataPath)) return [];
    const json = fs.readFileSync(this.dataPath, 'utf-8');
    return JSON.parse(json);
  }

  private writeUsers(users: User[]) {
    fs.writeFileSync(this.dataPath, JSON.stringify(users, null, 2));
  }

  // Return users without password
  private sanitize(user: User): Omit<User, 'password'> {
    const { password, ...rest } = user;
    return rest;
  }

  findAll(): Omit<User, 'password'>[] {
    return this.readUsers().map((u) => this.sanitize(u));
  }

  findOne(username: string): Omit<User, 'password'> {
    const user = this.readUsers().find((u) => u.name === username);
    if (!user) throw new NotFoundException(`User ${username} not found`);
    return this.sanitize(user);
  }
}
