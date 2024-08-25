import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { Spacerole } from 'src/spacerole/entities/spacerole.entity';
import { Userspace } from 'src/userspace/entities/userspace.entity';

@Entity()
export class Space {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, (owner) => (owner.owning_spaces))
    owner: User;

    @OneToMany(() => Spacerole, (spacerole) => (spacerole.space))
    spaceroles: Spacerole[];

    @Column()
    name: String;

    @Column()
    logo: string = 'default_space.png';

    @OneToMany(() => (Userspace), (userspace) => (userspace.user))
    userspaces: Userspace[];
}
