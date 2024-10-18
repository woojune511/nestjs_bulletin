import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { SpaceModule } from './space/space.module';
import { AuthModule } from './auth/auth.module';
import { SpaceroleModule } from './spacerole/spacerole.module';
import { UserspaceModule } from './userspace/userspace.module';
import { PostModule } from './post/post.module';
import { ChatModule } from './chat/chat.module';

@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: 'mysql',
            host: 'localhost',
            port: 3306,
            username: 'root',
            password: '0000',
            database: 'test',
            autoLoadEntities: true,
            synchronize: true,
        }),
        UserModule,
        SpaceModule,
        AuthModule,
        SpaceroleModule,
        UserspaceModule,
        PostModule,
        ChatModule
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
