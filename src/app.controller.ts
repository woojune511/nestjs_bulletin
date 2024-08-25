import { Controller, Request, Get, Post, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthService } from './auth/auth.service';
import { LocalAuthGuard } from './auth/local-auth.guard';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { JwtAccessAuthGuard } from './auth/jwt-access.guard';

@Controller()
export class AppController {
    constructor(
        private readonly appService: AppService,
        private authService: AuthService
    ) {}
    
    @Get()
    getHello(): string {
        return this.appService.getHello();
    }
    
    @UseGuards(JwtAccessAuthGuard)
    @Get('profile')
    getProfile(@Request() req) {
        return req.user;
    }
}