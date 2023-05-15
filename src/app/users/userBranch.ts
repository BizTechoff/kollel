import { Entity, Field, IdEntity, remult } from "remult";
import { Branch } from "../branches/branch";
import { User } from "./user";

@Entity<UserBranch>('users_branches', {
    caption: 'כוללים של מתנדב',
    allowApiCrud: () => remult.authenticated()
})
export class UserBranch extends IdEntity {

    @Field<UserBranch, Branch>(() => Branch, {
        caption: 'כולל'
    })
    branch!: Branch

    @Field<UserBranch, User>(() => User, {
        caption: 'משתמש',
        dbName: 'user_'
    })
    user!: User

}
