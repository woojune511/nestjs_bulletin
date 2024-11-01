import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, UnsupportedMediaTypeException, InternalServerErrorException, BadRequestException, UseGuards, Req, NotFoundException, Res } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage, FileFilterCallback } from 'multer';
import * as path from 'path';
import { JwtAccessAuthGuard } from 'src/auth/jwt-access.guard';
// import * as fs from 'fs';
import { instanceToPlain } from 'class-transformer';


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
    async create(@Body() createUserDto: CreateUserDto, @UploadedFile() image: Express.Multer.File): Promise<Object> {
        if (!createUserDto) {
            throw new BadRequestException('User data is missing');
        }
        
        const filename = image?.filename;
        
        if (filename) {
            createUserDto.profile_pic = filename;
        }
        
        const user: User = await this.userService.create(createUserDto);
        const result = instanceToPlain(user);
        return result;
    }
    
    @UseGuards(JwtAccessAuthGuard)
    @Get(':id')
    async findOne(@Req() req: any, @Param('id') id: number): Promise<Object> {
        const user: User = await this.userService.findOne(id);
        if (!user) {
            throw new NotFoundException('User not found');
        }
        
        var result = instanceToPlain(user);
        if (req.user.id !== id) {
            delete result.email;
        }
        
        return result;
    }
    
    @UseGuards(JwtAccessAuthGuard)
    @Patch(':id')
    async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto): Promise<Object> {
        const user: User = await this.userService.update(+id, updateUserDto);
        var result = instanceToPlain(user);
        return result;
    }
}
