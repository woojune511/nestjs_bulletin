import { forwardRef, Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { ChatModule } from 'src/chat/chat.module';
import { UserModule } from 'src/user/user.module';
import { SpaceModule } from 'src/space/space.module';
import { UserspaceModule } from 'src/userspace/userspace.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';

@Module({
    imports: [
        UserModule,
        forwardRef(() => SpaceModule),
        UserspaceModule,
        TypeOrmModule.forFeature([Post]),
    ],
    controllers: [PostController],
    providers: [PostService],
    exports: [PostService, PostModule, TypeOrmModule]
})
export class PostModule {}
