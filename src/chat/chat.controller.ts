import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { JwtAccessAuthGuard } from 'src/auth/jwt-access.guard';
import { Chat } from './entities/chat.entity';

@Controller('chat')
export class ChatController {
    constructor(
        private readonly chatService: ChatService,
    ) {}
    
    @UseGuards(JwtAccessAuthGuard)
    @Get()
    async findAll(@Req() req: any): Promise<Chat[]> {
        const userId: number = req.user.id;
        return await this.chatService.findAll(userId);
    }

    @UseGuards(JwtAccessAuthGuard)
    @Delete(':id')
    async remove(@Req() req: any, @Param('id') chatId: number) {
        const userId: number = req.user.id;
        await this.chatService.remove(userId, chatId);
    }

    @UseGuards(JwtAccessAuthGuard)
    @Post(':postId/chat/:chatId?')
    async newChat(@Req() req: any,  @Body() createChatDto: CreateChatDto, @Param('postId') postId: number, @Param('chatId') chatId?: number): Promise<Chat> {
        const userId: number = req.user.id;
        if (chatId) {
            return this.chatService.create(createChatDto, userId, postId);
        } else {
        return this.chatService.create(createChatDto, userId, postId, chatId);
        }
    }
}
