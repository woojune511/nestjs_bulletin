import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { CreateUserspaceDto } from './dto/create-userspace.dto';
import { UpdateUserspaceDto } from './dto/update-userspace.dto';
import { User } from 'src/user/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Space } from 'src/space/entities/space.entity';
import { Userspace } from './entities/userspace.entity';
import { Spacerole } from 'src/spacerole/entities/spacerole.entity';

@Injectable()
export class UserspaceService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,

        @InjectRepository(Space)
        private spaceRepository: Repository<Space>,

        @InjectRepository(Userspace)
        private userspaceRepository: Repository<Userspace>,

        @InjectRepository(Spacerole)
        private spaceroleRepository: Repository<Spacerole>,
    ) {}
    
    async changeRole(spaceId: number, userId: number, newRoleName: string, ownerId: number) {
        const owner: User = await this.userRepository.findOne({ where: { id: ownerId } });
        const space: Space = await this.spaceRepository.findOne({ where: {id: spaceId } });

        if (!space) {
            throw new BadRequestException('Space not found');
        }

        const userspace: Userspace = await this.userspaceRepository.findOne({
            where: {
                spaceId: spaceId,
                userId: ownerId,
            }
        });

        if (!userspace) {
            throw new BadRequestException('You are not in the space');
        }

        if (!userspace.spacerole.is_admin) {
            throw new ForbiddenException('You do not have permission to perform this action');
        }

        const user_to_change: User = await this.userRepository.findOne({ where: { id: userId } });
        const userspace_to_change: Userspace = await this.userspaceRepository.findOne({
            where: {
                spaceId: spaceId,
                userId: userId,
            }
        });

        if (!user_to_change) {
            throw new BadRequestException('User not found');
        }

        if (!userspace_to_change) {
            throw new BadRequestException('User is not in the space');
        }

        const spacerole: Spacerole = await this.spaceroleRepository.findOne({
            where: {name: newRoleName, space: space}
        });

        if (!spacerole) {
            throw new BadRequestException('SpaceRole not found');
        }

        userspace_to_change.spacerole = spacerole;
        await this.userspaceRepository.save(userspace_to_change);
    }

    async deleteRole(spaceId: number, roleName: string, ownerId: number) {
        const owner: User = await this.userRepository.findOne({ where: { id: ownerId } });
        const space: Space = await this.spaceRepository.findOne({ where: {id: spaceId } });
        const spacerole: Spacerole = await this.spaceroleRepository.findOne({
            where: {name: roleName, space: space}
        });

        if (!space) {
            throw new BadRequestException('Space not found');
        }

        const userspace: Userspace = await this.userspaceRepository.findOne({
            where: {
                spaceId: spaceId,
                userId: ownerId,
            }
        });

        if (!userspace) {
            throw new BadRequestException('You are not in the space');
        }

        if (!userspace.spacerole.is_admin) {
            throw new ForbiddenException('You do not have permission to perform this action');
        }

        const users_with_role: Userspace[] = await this.userspaceRepository.find({
            where: {
                space: space,
                spacerole: spacerole,
            }
        })

        if (users_with_role.length !== 0) {
            throw new BadRequestException('Failed to delete the role; some users have the role');
        }
    }

    // create(createUserspaceDto: CreateUserspaceDto) {
    //     return 'This action adds a new userspace';
    // }
    
    // findAll() {
    //     return `This action returns all userspace`;
    // }
    
    // findOne(id: number) {
    //     return `This action returns a #${id} userspace`;
    // }
    
    // update(id: number, updateUserspaceDto: UpdateUserspaceDto) {
    //     return `This action updates a #${id} userspace`;
    // }
    
    // remove(id: number) {
    //     return `This action removes a #${id} userspace`;
    // }
}
