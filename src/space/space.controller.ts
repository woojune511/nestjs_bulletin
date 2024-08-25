import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { SpaceService } from './space.service';
import { CreateSpaceDto } from './dto/create-space.dto';
import { UpdateSpaceDto } from './dto/update-space.dto';
import { Space } from './entities/space.entity';
import { JwtAccessAuthGuard } from 'src/auth/jwt-access.guard';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/entities/user.entity';

@Controller('space')
export class SpaceController {
    constructor(
        private readonly spaceService: SpaceService,
        private readonly userService: UserService,
    ) {}
    
    @UseGuards(JwtAccessAuthGuard)
    @Post('create')
    create(@Body() createSpaceDto: CreateSpaceDto, @Req() req: any): Promise<Space> {
        const userId = req.user.id;
        return this.spaceService.create(createSpaceDto, userId);
    }

    @UseGuards(JwtAccessAuthGuard)
    @Post('handover')
    handover(@Req() req: any, @Body() body: {spaceId: number, newOwnerId: number}) {
        const currentOwnerId = req.user.id;
        const { spaceId, newOwnerId } = body;

        return this.spaceService.handover(spaceId, newOwnerId, currentOwnerId);
    }
    
    // @Get()
    // findAll(): Promise<Space[]> {
    //     return this.spaceService.findAll();
    // }
    
    // @Get(':id')
    // findOne(@Param('id') id: string): Promise<Space> {
    //     return this.spaceService.findOne(+id);
    // }
    
    // @Patch(':id')
    // update(@Param('id') id: string, @Body() updateSpaceDto: UpdateSpaceDto): Promise<Space> {
    //     return this.spaceService.update(+id, updateSpaceDto);
    // }
    
    // @Delete(':id')
    // remove(@Param('id') id: string): Promise<void> {
    //     return this.spaceService.remove(+id);
    // }
}
