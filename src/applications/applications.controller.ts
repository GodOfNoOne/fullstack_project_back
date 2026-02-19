import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { AppType } from '@prisma/client';

@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Get()
  async getApplicationList(
    @Query('username') username: string,
    @Query('role') role: 'bro' | 'member' | 'admin',
    @Query('pageType') pageType: 'Member' | 'Admin',
  ) {
    const applications = this.applicationsService.getApplicationsList(
      username,
      role,
      pageType,
    );
    return applications;
  }

  @Get('available/:appType')
  async getAvailableUsers(
    @Param('appType') appType: string,
  ): Promise<string[]> {
    if (!Object.values(AppType).includes(appType as AppType)) {
      throw new BadRequestException('Invalid appType');
    }

    return this.applicationsService.getAvailableUsers(appType as AppType);
  }

  @Post()
  async createNewApplication(
    @Body() body: { fromUser: string; forUser: string; appType: AppType },
  ) {
    return this.applicationsService.createNewApplication(
      body.fromUser,
      body.forUser,
      body.appType,
    );
  }

  @Patch(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateVote(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { voteType: 'Vote' | 'Unvote'; username: string },
  ) {
    return this.applicationsService.updateAdminVotes(
      id,
      body.voteType,
      body.username,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteApplication(@Param('id', ParseIntPipe) id: number) {
    return this.applicationsService.deleteApplication(id);
  }
}
