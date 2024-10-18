import { IsBoolean, IsNotEmpty, IsString } from "class-validator";

export class CreateChatDto {
    @IsBoolean()
    @IsNotEmpty()
    is_anonymous: Boolean;

    @IsString()
    @IsNotEmpty()
    content: String;
}
