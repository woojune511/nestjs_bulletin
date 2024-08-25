import { Module } from '@nestjs/common';
import { SpaceroleService } from './spacerole.service';
import { SpaceroleController } from './spacerole.controller';

@Module({
  controllers: [SpaceroleController],
  providers: [SpaceroleService],
})
export class SpaceroleModule {}
