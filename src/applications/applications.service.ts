import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { $Enums, AppType, Prisma } from '@prisma/client';
import { DbService } from 'src/db/db.service';
import { PageType, PageTypeEnum } from 'src/models/pageType.model';
import { RolesEnum } from 'src/models/role.model';
import { VoteType, VoteTypeEnum } from 'src/models/voteType.model';

@Injectable()
export class ApplicationsService {
  constructor(private readonly prisma: DbService) {}

  async getApplicationsList(username: string, pageType: PageType) {
    const applications = await this.prisma.applications.findMany({
      where: { appStatus: $Enums.AppStatus.SENT },
    });
    const user = await this.prisma.user.findUnique({
      where: { username },
    });

    const role = user?.role.toLowerCase();

    if (pageType === PageTypeEnum.Admin && role !== RolesEnum.admin) {
      throw new UnauthorizedException();
    }
    if (pageType === PageTypeEnum.Admin) {
      return applications.filter((app) => app.fromUser !== username);
    }

    if (role === RolesEnum.admin) {
      return applications.filter((app) => app.fromUser === username);
    }

    if (role === RolesEnum.member) {
      return applications.filter(
        (app) =>
          app.fromUser === username && app.appType === $Enums.AppType.Member,
      );
    }
    return applications.filter(
      (app) =>
        app.forUser === username && app.appType === $Enums.AppType.Member,
    );
  }

  async getAvailableUsers(appType: AppType) {
    const targetRole =
      appType === $Enums.AppType.Member ? $Enums.Role.BRO : $Enums.Role.MEMBER;

    const allUsers = await this.prisma.user.findMany({
      where: { role: targetRole },
      select: { username: true },
    });

    const existingApps = await this.prisma.applications.findMany({
      where: {
        appType: appType,
        appStatus: { not: $Enums.AppStatus.DELETED },
      },
      select: { forUser: true },
    });

    const takenUsernames = new Set(existingApps.map((app) => app.forUser));

    const availableUsers = allUsers
      .map((u) => u.username)
      .filter((username) => !takenUsernames.has(username));

    return availableUsers;
  }

  async createNewApplication(
    fromUser: string,
    forUser: string,
    appType: AppType,
  ) {
    const sender = await this.prisma.user.findUnique({
      where: { username: fromUser },
    });

    if (!sender) {
      throw new NotFoundException('User Not Found');
    }

    if (sender.role !== $Enums.Role.ADMIN && appType === $Enums.AppType.Admin) {
      throw new UnauthorizedException('User Is Not Admin');
    }

    if (sender.role === $Enums.Role.BRO && appType === $Enums.AppType.Member) {
      throw new UnauthorizedException('Bro is not authorized');
    }

    return await this.prisma.applications.create({
      data: {
        fromUser: fromUser,
        forUser: forUser,
        appType: appType,
      },
    });
  }

  async deleteApplication(id: number) {
    try {
      await this.prisma.applications.update({
        where: { appId: id },
        data: { appStatus: $Enums.AppStatus.DELETED },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Application not found');
      }
      throw error;
    }
  }

  async updateAdminVotes(appId: number, voteType: VoteType, username: string) {
    const user = await this.prisma.user.findUnique({
      where: { username: username },
    });

    if (!user || user.role !== $Enums.Role.ADMIN) {
      throw new ForbiddenException('Only Admins Can Vote');
    }

    const application = await this.prisma.applications.findUnique({
      where: { appId: appId },
    });

    if (!application || application.appStatus !== $Enums.AppStatus.SENT) {
      throw new NotFoundException('Application not found');
    }

    const didVote = application.adminVotes.includes(username);

    if (voteType === VoteTypeEnum.Vote) {
      if (didVote) {
        throw new ConflictException('User Cant Vote, Already Voted');
      }

      await this.prisma.applications.update({
        where: { appId: appId },
        data: { adminVotes: [...application.adminVotes, username] },
      });
    }

    if (voteType === VoteTypeEnum.Unvote) {
      if (!didVote) {
        throw new ConflictException('User Cant Unvote, Didnt Vote');
      }

      await this.prisma.applications.update({
        where: { appId: appId },
        data: {
          adminVotes: application.adminVotes.filter(
            (user) => user !== username,
          ),
        },
      });
    }

    const newApplication = await this.prisma.applications.findUnique({
      where: { appId: appId },
    });

    if (!newApplication || newApplication.appStatus !== $Enums.AppStatus.SENT) {
      throw new NotFoundException('Application not found');
    }

    if (newApplication.adminVotes.length === 2) {
      await this.prisma.applications.update({
        where: { appId: appId },
        data: { appStatus: $Enums.AppStatus.DONE },
      });

      const userToUpdate = newApplication.forUser;
      const updateRole =
        newApplication.appType === $Enums.AppType.Member
          ? $Enums.Role.MEMBER
          : $Enums.Role.ADMIN;

      await this.prisma.user.update({
        where: { username: userToUpdate },
        data: { role: updateRole },
      });
    }
  }
}
