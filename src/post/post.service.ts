import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post } from './entities/post.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { Space } from 'src/space/entities/space.entity';
import { Userspace } from 'src/userspace/entities/userspace.entity';

@Injectable()
export class PostService {
    constructor(
        @InjectRepository(Post)
        private postRepository: Repository<Post>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Space)
        private readonly spaceRepository: Repository<Space>,
        @InjectRepository(Userspace)
        private readonly userspaceRepository: Repository<Userspace>,
    ) {}

    async findUserPosts(userId: number): Promise<Post[]> {
        const user: User = await this.userRepository.findOne({where: {id: userId}});

        if (!user) {
            throw new BadRequestException('User not found');
        }

        return this.postRepository.find({where: {writer: user}});
    }

    async findSpacePosts(spaceId: number): Promise<Post[]> {
        const space: Space = await this.spaceRepository.findOne({where: {id: spaceId}});

        if (!space) {
            throw new BadRequestException('Space not found');
        }

        return this.postRepository.find({where: {space: space}});
    }

    async create(createPostDto: CreatePostDto, userId: number): Promise<Post> {
        const user: User = await this.userRepository.findOne({ where: {id: userId } });
        if (!user) {
            throw new BadRequestException('User not found');
        }

        const spaceId: number = createPostDto.spaceId;
        const space: Space = await this.spaceRepository.findOne({ where: {id: spaceId } });
        if (!space) {
            throw new BadRequestException('Space not found');
        }

        const userspace: Userspace = await this.userspaceRepository.findOne({ where: {
            user: user,
            space: space,
        }});

        if (!userspace) {
            throw new UnauthorizedException('You are not a member of the space');
        }

        if (createPostDto.is_anonymous && createPostDto.is_notice) {
            throw new BadRequestException('Notice cannot be anonymous');
        }

        const is_owner: Boolean = (space.owner.id === user.id);

        if (createPostDto.is_notice && !is_owner) {
            throw new UnauthorizedException('Only owner of the space can post notices');
        }

        const post: Post = await this.postRepository.create(createPostDto);
        post.writer = user;
        await this.postRepository.save(post);
        return post;
    }
    
    remove(id: number) {
        return `This action removes a #${id} post`;
    }
}
