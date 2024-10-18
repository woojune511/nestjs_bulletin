import { forwardRef, Module } from '@nestjs/common';
import { SpaceService } from './space.service';
import { SpaceController } from './space.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Space } from './entities/space.entity';
import { UserModule } from 'src/user/user.module';
import { SpaceroleModule } from 'src/spacerole/spacerole.module';
import { UserspaceModule } from 'src/userspace/userspace.module';
import { PostModule } from 'src/post/post.module';

@Module({
    imports: [
        UserModule,
        TypeOrmModule.forFeature([Space]),
        forwardRef(() => SpaceroleModule),
        forwardRef(() => UserspaceModule),
        forwardRef(() => PostModule),
    ],
    controllers: [SpaceController],
    providers: [SpaceService],
    exports: [SpaceModule, TypeOrmModule]
})
export class SpaceModule {}
