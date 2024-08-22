import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as ms from 'ms';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) {}
    
    async create(createUserDto: CreateUserDto): Promise<User> {
        const user = this.userRepository.create(createUserDto);
        return this.userRepository.save(user);
    }
    
    async findAll(): Promise<User[]> {
        return this.userRepository.find();
    }
    
    async findOne(id: number): Promise<User> {
        return this.userRepository.findOneBy({ id });
    }
    
    async findOneByEmail(email: string): Promise<User | null> {
        return this.userRepository.findOneBy({
            email,
        });
    }
    
    async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
        await this.userRepository.update(id, updateUserDto);
        return this.userRepository.findOneBy({ id });
    }
    
    async remove(id: number): Promise<void> {
        await this.userRepository.delete(id);
    }
    
    async setCurrentRefreshToken(token: string, id: number) {
        const currentRefreshTokenExp = await this.getCurrentRefreshTokenExp();
        await this.userRepository.update(id, {
            currentRefreshToken: token,
            currentRefreshTokenExp: currentRefreshTokenExp,
        });
    }
    
    async getCurrentRefreshTokenExp(): Promise<Date> {
        const currentDate = new Date();
        const currentRefreshTokenExp = new Date(currentDate.getTime() + ms('30d'));
        return currentRefreshTokenExp;
    }
    
    async getUserIfRefreshTokenMatches(refreshToken: string, userId: number): Promise<User> {
        const user: User = await this.findOne(userId);
        
        if (!user.currentRefreshToken) {
            return null;
        }
        
        if (refreshToken === user.currentRefreshToken) {
            return user;
        }
    }
    
    async removeRefreshToken(id: number): Promise<any> {
        return await this.userRepository.update(id, {
            currentRefreshToken: null,
            currentRefreshTokenExp: null,
        });
    }
}
