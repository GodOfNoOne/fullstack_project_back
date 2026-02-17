import { Controller, Get, Query } from '@nestjs/common';
import { ApplicationsService } from './applications.service';

@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Get()
  async getApplicationList(
    @Query('username') username: string,
    @Query('role') role: 'bro' | 'member' | 'admin',
    @Query('pageType') pageType: 'Member' | 'Admin',
  ) {
    console.log(username, role, pageType);
    const applications = this.applicationsService.getApplicationsList(
      username,
      role,
      pageType,
    );
    return applications;
  }
}
