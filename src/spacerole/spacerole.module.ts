import { forwardRef, Module } from '@nestjs/common';
import { SpaceroleService } from './spacerole.service';
import { SpaceroleController } from './spacerole.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SpaceModule } from 'src/space/space.module';
import { Spacerole } from './entities/spacerole.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Spacerole]),
        forwardRef(() => SpaceModule)
    ],
    controllers: [SpaceroleController],
    providers: [SpaceroleService],
    exports: [SpaceroleService, SpaceroleModule, TypeOrmModule],
})
export class SpaceroleModule {}