import { Chat } from "src/chat/entities/chat.entity";
import { Space } from "src/space/entities/space.entity";
import { User } from "src/user/entities/user.entity";
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Post {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Space, (space) => (space.posts))
    space: Space;

    @OneToMany(() => User, (user) => (user.posts))
    writer: User;

    @Column()
    is_notice: Boolean = false;

    @Column()
    is_anonymous: Boolean = false;

    @Column()
    content: String;

    @Column()
    file: String;

    @OneToMany(() => Chat, (chat) => (chat.post))
    chats: Chat[];
}