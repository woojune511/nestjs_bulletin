import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { CreateUserspaceDto } from './dto/create-userspace.dto';
import { UpdateUserspaceDto } from './dto/update-userspace.dto';
import { User } from 'src/user/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Space } from 'src/space/entities/space.entity';
import { Userspace } from './entities/userspace.entity';
import { Spacerole } from 'src/spacerole/entities/spacerole.entity';
import { instanceToPlain } from 'class-transformer';

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

    async newRole(spaceId: number, adminId: number, newRoleName: string, is_admin: boolean) {
        const admin: User = await this.userRepository.findOne({ where: { id: adminId } });
        const space: Space = await this.spaceRepository.findOne({ where: {id: spaceId } });

        if (!space) {
            throw new BadRequestException('Space not found');
        }

        const userspace: Userspace = await this.userspaceRepository.findOne({
            where: {
                user: admin,
                space: space,
            },
            relations: ['spacerole']
        });

        if (!userspace) {
            throw new BadRequestException('You are not in the space');
        }

        if (!userspace.spacerole.is_admin) {
            throw new ForbiddenException('You do not have permission to perform this action');
        }

        const newRole: Spacerole = await this.spaceroleRepository.findOne({where: {name: newRoleName}});
        if (newRole) {
            throw new BadRequestException('A spacerole ' + newRoleName + ' already exists');
        }

        var newspacerole: Spacerole = await this.spaceroleRepository.create({
            name: newRoleName,
            space: space,
            is_admin: is_admin
        })
        await this.spaceroleRepository.save(newspacerole);

        var result = instanceToPlain(newspacerole);
        result.space = {
            "id": newspacerole.space.id,
            "name": newspacerole.space.name,
        }
        return result;
    }
    
    async changeRole(spaceId: number, userId: number, newRoleName: string, ownerId: number) {
        const owner: User = await this.userRepository.findOne({ where: { id: ownerId } });
        const space: Space = await this.spaceRepository.findOne({ where: {id: spaceId }, relations: ['owner'] });

        if (!space) {
            throw new BadRequestException('Space not found');
        }

        const userspace: Userspace = await this.userspaceRepository.findOne({
            where: {
                user: owner,
                space: space,
            },
            relations: ['spacerole']
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
                space: space,
                user: user_to_change,
            },
            relations: ['spacerole']
        });

        if (!user_to_change) {
            throw new BadRequestException('User not found');
        }

        if (!userspace_to_change) {
            throw new BadRequestException('User is not in the space');
        }

        if (userspace_to_change.spacerole.is_admin && space.owner.id !== owner.id) {
            throw new BadRequestException('Only owner of the space can change the role of admin');
        }

        const spacerole: Spacerole = await this.spaceroleRepository.findOne({
            where: {name: newRoleName, space: space}
        });

        if (!spacerole) {
            throw new BadRequestException('SpaceRole not found');
        }

        userspace_to_change.spacerole = spacerole;
        await this.userspaceRepository.save(userspace_to_change);

        // if ('spacerole' in userspace_to_change) {
        //     delete userspace_to_change.spacerole;
        // }

        return userspace_to_change;
    }

    async deleteRole(spaceId: number, roleName: string, ownerId: number) {
        const owner: User = await this.userRepository.findOne({ where: { id: ownerId } });
        const space: Space = await this.spaceRepository.findOne({ where: {id: spaceId } });

        if (!space) {
            throw new BadRequestException('Space not found');
        }

        const spacerole: Spacerole = await this.spaceroleRepository.findOne({
            where: {name: roleName, space: space}
        });

        if (!spacerole) {
            throw new BadRequestException('Spacerole not found');
        }

        const userspace: Userspace = await this.userspaceRepository.findOne({
            where: {
                space: space,
                user: owner,
            },
            relations: ['spacerole']
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

        await this.spaceroleRepository.delete(spacerole);
    }

    async getUserspaces(userId: number): Promise<Space[]> {
        const user: User = await this.userRepository.findOne({where: {id: userId}});

        if (!user) {
            throw new BadRequestException('User not found');
        }

        const userSpaces = await this.userspaceRepository.find({
            where: { user: user },
            relations: ['space'],
        });
        
        return userSpaces.map(userSpace => userSpace.space);
    }
}
