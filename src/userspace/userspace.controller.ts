import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { UserspaceService } from './userspace.service';
import { CreateUserspaceDto } from './dto/create-userspace.dto';
import { UpdateUserspaceDto } from './dto/update-userspace.dto';
import { JwtAccessAuthGuard } from 'src/auth/jwt-access.guard';
import { Space } from 'src/space/entities/space.entity';

@Controller('userspace')
export class UserspaceController {
    constructor(
        private readonly userspaceService: UserspaceService,
    ) {}

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
}
