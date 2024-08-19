import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SpaceService } from './space.service';
import { CreateSpaceDto } from './dto/create-space.dto';
import { UpdateSpaceDto } from './dto/update-space.dto';
import { Space } from './entities/space.entity';

@Controller('space')
export class SpaceController {
    constructor(private readonly spaceService: SpaceService) {}
    
    @Post()
    create(@Body() createSpaceDto: CreateSpaceDto): Promise<Space> {
        return this.spaceService.create(createSpaceDto);
    }
    
    @Get()
    findAll(): Promise<Space[]> {
        return this.spaceService.findAll();
    }
    
    @Get(':id')
    findOne(@Param('id') id: string): Promise<Space> {
        return this.spaceService.findOne(+id);
    }
    
    @Patch(':id')
    update(@Param('id') id: string, @Body() updateSpaceDto: UpdateSpaceDto): Promise<Space> {
        return this.spaceService.update(+id, updateSpaceDto);
    }
    
    @Delete(':id')
    remove(@Param('id') id: string): Promise<void> {
        return this.spaceService.remove(+id);
    }
}
