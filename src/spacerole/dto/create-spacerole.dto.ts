import { IsBoolean, IsString } from "class-validator";
import { PrimaryGeneratedColumn } from "typeorm";

export class CreateSpaceroleDto {

    @IsString()
    name: string;

    @IsBoolean()
    is_admin: boolean;
    
}