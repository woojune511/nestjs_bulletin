import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { Space } from 'src/space/entities/space.entity';
import { Userspace } from 'src/userspace/entities/userspace.entity';
import { Post } from 'src/post/entities/post.entity';
import { Chat } from './entities/chat.entity';
import { instanceToPlain } from 'class-transformer';

@Injectable()
export class ChatService {
    constructor(
        @InjectRepository(Post)
        private postRepository: Repository<Post>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Userspace)
        private readonly userspaceRepository: Repository<Userspace>,
        @InjectRepository(Chat)
        private readonly chatRepository: Repository<Chat>
    ) {}

    async create(createChatDto: CreateChatDto, userId: number, postId: number, chatId?: number) {
        const user: User = await this.userRepository.findOne({where: {id: userId}});
        if (!user) {
            throw new BadRequestException('User not found');
        }
        const post: Post = await this.postRepository.findOne({where: {id: postId}, relations: ['space']});

        if (!post) {
            throw new BadRequestException('Post not found');
        }
        const space: Space = post.space;
        const userspace: Userspace = await this.userspaceRepository.findOne({where: {
            user: user,
            space: space
        }});
        
        if (createChatDto.is_anonymous && !userspace) {
            throw new UnauthorizedException('Only member of the space can post an anonymous chat');
        }

        const chat: Chat = await this.chatRepository.create(createChatDto);
        chat.post = post;
        chat.writer = user;
        if (chatId) {
            const parentChat: Chat = await this.chatRepository.findOne({where: {id: chatId}});
            if (!parentChat) {
                throw new BadRequestException('Parent chat not found');
            }
            chat.parent = parentChat;
        }

        await this.chatRepository.save(chat);

        var result = instanceToPlain(chat);
        result.post.space = {
            "id": result.post.space.id,
            "logo": result.post.space.logo,
            "name": result.post.space.name
        };

        delete result.writer;

        return result;
    }
    
    async findAll(userId: number): Promise<Chat[]> {
        const user: User = await this.userRepository.findOne({where: {id: userId}, relations: ['chats']});
        if (!user) {
            throw new BadRequestException('User not found');
        }

        return user.chats;
    }
    
    async remove(userId: number, chatId: number) {
        const user: User = await this.userRepository.findOne({where: {id: userId}, relations: ['chats']});
        if (!user) {
            throw new BadRequestException('User not found');
        }

        const chat: Chat = await this.chatRepository.findOne({where: {id: chatId}, relations: ['writer', 'post', 'post.space', 'post.space.owner']});
        if (!chat) {
            throw new BadRequestException('Chat not found');
        }

        const space: Space = chat.post.space;

        if ((chat.writer.id != user.id) && (space.owner.id != user.id)) {
            throw new UnauthorizedException('Only the owner of the space and the writer of the chat can delete the chat');
        }

        await this.chatRepository.delete(chat);
    }
}
