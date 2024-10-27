import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { jwtConstants } from './constants';
import { UserService } from 'src/user/user.service';
import { Request } from 'express';

const cookieExtractor = (req: Request) => {
    let token = null;
    if (req && req.cookies) {
        token = req.cookies['access_token'];
    }
    return token;
};

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(Strategy, 'jwt-access-token') {
    constructor(
        private readonly userService: UserService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
            secretOrKey: jwtConstants.access_secret,
            ignoreExpiration: false
        });
    }
    
    async validate(payload: any) {
        const user = await this.userService.findOne(payload.sub);
        return user;
    }
}