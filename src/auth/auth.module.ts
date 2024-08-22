import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserModule } from 'src/user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.strategy';
import { JwtRefreshStrategy } from './jwt-refresh.strategy';
import { JwtRefreshGuard } from './jwt-refresh.guard';
import { JwtAccessAuthGuard } from './jwt-access.guard';
import { AuthController } from './auth.controller';
import { JwtAccessStrategy } from './jwt-access.strategy';

@Module({
    imports: [
        UserModule,
        PassportModule.register({}),
        JwtModule.registerAsync({
            useFactory: async () => ({
                secret: jwtConstants.access_secret,
                signOptions: {
                    expiresIn: '1h',
                }
            }),
        }),
    ],
    controllers: [
        AuthController
    ],
    providers: [
        AuthService,
        LocalStrategy,
        JwtAccessStrategy,
        JwtRefreshStrategy,
        JwtRefreshGuard,
        JwtAccessAuthGuard,
    ],
    exports: [
        AuthService
    ]
})
export class AuthModule {}