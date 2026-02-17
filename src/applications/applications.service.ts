import { Injectable } from '@nestjs/common';
import { DbService } from 'src/db/db.service';

@Injectable()
export class ApplicationsService {
  constructor(private readonly prisma: DbService) {}

  async getApplicationsList(
    username: string,
    role: 'bro' | 'member' | 'admin',
    pageType: 'Member' | 'Admin',
  ) {
    const applications = await this.prisma.applications.findMany();

    if (pageType === 'Admin') {
      return applications.filter((app) => app.fromUser !== username);
    }

    if (role === 'admin') {
      return applications.filter((app) => app.fromUser === username);
    }

    if (role === 'member') {
      return applications.filter(
        (app) => app.fromUser === username && app.appType === 'Member',
      );
    }
    return applications.filter(
      (app) => app.forUser === username && app.appType === 'Member',
    );
  }
}
