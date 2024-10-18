import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/user/entities/user.entity";
import { UserService } from "src/user/user.service";
import { Repository } from "typeorm";
import { jwtConstants } from "./constants";
import { RefreshTokenDto } from "./refresh-token.dto";

@Injectable()
export class AuthService {
    constructor(
        private userService: UserService,
        private jwtService: JwtService
    ) {}
    
    async validateUser(email: string, password: string): Promise<any> {
        const user = await this.userService.findOneByEmail(email);
        if (user && user.password === password) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }
    
    async generateAccessToken(user: User): Promise<string> {
        const payload = {
            sub: user.id,
            email: user.email,
        }
        
        return this.jwtService.signAsync(payload);
    }
    
    async generateRefreshToken(user: User): Promise<string> {
        const payload = {
            sub: user.id,
            email: user.email,
        }
        
        return this.jwtService.signAsync({sub: payload.sub}, {
            secret: jwtConstants.refresh_secret,
            expiresIn: '30d',
        })
    }
    
    async refresh(refreshTokenDto: RefreshTokenDto): Promise<{ accessToken: string}> {
        const { refresh_token } = refreshTokenDto;
        
        const decodedRefreshToken = this.jwtService.verify(refresh_token, { secret: jwtConstants.refresh_secret });
        
        const userId = decodedRefreshToken.id;
        const user = await this.userService.getUserIfRefreshTokenMatches(refresh_token, userId);
        if (!user) {
            throw new UnauthorizedException('Invalid user');
        }
        
        const accessToken = await this.generateAccessToken(user);
        
        return { accessToken };
    }
}