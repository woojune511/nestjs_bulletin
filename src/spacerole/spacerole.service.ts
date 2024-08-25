import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateSpaceroleDto } from './dto/create-spacerole.dto';
import { UpdateSpaceroleDto } from './dto/update-spacerole.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Spacerole } from './entities/spacerole.entity';
import { Repository } from 'typeorm';
import { Space } from 'src/space/entities/space.entity';

@Injectable()
export class SpaceroleService {
    constructor(
        @InjectRepository(Space)
        private readonly spaceRepository: Repository<Space>,

        @InjectRepository(Spacerole)
        private readonly spaceroleRepository: Repository<Spacerole>
    ) {}
    
    async findOrCreateRole(spaceId: number, roleName: string, is_admin: boolean): Promise<Spacerole> {
        const space: Space = await this.spaceRepository.findOne({
            where: { id: spaceId }
        })
        
        if (!space) {
            throw new NotFoundException('Space not found');
        }
        
        let role = await this.spaceroleRepository.findOne({
            where: {space: space, name: roleName}
        });
        
        if (!role) {
            role = this.spaceroleRepository.create({
                name: roleName,
                space: space,
                is_admin: is_admin,
            })

            await this.spaceroleRepository.save(role);

        } else if (role.is_admin !== is_admin) {
            throw new BadRequestException(`There already exists a role named ${roleName}, but is_admin is different`);
        }
        
        return role;
    }
}
