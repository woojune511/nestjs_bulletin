import { IsOptional, IsString, ValidateNested } from "class-validator";
import { CreateSpaceroleDto } from "src/spacerole/dto/create-spacerole.dto";

export class CreateSpaceDto {
    
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    logo: string;

    @ValidateNested()
    roles: CreateSpaceroleDto[];

}
