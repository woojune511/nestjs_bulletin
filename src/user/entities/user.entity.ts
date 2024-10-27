import { Exclude } from 'class-transformer';
import { Chat } from 'src/chat/entities/chat.entity';
import { Post } from 'src/post/entities/post.entity';
import { Space } from 'src/space/entities/space.entity';
import { Userspace } from 'src/userspace/entities/userspace.entity';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany, PrimaryColumn, Unique, DeleteDateColumn } from 'typeorm';

@Entity()
@Unique(["email"])
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @DeleteDateColumn()
    deletedAt?: Date;
    
    @Column()
    email: string;

    @Column()
    first_name: string;

    @Column()
    last_name: string;

    @Exclude({toPlainOnly: true})
    @Column()
    password: string;

    @Exclude({toPlainOnly: true})
    @Column()
    profile_pic: string = 'default.png';

    @Exclude({toPlainOnly: true})
    @Column({ nullable: true })
    currentRefreshToken: string;

    @Exclude({toPlainOnly: true})
    @Column({ type: 'datetime', nullable: true })
    currentRefreshTokenExp: Date;

    @Exclude({toPlainOnly: true})
    @OneToMany(() => Space, (space) => space.owner)
    owning_spaces: Space[];

    @Exclude({toPlainOnly: true})
    @OneToMany(() => Userspace, (userspace) => (userspace.user), {cascade: true})
    userspaces: Userspace[];

    @Exclude({toPlainOnly: true})
    @OneToMany(() => Post, (post) => (post.writer))
    posts: Post[];

    @Exclude({toPlainOnly: true})
    @OneToMany(() => Chat, (chat) => (chat.writer))
    chats: Chat[];
}
