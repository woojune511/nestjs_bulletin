import { Controller, Get, Body, Patch, Param, Delete, UseGuards, Req, Post } from '@nestjs/common';
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
import { instanceToPlain } from 'class-transformer';
import { Userspace } from 'src/userspace/entities/userspace.entity';

@Controller('space')
export class SpaceController {
    constructor(
        private readonly spaceService: SpaceService,
        private readonly userspaceService: UserspaceService,
        private readonly postService: PostService,
    ) {}
    
    @UseGuards(JwtAccessAuthGuard)
    @Post('create')
    async create(@Body() createSpaceDto: CreateSpaceDto, @Req() req: any) {
        const userId = req.user.id;
        const space: Space = await this.spaceService.create(createSpaceDto, userId);
        delete space.owner;
        return space
    }

    @UseGuards(JwtAccessAuthGuard)
    @Get(':spaceId/handover/:newOwnerId')
    async handover(@Req() req: any, @Param('spaceId') spaceId: number, @Param('newOwnerId') newOwnerId: number) {
        const currentOwnerId = req.user.id;
        var space: Space = await this.spaceService.handover(+spaceId, +newOwnerId, +currentOwnerId);
        var result = instanceToPlain(space);
        delete result.code_admin;
        delete result.code_member;
        delete result.userspaces;
        result.owner = {"id": space.owner.id};

        return result;
    }

    @UseGuards(JwtAccessAuthGuard)
    @Post(':spaceId/newRole')
    async newRole(@Req() req: any, @Param('spaceId') spaceId: number, @Body() body: { newRoleName: string, is_admin: boolean}) {
        const adminId = req.user.id;
        const { newRoleName, is_admin} = body;

        return this.userspaceService.newRole(spaceId, adminId, newRoleName, is_admin);
    }

    @UseGuards(JwtAccessAuthGuard)
    @Patch(':spaceId/changeRole')
    async changeRole(@Req() req: any, @Param('spaceId') spaceId: number, @Body() body: { userId: number, newRoleName: string }) {
        const adminId = req.user.id;
        const { userId, newRoleName } = body;

        return this.userspaceService.changeRole(spaceId, userId, newRoleName, adminId);
    }

    @UseGuards(JwtAccessAuthGuard)
    @Delete(':spaceId/deleteRole')
    async deleteRole(@Req() req: any, @Param('spaceId') spaceId: number, @Body() body: {roleName: string}) {
        const ownerId = req.user.id;
        const { roleName } = body;

        await this.userspaceService.deleteRole(spaceId, roleName, ownerId);
        return {"message": `Deleted spaceRole ${roleName} successfully`};
    }

    @UseGuards(JwtAccessAuthGuard)
    @Post(':spaceId/post')
    async createPost(@Body() createPostDto: CreatePostDto, @Req() req: any, @Param('spaceId') spaceId: number): Promise<Object> {
        const userId: number = req.user.id;
        var post: P = await this.postService.create(createPostDto, spaceId, userId);
        var result = instanceToPlain(post);
        delete result.space.code_admin;
        delete result.space.code_member;
        delete result.space.owner;
        delete result.space.logo;

        if (result.writer) {
            result.writer = {
                "id": result.writer.id,
                "first_name": result.writer.first_name,
                "last_name": result.writer.last_name
            }
        }

        return result;
    }

    @UseGuards(JwtAccessAuthGuard)
    @Post('enter')
    async enter(@Req() req: any, @Body('code') code: String) {
        const userId: number = req.user.id;
        var userspace: Userspace = await this.spaceService.enter(userId, code);
        var result = instanceToPlain(userspace);
        result.user = instanceToPlain(userspace.user);
        result.space = {
            "id": userspace.space.id,
            "name": userspace.space.name
        }
        return result;
    }

    @UseGuards(JwtAccessAuthGuard)
    @Get(':spaceId/posts')
    async findAll(@Req() req: any, @Param('spaceId') spaceId: number): Promise<Object[]> {
        const userId: number = req.user.id;
        const posts: Object[] = await this.postService.findSpacePosts(userId, spaceId);
        return posts;
    }

    @UseGuards(JwtAccessAuthGuard)
    @Get(':spaceId/trending')
    async trending(@Req() req: any, @Param('spaceId') spaceId: number): Promise<P[]> {
        const userId: number = req.user.id;
        return this.spaceService.trending(userId, spaceId);
    }

    @UseGuards(JwtAccessAuthGuard)
    @Get()
    async getUserspaces(@Req() req: any): Promise<Space[]> {
        const userId: number = req.user.id;
        return this.userspaceService.getUserspaces(userId);
    }
}
