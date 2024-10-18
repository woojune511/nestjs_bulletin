import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { SpaceService } from './space.service';
import { CreateSpaceDto } from './dto/create-space.dto';
import { UpdateSpaceDto } from './dto/update-space.dto';
import { Space } from './entities/space.entity';
import { JwtAccessAuthGuard } from 'src/auth/jwt-access.guard';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/entities/user.entity';
import { UserspaceService } from 'src/userspace/userspace.service';
import { CreatePostDto } from 'src/post/dto/create-post.dto';
import { Post as P } from 'src/post/entities/post.entity';
import { PostService } from 'src/post/post.service';

@Controller('space')
export class SpaceController {
    constructor(
        private readonly spaceService: SpaceService,
        private readonly userspaceService: UserspaceService,
        private readonly postService: PostService,
    ) {}
    
    @UseGuards(JwtAccessAuthGuard)
    @Post('create')
    create(@Body() createSpaceDto: CreateSpaceDto, @Req() req: any): Promise<Space> {
        const userId = req.user.id;
        return this.spaceService.create(createSpaceDto, userId);
    }

    @UseGuards(JwtAccessAuthGuard)
    @Get('handover/:spaceId/:newOwnerId')
    handover(@Req() req: any, @Param('spaceId') spaceId: number, @Param('newOwnerId') newOwnerId: number) {
        const currentOwnerId = req.user.id;
        return this.spaceService.handover(spaceId, newOwnerId, currentOwnerId);
    }

    @UseGuards(JwtAccessAuthGuard)
    @Post('changeRole')
    changeRole(@Req() req: any, @Body() body: { spaceId: number, userId: number, newRoleName: string }) {
        const ownerId = req.user.id;
        const { spaceId, userId, newRoleName } = body;

        return this.userspaceService.changeRole(spaceId, userId, newRoleName, ownerId);
    }

    @UseGuards(JwtAccessAuthGuard)
    @Post('deleteRole')
    deleteRole(@Req() req: any, @Body() body: { spaceId: number, roleName: string}) {
        const ownerId = req.user.id;
        const { spaceId, roleName } = body;

        return this.userspaceService.deleteRole(spaceId, roleName, ownerId);
    }

    @UseGuards(JwtAccessAuthGuard)
    @Post('post')
    createPost(@Body() createPostDto: CreatePostDto, @Req() req: any): Promise<P> {
        const userId: number = req.user.id;
        return this.postService.create(createPostDto, userId);
    }

    @UseGuards(JwtAccessAuthGuard)
    @Post('enter')
    async enter(@Req() req: any, @Body() code: String) {
        const userId: number = req.user.id;
        return await this.spaceService.enter(userId, code);
    }

    @Get('posts/:spaceId')
    async findAll(@Param('spaceId') spaceId: number): Promise<P[]> {
        return this.postService.findSpacePosts(spaceId);
    }

    @Get('trending/:spaceId')
    async trending(@Param('spaceId') spaceId: number): Promise<P[]> {
        return this.spaceService.trending(spaceId);
    }

    @UseGuards(JwtAccessAuthGuard)
    @Get()
    async getUserspaces(@Req() req: any): Promise<Space[]> {
        const userId: number = req.user.id;
        return this.userspaceService.getUserspaces(userId);
    }
}
