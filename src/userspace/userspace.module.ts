import { forwardRef, Module } from '@nestjs/common';
import { UserspaceService } from './userspace.service';
import { UserspaceController } from './userspace.controller';
import { SpaceroleModule } from 'src/spacerole/spacerole.module';
import { UserModule } from 'src/user/user.module';
import { SpaceModule } from 'src/space/space.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Userspace } from './entities/userspace.entity';

@Module({
    imports: [
        UserModule,
        forwardRef(() => SpaceModule),
        SpaceroleModule,
        TypeOrmModule.forFeature([Userspace]),
    ],
    controllers: [UserspaceController],
    providers: [UserspaceService],
    exports: [UserspaceService, UserspaceModule, TypeOrmModule]
})
export class UserspaceModule {}
