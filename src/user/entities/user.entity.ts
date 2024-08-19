import { Space } from 'src/space/entities/space.entity';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany, PrimaryColumn } from 'typeorm';

@Entity()
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
    profile_pic: string;

    // @OneToMany(() => Space, (space) => space.owner)
    // own_spaces: Space[];
}
