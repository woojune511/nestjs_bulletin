import { IsNotEmpty } from "class-validator";

export class AccessTokenDto {
    @IsNotEmpty()
    access_token: string;
}