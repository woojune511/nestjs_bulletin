import { Body, Injectable } from '@nestjs/common';
import { CreateSpaceDto } from './dto/create-space.dto';
import { UpdateSpaceDto } from './dto/update-space.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Space } from './entities/space.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SpaceService {
    constructor(
        @InjectRepository(Space)
        private spaceRepository: Repository<Space>
    ) {}
    
    async create(@Body() createSpaceDto: CreateSpaceDto): Promise<Space> {
        const space = this.spaceRepository.create(createSpaceDto);
        return this.spaceRepository.save(space);
    }
    
    async findAll(): Promise<Space[]> {
        return this.spaceRepository.find();
    }
    
    async findOne(id: number): Promise<Space> {
        return this.spaceRepository.findOneBy({ id });
    }
    
    async update(id: number, updateSpaceDto: UpdateSpaceDto): Promise<Space> {
        await this.spaceRepository.update(id, updateSpaceDto);
        return this.spaceRepository.findOneBy({ id });
    }
    
    async remove(id: number): Promise<void> {
        await this.spaceRepository.delete(id);
    }
}
