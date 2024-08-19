import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, ManyToMany } from 'typeorm';
import { User } from 'src/user/entities/user.entity';

@Entity()
export class Space {
    @PrimaryGeneratedColumn()
    id: number;

    // @ManyToOne(() => User, (owner) => (owner.own_spaces))
    // owner: User;

    // @ManyToMany({
    //     array: true
    // })
    // admins: User[];

    // @Column({
    //     array: true
    // }) // m:n
    // participants: User[];

    @Column()
    name: String;

    @Column({
        type: "longblob"
    })
    logo: string;
}
