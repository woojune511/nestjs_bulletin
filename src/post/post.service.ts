import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post } from './entities/post.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { Space } from 'src/space/entities/space.entity';
import { Userspace } from 'src/userspace/entities/userspace.entity';
import { instanceToPlain } from 'class-transformer';

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

    async findSpacePosts(userId: number, spaceId: number): Promise<Object[]> {
        const space: Space = await this.spaceRepository.findOne({where: {id: spaceId}});
        if (!space) {
            throw new NotFoundException('Space not found');
        }
        const user: User = await this.userRepository.findOne({where: {id: userId}});
        if (!user) {
            throw new NotFoundException('User not found');
        }
        const userspace: Userspace = await this.userspaceRepository.findOne({where: {user: user, space: space}, relations: ['spacerole']});


        let posts: Post[] = await this.postRepository.find({where: {space: space}, relations: ['writer']});
        var result: Object[] = [];
        posts.forEach((p) => {
            if (!userspace.spacerole?.is_admin && p.is_anonymous && p.writer.id !== userId) {
                p.writer = null;
                result.push(instanceToPlain(p));
            } else {
                var plain_p = instanceToPlain(p);
                plain_p.writer = {
                    "id": p.writer.id,
                    "first_name": p.writer.first_name,
                    "last_name": p.writer.last_name
                }
                result.push(plain_p);
            }
        })
        return result;
    }

    async create(createPostDto: CreatePostDto, spaceId: number, userId: number): Promise<Post> {
        const user: User = await this.userRepository.findOne({ where: {id: userId } });
        if (!user) {
            throw new BadRequestException('User not found');
        }

        const space: Space = await this.spaceRepository.findOne({ where: {id: spaceId }, relations: ['owner'] });
        if (!space) {
            throw new BadRequestException('Space not found');
        }

        const userspace: Userspace = await this.userspaceRepository.findOne(
            { where: {
                user: user,
                space: space,
            },
            relations: ['spacerole']
        });

        if (!userspace && createPostDto.is_anonymous) {
            throw new UnauthorizedException('Only member of the space can post anonymously');
        }

        if (createPostDto.is_anonymous && createPostDto.is_notice) {
            throw new BadRequestException('Notice cannot be anonymous');
        }

        if (createPostDto.is_notice && !userspace.spacerole.is_admin) {
            throw new UnauthorizedException('Only owner of the space can post notices');
        }

        const post: Post = await this.postRepository.create(createPostDto);
        post.writer = user;
        post.space = space;
        await this.postRepository.save(post);

        if ('owner' in post.space) {
            post.space.owner = null;
        }

        if ('code_admin' in post.space) {
            post.space.code_admin = null;
        }

        if ('code_member' in post.space) {
            post.space.code_member = null;
        }

        if (createPostDto.is_anonymous){
            post.writer = null;
        }
        
        return post;
    }
    
    async deletePost(userId: number, postId: number) {
        const post: Post = await this.postRepository.findOne({where: {id: postId}, relations: ['writer', 'space', 'space.owner']});
        if (!post) {
            throw new NotFoundException('Post not found');
        }
        const user: User = await this.userRepository.findOne({where: {id: userId}});

        if (post.writer.id !== userId && post.space.owner.id !== userId) {
            throw new BadRequestException('Only writer of the post and owner of the space can delete the post');
        }

        this.postRepository.remove(post);
    }
}
