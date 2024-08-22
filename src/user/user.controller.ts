import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, UnsupportedMediaTypeException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage, FileFilterCallback } from 'multer';
import * as path from 'path';

const relative_path = path.join(__dirname, '../../src/images/user_images');

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}
    
    @Post()
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
        else {
            throw new BadRequestException('File upload failed');
        }
        
        return this.userService.create(createUserDto);
    }
    
    @Get()
    async findAll(): Promise<User[]> {
        return this.userService.findAll();
        
    }
    
    @Get(':id')
    async findOne(@Param('id') id: string): Promise<Partial<User>> {
        return this.userService.findOne(+id);
    }
    
    @Patch(':id')
    async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto): Promise<User> {
        return this.userService.update(+id, updateUserDto);
    }
    
    @Delete(':id')
    async remove(@Param('id') id: string): Promise<void> {
        return this.userService.remove(+id);
    }
}
