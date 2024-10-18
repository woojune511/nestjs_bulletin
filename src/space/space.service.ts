import { BadRequestException, Body, ForbiddenException, forwardRef, Inject, Injectable, NotFoundException, Req, UseGuards } from '@nestjs/common';
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
import { randomBytes } from 'crypto';
import { Post } from 'src/post/entities/post.entity';

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
        @InjectRepository(Post)
        private readonly postRepository: Repository<Post>,
        private spaceroleService: SpaceroleService,
    ) {}
    
    generateRandomString(length): String {
        return randomBytes(length).toString('base64').slice(0, length);
    }

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
            user: user,
            space: space,
            spacerole: spacerole,
        });
                
        space.code_admin = this.generateRandomString(8);
        space.code_member = this.generateRandomString(8);

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
        
        const userSpaces = await this.userspaceRepository.find({ where: { space: space } });
        
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

    async enter(userId: number, code: String): Promise<Userspace> {
        const user: User = await this.userRepository.findOne({where: {id: userId}});

        if (!user) {
            throw new BadRequestException('User not found');
        }

        let space: Space = await this.spaceRepository.findOne({where: {code_admin: code}});
        let is_admin: Boolean;
        if (!space) {
            space = await this.spaceRepository.findOne({where: {code_member: code}});
        } else {
            is_admin = true;
        }

        if (!space) {
            throw new BadRequestException('Space not found');
        } else {
            is_admin = false;
        }

        let newRole: Spacerole;
        if (is_admin) {
            newRole = await this.spaceroleService.findOrCreateRole(space.id, 'admin', true);
        } else {
            newRole = await this.spaceroleService.findOrCreateRole(space.id, 'member', false);
        }

        let userspace: Userspace = await this.userspaceRepository.create({
            user: user,
            space: space,
            spacerole: newRole,
        })

        return await this.userspaceRepository.save(userspace);
    }

    async trending(spaceId: number): Promise<Post[]> {
        const space: Space = await this.spaceRepository.findOne({where: {id: spaceId}});
        if (!space) {
            throw new BadRequestException('Space not found');
        }

        const posts: Post[] = await this.postRepository.find({where: {space: space}, relations: ['chats']});

        posts.sort((a, b) => {
            let a_chat_cnt: number = a.chats.length;
            let b_chat_cnt: number = b.chats.length;

            if (a_chat_cnt == b_chat_cnt) {
                let a_chat_users = new Set(a.chats.map(chat => chat.writer.id));
                let b_chat_users = new Set(b.chats.map(chat => chat.writer.id));

                return b_chat_users.size - a_chat_users.size;

            } else {
                return b_chat_cnt - a_chat_cnt;
            }
        });
        
        return posts.slice(0, 5);
    }
}
