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
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { AppType } from '@prisma/client';
import type { PageType } from 'src/models/pageType.model';
import { VoteType } from 'src/models/voteType.model';
import { JwtAuthGuard } from 'src/auth/auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Get()
  async getApplicationList(
    @Request() req,
    @Query('pageType') pageType: PageType,
  ) {
    const username = req.user.username;

    return this.applicationsService.getApplicationsList(username, pageType);
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
    @Request() req,
    @Body() body: { forUser: string; appType: AppType },
  ) {
    const fromUser = req.user.username;

    return this.applicationsService.createNewApplication(
      fromUser,
      body.forUser,
      body.appType,
    );
  }

  @Patch(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateVote(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { voteType: VoteType },
  ) {
    const username = req.user.username;

    return this.applicationsService.updateAdminVotes(
      id,
      body.voteType,
      username,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteApplication(@Param('id', ParseIntPipe) id: number) {
    return this.applicationsService.deleteApplication(id);
  }
}
