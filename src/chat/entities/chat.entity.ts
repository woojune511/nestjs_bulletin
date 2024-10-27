import { Post } from "src/post/entities/post.entity";
import { User } from "src/user/entities/user.entity";
import { Column, DeleteDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Chat {
    @PrimaryGeneratedColumn()
    id: number;
    
    @DeleteDateColumn()
    deletedAt?: Date
    
    @ManyToOne(() => Post, (post) => post.chats, {onDelete: 'CASCADE'})
    post: Post;

    @OneToMany(() => Chat, (chat) => chat.parent)
    replies: Chat[];

    @ManyToOne(() => Chat, (chat) => chat.replies)
    parent: Chat;

    @Column()
    is_anonymous: Boolean = false;

    @Column()
    content: String;

    @ManyToOne(() => User)
    writer: User;
}
