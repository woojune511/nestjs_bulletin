import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { Request } from "express";
import { UserService } from "src/user/user.service";
import { User } from "src/user/entities/user.entity";
import { jwtConstants } from "./constants";


const cookieExtractor = (req: Request) => {
    let token = null;
    if (req && req.cookies) {
        token = req.cookies['refresh_token'];
    }
    return token;
};


@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh-token') {
    constructor(
        private readonly userService: UserService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
            secretOrKey: jwtConstants.refresh_secret,
            passReqToCallback: true,
            ignoreExpiration: false
        })
    }
    
    async validate(req: Request, payload) {
        const refreshToken = req.cookies['refresh_token'];
        const user: User = await this.userService.getUserIfRefreshTokenMatches(
            refreshToken,
            payload.sub
        );
        return user;
    }
}