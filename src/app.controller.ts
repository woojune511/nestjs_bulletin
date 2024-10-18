import { Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthService } from './auth/auth.service';
import { LocalAuthGuard } from './auth/local-auth.guard';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { JwtAccessAuthGuard } from './auth/jwt-access.guard';
import { UserService } from './user/user.service';
import { User } from './user/entities/user.entity';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { Response } from 'express';

const relative_path = join(__dirname, '../../src/images/user_images');

@Controller()
export class AppController {
    constructor(
        private readonly appService: AppService,
        private readonly authService: AuthService,
        private readonly userService: UserService,

    ) {}
    
    @Get()
    getHello(): string {
        return this.appService.getHello();
    }
    
    @UseGuards(JwtAccessAuthGuard)
    @Get('profile')
    async getProfile(@Req() req, @Res() res: Response) {
        const user: User = await this.userService.findOne(req.user.id);
        const path = join(relative_path, user.profile_pic);
        const file = await readFile(path);
        const fileBase64 = file.toString('base64');
        const response = {
            profile_image: fileBase64,
            profile_image_name: user.profile_pic,
            user: user,
        };
        // res.setHeader('Content-Disposition', `attachment; filename=${user.profile_pic}`);
        // const extension: String = user.profile_pic.split('.')[-1];
        // res.setHeader('Content-Type', `image/${extension}`);
        // res.send(file.buffer);
        // return req.user;

        return response;
    }
}