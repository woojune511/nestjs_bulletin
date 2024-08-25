import { Module } from '@nestjs/common';
import { UserspaceService } from './userspace.service';
import { UserspaceController } from './userspace.controller';

@Module({
  controllers: [UserspaceController],
  providers: [UserspaceService],
})
export class UserspaceModule {}
