import { IsBoolean, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreatePostDto {
    @IsBoolean()
    @IsNotEmpty()
    is_notice: Boolean;

    @IsBoolean()
    @IsNotEmpty()
    is_anonymous: Boolean;

    @IsString()
    @IsNotEmpty()
    content: String;

    // @IsString()
    // file: String;

    // @IsNumber()
    // @IsNotEmpty()
    // spaceId: number;
}
