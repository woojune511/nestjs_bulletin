import { BadRequestException, Body, Controller, Get, Post, Req, Request, Res, UnauthorizedException, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LocalAuthGuard } from "./local-auth.guard";
import { UserService } from "src/user/user.service";
import { User } from "src/user/entities/user.entity";
import { RefreshTokenDto } from "./refresh-token.dto";
import { Response } from "express";
import { JwtRefreshGuard } from "./jwt-refresh.guard";
import { JwtAccessAuthGuard } from "./jwt-access.guard";

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly userService: UserService,
    ) {}
    
    @Post('login')
    async login(
        @Body() req,
        @Res({ passthrough: true }) res: Response,
    ) {
        const user: User = await this.authService.validateUser(req.email, req.password);
        if (!user) {
            throw new BadRequestException('No user found');
        }
        const access_token = await this.authService.generateAccessToken(user);
        const refresh_token = await this.authService.generateRefreshToken(user);
        
        await this.userService.setCurrentRefreshToken(refresh_token, user.id);

        res.cookie('access_token', access_token, {
          httpOnly: true,
        });
        res.cookie('refresh_token', refresh_token, {
          httpOnly: true,
        });

        return {
            message: 'login success',
            access_token: access_token,
            refresh_token: refresh_token
        };
    }
    
    @Post('refresh')
    async refresh (
        @Body() refreshTokenDto: RefreshTokenDto,
        @Res({ passthrough: true}) res: Response,
    ) {
        try {
            const newAccessToken = (await this.authService.refresh(refreshTokenDto)).accessToken;
            
            res.setHeader('Authorization', 'Bearer ' + newAccessToken);
            res.cookie('access_token', newAccessToken, {
                httpOnly: true,
            });
            res.send({newAccessToken});
        } catch (err) {
            throw new UnauthorizedException('Invalid refresh token');
        }
    }
    
    @Post('logout')
    @UseGuards(JwtRefreshGuard)
    async logout(@Req() req: any, @Res() res: Response): Promise<any> {
        await this.userService.removeRefreshToken(req.user.id);
        res.clearCookie('access_token');
        res.clearCookie('refresh_token');
        return res.send({
            message: 'logout success'
        });
    }

    @Get('authenticate')
    @UseGuards(JwtAccessAuthGuard)
    async user(@Req() req: any, @Res() res: Response): Promise<any> {
      const userId: number = req.user.id;
      const verifiedUser: User = await this.userService.findOne(userId);
      return res.send(verifiedUser);
    }
}