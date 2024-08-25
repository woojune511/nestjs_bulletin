import { Space } from 'src/space/entities/space.entity';
import { Userspace } from 'src/userspace/entities/userspace.entity';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany, PrimaryColumn, Unique } from 'typeorm';

@Entity()
@Unique(["email"])
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    email: string;

    @Column()
    first_name: string;

    @Column()
    last_name: string;

    @Column()
    password: string;

    @Column()
    profile_pic: string = 'default.png';

    @Column({ nullable: true })
    currentRefreshToken: string;

    @Column({ type: 'datetime', nullable: true })
    currentRefreshTokenExp: Date;

    @OneToMany(() => Space, (space) => space.owner)
    owning_spaces: Space[];

    @OneToMany(() => (Userspace), (userspace) => (userspace.user))
    userspaces: Userspace[];
}
