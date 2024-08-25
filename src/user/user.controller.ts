import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, UnsupportedMediaTypeException, InternalServerErrorException, BadRequestException, UseGuards, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage, FileFilterCallback } from 'multer';
import * as path from 'path';
import { JwtAccessAuthGuard } from 'src/auth/jwt-access.guard';
import { Space } from 'src/space/entities/space.entity';

const relative_path = path.join(__dirname, '../../src/images/user_images');

@Controller('user')
export class UserController {
    constructor(
        private readonly userService: UserService,
    ) {}
    
    @Post('signup')
    @UseInterceptors(FileInterceptor('image', {
        fileFilter: (req: Request, file, callback: FileFilterCallback) => {
            if (!file.mimetype.match(/image\/(gif|jpeg|png)/)) {
                return callback(
                    new UnsupportedMediaTypeException(
                        'You can upload only gif, jpeg and png files',
                    ),
                );
            }
            callback(null, true);
        },
        storage: diskStorage({
            destination: relative_path,
            filename: (req, file, callback) => {
                const extArray = file.mimetype.split('/');
                const randomString = Math.random().toString(36).substring(2, 12);
                callback(null, randomString + '.' + extArray[extArray.length - 1]);
            },
        }),
    }))
    async create(@Body() createUserDto: CreateUserDto, @UploadedFile() image: Express.Multer.File): Promise<User> {
        if (!createUserDto) {
            throw new BadRequestException('User data is missing');
        }
        
        const filename = image?.filename;
        
        if (filename) {
            createUserDto.profile_pic = filename;
        }
        
        return this.userService.create(createUserDto);
    }
    
    // @UseGuards(JwtAccessAuthGuard)
    // @Get('allUsers')
    // async findAll(@Req() req: any): Promise<User[]> {
    //     const allUsers: User[] = await this.userService.findAll();
    //     allUsers.forEach(function(user) {
    //         if (user.id !== req.user.id) {
    //             user.email = undefined;
    //         }
    //     });
    
    //     return allUsers;
    
    // }
    
    @UseGuards(JwtAccessAuthGuard)
    @Get(':id')
    async findOne(@Req() req: any, @Param('id') id: string): Promise<User> {
        const result: User = await this.userService.findOne(+id);
        if (req.user.id !== id) {
            result.email = undefined;
        }
        
        result.currentRefreshToken = undefined;
        result.currentRefreshTokenExp = undefined;
        result.id = undefined;
        
        return result;
    }
    
    @UseGuards(JwtAccessAuthGuard)
    @Patch(':id')
    async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto): Promise<User> {
        return this.userService.update(+id, updateUserDto);
    }
    
    // @Delete(':id')
    // async remove(@Param('id') id: string): Promise<void> {
    //     return this.userService.remove(+id);
    // }
    
    @UseGuards(JwtAccessAuthGuard)
    @Get('spaces')
    async spaces(@Req() req: any): Promise<Space[]> {
        const userId = req.user.id;
        return this.userService.getUserSpaces(userId);
    }
}
