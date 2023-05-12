import { Entity, Field, Fields, IdEntity, isBackend, remult } from "remult";
import { User } from "../users/user";
import { News } from "./news";

@Entity<NewsUser>('news_users', {
    caption: 'הודעה למשתמש',
    allowApiCrud: () => remult.authenticated(),
    saving: (row) => {
        if (isBackend()) {
            row.seen = new Date()
            // if(row.isNew()){
            //     row.seen = new Date()
            // }
        }
    }
})
export class NewsUser extends IdEntity {

    @Field<NewsUser, News>(() => News, {
        caption: 'חדשות'
    })
    news!: News

    @Field<NewsUser, User>(() => User, {
        caption: 'מנהל'
    })
    manager!: User

    @Fields.string<NewsUser>({ caption: 'תגובה' })
    feedback = ''

    // @Fields.date<News>({ caption: 'שעת תגובה' })
    // feedbacked!: Date

    @Fields.date<NewsUser>({ caption: 'נצפה' })
    seen!: Date

}
