import { Body, ForbiddenException, Injectable, NotFoundException, Req, UseGuards } from '@nestjs/common';
import { CreateSpaceDto } from './dto/create-space.dto';
import { UpdateSpaceDto } from './dto/update-space.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Space } from './entities/space.entity';
import { Repository } from 'typeorm';
import { JwtAccessAuthGuard } from 'src/auth/jwt-access.guard';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/entities/user.entity';
import { Userspace } from 'src/userspace/entities/userspace.entity';
import { Spacerole } from 'src/spacerole/entities/spacerole.entity';
import { SpaceroleService } from 'src/spacerole/spacerole.service';

@Injectable()
export class SpaceService {
    constructor(
        @InjectRepository(Space)
        private spaceRepository: Repository<Space>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Userspace)
        private readonly userspaceRepository: Repository<Userspace>,
        @InjectRepository(Spacerole)
        private readonly spaceroleRepository: Repository<Spacerole>,
        private readonly spaceroleService: SpaceroleService,
    ) {}
    
    async create(@Body() createSpaceDto: CreateSpaceDto, userId: number): Promise<Space> {
        const user = await this.userRepository.findOne({ where: {id: userId } });
        
        if (!user) {
            throw new Error('User not found');
        }
        
        let space = this.spaceRepository.create({
            ...createSpaceDto,
            owner: user,
        });
        
        space = await this.spaceRepository.save(space);
        
        const spacerole = this.spaceroleRepository.create({
            name: 'admin',
            space: space,
            is_admin: true,
        });
        
        await this.spaceroleRepository.save(spacerole);
        
        const userspace = this.userspaceRepository.create({
            userId: user.id,
            spaceId: space.id,
            user: user,
            space: space,
            spacerole: spacerole,
        });
        
        await this.userspaceRepository.save(userspace);
        
        return space;
    }
    
    async handover(spaceId: number, newOwnerId: number, currentOwnerId: number): Promise<Space> {
        const space = await this.spaceRepository.findOne({
            where: { id: spaceId },
            relations: ['owner', 'userSpaces'],
        });
        
        if (!space) {
            throw new NotFoundException('Space not found');
        }
        
        if (space.owner.id !== currentOwnerId) {
            throw new ForbiddenException('You are not the owner of this space');
        }
        
        const newOwner = await this.userRepository.findOne({
            where: {
                id: newOwnerId
            }
        });

        if (!newOwner) {
            throw new NotFoundException('New owner not found');
        }
        
        space.owner = newOwner;
        await this.spaceRepository.save(space);
        
        const userSpaces = await this.userspaceRepository.find({ where: { spaceId: spaceId } });
        
        for (const userSpace of userSpaces) {
            if (userSpace.user.id === currentOwnerId) {
                let memberRole = await this.spaceroleService.findOrCreateRole(spaceId, 'member', false);
                userSpace.spacerole = memberRole;
            } else if (userSpace.user.id === newOwnerId) {
                let adminRole = await this.spaceroleService.findOrCreateRole(spaceId, 'admin', true);
                userSpace.spacerole = adminRole;
            }
            await this.userspaceRepository.save(userSpace);
        }
        
        return space;
    }
}
