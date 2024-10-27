import { Controller, Post, Body, Param, UseGuards, Req, Get, Delete } from '@nestjs/common';
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

    @UseGuards(JwtAccessAuthGuard)
    @Delete(':postId')
    async deletePost(@Req() req: any, @Param('postId') postId: number) {
        const userId: number = req.user.id;
        await this.postService.deletePost(userId, postId);

        return {"message": "Deleted post successfully"};
    }
}