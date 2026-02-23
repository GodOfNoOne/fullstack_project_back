import { Module } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { ApplicationsController } from './applications.controller';
import { DbModule } from 'src/db/db.module';

@Module({
  providers: [ApplicationsService],
  controllers: [ApplicationsController],
  imports: [DbModule],
})
export class ApplicationsModule {}
