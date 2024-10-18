import { Controller, Post, Body, Param, UseGuards, Req, Get } from '@nestjs/common';
import { Post as P } from 'src/post/entities/post.entity';
import { PostService } from './post.service';
import { JwtAccessAuthGuard } from 'src/auth/jwt-access.guard';

@Controller('post')
export class PostController {
    constructor(
        private readonly postService: PostService
    ) {}

    @UseGuards(JwtAccessAuthGuard)
    @Get()
    async getUserPosts(@Req() req: any): Promise<P[]> {
        const userId: number = req.user.id;
        return this.postService.findUserPosts(userId);
    }
}