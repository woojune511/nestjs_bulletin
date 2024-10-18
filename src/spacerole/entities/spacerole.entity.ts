import { Space } from "src/space/entities/space.entity";
import { User } from "src/user/entities/user.entity";
import { Userspace } from "src/userspace/entities/userspace.entity";
import { Column, Entity, ManyToOne, OneToMany, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Spacerole {
    @PrimaryGeneratedColumn()
    id: number;
    
    @Column({
        nullable: false
    })
    name: string;

    @ManyToOne(() => Space, (space) => (space.spaceroles))
    space: Space;

    @OneToMany(() => (Userspace), (userspace) => (userspace.user))
    userspaces: Userspace[];

    @Column()
    is_admin: boolean = false;
}
