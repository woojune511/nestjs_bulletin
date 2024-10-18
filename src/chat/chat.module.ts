import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { UserModule } from 'src/user/user.module';
import { UserspaceModule } from 'src/userspace/userspace.module';
import { PostModule } from 'src/post/post.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chat } from './entities/chat.entity';

@Module({
    imports: [
        UserModule,
        UserspaceModule,
        PostModule,
        TypeOrmModule.forFeature([Chat]),
    ],
    controllers: [ChatController],
    providers: [ChatService],
    exports: [ChatModule, TypeOrmModule],
})
export class ChatModule {}