import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { Spacerole } from 'src/spacerole/entities/spacerole.entity';
import { Userspace } from 'src/userspace/entities/userspace.entity';
import { Post } from 'src/post/entities/post.entity';
import { Exclude } from 'class-transformer';

@Entity()
export class Space {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, (owner) => (owner.owning_spaces))
    owner: User;

    @OneToMany(() => Spacerole, (spacerole) => (spacerole.space), {cascade: true})
    spaceroles: Spacerole[];

    @Column()
    name: String;

    @Column()
    logo: string = 'default_space.png';

    @OneToMany(() => (Userspace), (userspace) => (userspace.user), {cascade: true})
    userspaces: Userspace[];

    @OneToMany(() => Post, (post) => (post.space), {cascade: true})
    posts: Post[];

    @Column()
    code_admin: String;

    @Column()
    code_member: String;
}
