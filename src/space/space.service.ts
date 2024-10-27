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
import { Chat } from 'src/chat/entities/chat.entity';

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
            code_admin: this.generateRandomString(8),
            code_member: this.generateRandomString(8),
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

        await this.userspaceRepository.save(userspace);
        
        return space;
    }
    
    async handover(spaceId: number, newOwnerId: number, currentOwnerId: number): Promise<Space> {
        const space = await this.spaceRepository.findOne({
            where: { id: spaceId },
            relations: ['owner', 'userspaces'],
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

        if (newOwnerId == space.owner.id) {
            return space;
        }
        
        space.owner = newOwner;
        await this.spaceRepository.save(space);

        const newOwnerUserSpace = await this.userspaceRepository.findOne({
            where: {
                space: space,
                user: newOwner,
            }
        })

        if (!newOwner) {
            throw new BadRequestException('The user you want to hand over the space to is not a member of the space');
        }
        
        const userSpaces = await this.userspaceRepository.find({
            where: { space: space },
            relations: ['user', 'spacerole']
        });

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

        let userspace: Userspace = await this.userspaceRepository.findOne({where: {user: user, space: space}});
        if (userspace) {
            throw new BadRequestException('You are already member of the space');
        }

        let newRole: Spacerole;
        if (is_admin) {
            newRole = await this.spaceroleService.findOrCreateRole(space.id, 'admin', true);
        } else {
            newRole = await this.spaceroleService.findOrCreateRole(space.id, 'member', false);
        }

        let newuserspace: Userspace = await this.userspaceRepository.create({
            user: user,
            space: space,
            spacerole: newRole,
        })

        return await this.userspaceRepository.save(newuserspace);
    }

    async trending(userId: number, spaceId: number): Promise<Post[]> {
        const user: User = await this.userRepository.findOne({where: {id: userId}});
        if (!user) {
            throw new NotFoundException('User not found');
        }

        const space: Space = await this.spaceRepository.findOne({where: {id: spaceId}});
        if (!space) {
            throw new NotFoundException('Space not found');
        }

        const userspace: Userspace = await this.userspaceRepository.findOne({where: {user: user, space: space}});
        if (!userspace) {
            throw new BadRequestException('You are not a member of the space');
        }

        let posts: Post[] = await this.postRepository.find({where: {space: space}, relations: ['writer', 'chats', 'chats.writer']});

        posts.sort((a, b) => {
            let a_chats_except_writers: Chat[] = a.chats.filter(element => element.writer.id !== a.writer.id);
            let b_chats_except_writers: Chat[] = b.chats.filter(element => element.writer.id !== b.writer.id);
            let a_chat_cnt: number = a_chats_except_writers.length;
            let b_chat_cnt: number = b_chats_except_writers.length;

            if (a_chat_cnt == b_chat_cnt) {
                let a_chat_users = new Set(a_chats_except_writers.map(chat => chat.writer.id));
                let b_chat_users = new Set(b_chats_except_writers.map(chat => chat.writer.id));

                return b_chat_users.size - a_chat_users.size;

            } else {
                return b_chat_cnt - a_chat_cnt;
            }
        });
        
        posts = posts.slice(0, 5);
        posts.forEach((p) => {
            delete p.writer;
            delete p.chats;
        })
        return posts;
    }
}
