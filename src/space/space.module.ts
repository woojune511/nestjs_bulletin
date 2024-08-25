import { Module } from '@nestjs/common';
import { SpaceService } from './space.service';
import { SpaceController } from './space.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Space } from './entities/space.entity';
import { UserModule } from 'src/user/user.module';

@Module({
    imports: [
        UserModule,
        TypeOrmModule.forFeature([Space])
    ],
    controllers: [SpaceController],
    providers: [SpaceService],
})
export class SpaceModule {}
