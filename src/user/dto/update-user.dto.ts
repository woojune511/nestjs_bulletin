import { IsString, IsOptional } from 'class-validator';

export class UpdateUserDto {
    @IsOptional()
    @IsString()
    first_name?: string;
    
    @IsOptional()
    @IsString()
    last_name?: string;
    
    @IsOptional()
    @IsString()
    password?: string;

    @IsOptional()
    @IsString()
    currentRefreshToken: string;

    @IsOptional()
    @IsString()
    currentRefreshTokenExp: string;
}