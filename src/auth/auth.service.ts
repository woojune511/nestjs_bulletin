import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/user/entities/user.entity";
import { UserService } from "src/user/user.service";
import { Repository } from "typeorm";

@Injectable()
export class AuthService {
    constructor(
        private userService: UserService,
        private jwtService: JwtService
    ) {}

    async signIn(email: string, password: string): Promise<{access_token: string}> {
        if (!email) {
            throw new BadRequestException('이메일을 입력해주세요');
        }

        if (!password) {
            throw new BadRequestException('비밀번호를 입력해주세요');
        }

        const user = await this.userService.findOneByEmail(email);

        if (!user) {
            throw new UnauthorizedException('등록되지 않은 사용자입니다.');
        }

        if (password !== user?.password) {
            throw new UnauthorizedException('비밀번호가 일치하지 않습니다.');
        }

        const payload = {sub: user.id, email: user.email};
        return {
            access_token: await this.jwtService.signAsync(payload),
        };
    }
}