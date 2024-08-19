import { Body, Controller, Get, HttpCode, HttpStatus, Post, Request, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthGuard } from "@nestjs/passport";

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @HttpCode(HttpStatus.OK)
    @Post('login')
    signIn(@Body() signInDto: Record<string, string>) {
        return this.authService.signIn(signInDto.email, signInDto.password);
    }

    @UseGuards(AuthGuard())
    @Get('profile')
    getProfile(@Request() req) {
        return req.user;
    }
}