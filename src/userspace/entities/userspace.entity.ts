import { Space } from "src/space/entities/space.entity";
import { Spacerole } from "src/spacerole/entities/spacerole.entity";
import { User } from "src/user/entities/user.entity";
import { Entity, PrimaryColumn, ManyToOne } from "typeorm";

@Entity()
export class Userspace {
    @PrimaryColumn()
    userId: number;

    @PrimaryColumn()
    spaceId: number;

    @ManyToOne(() => (User), (user) => (user.userspaces))
    user: User;

    @ManyToOne(() => (Space), (space) => (space.userspaces))
    space: Space;

    @ManyToOne(() => (Spacerole), (spacerole) => (spacerole.userspaces))
    spacerole: Spacerole;
}
