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
  password: string;
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

  async create(userData: {
    name: string;
    password: string;
    role?: 'bro' | 'member' | 'admin';
  }): Promise<Omit<User, 'password'>> {
    const users = this.readUsers();

    if (users.some((u) => u.name === userData.name)) {
      throw new ConflictException('Username already exists');
    }

    const hashedPassword = await bcrypt.hash(
      userData.password,
      this.saltRounds,
    );

    const newUser: User = {
      name: userData.name,
      password: hashedPassword,
      role: userData.role || 'bro',
    };

    users.push(newUser);
    this.writeUsers(users);
    return this.sanitize(newUser);
  }

  async login(
    name: string,
    password: string,
  ): Promise<Omit<User, 'password'> | null> {
    const user = this.readUsers().find((u) => u.name === name);
    if (!user) return null;

    const match = await bcrypt.compare(password, user.password);
    if (!match) return null;
    console.log(user);
    return this.sanitize(user);
  }
}
