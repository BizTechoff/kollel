import { Entity, Field, Fields, IdEntity, remult } from "remult";
import { Branch } from "../branches/branch";
import { News } from "./news";

@Entity<NewsBranch>('news_branches', {
    caption: 'הודעה לכולל',
    allowApiCrud: () => remult.authenticated()
})
export class NewsBranch extends IdEntity {

    @Field<NewsBranch, News>(() => News, {
        caption: 'חדשות'
    })
    news!: News

    @Field<NewsBranch, Branch>(() => Branch, {
        caption: 'כולל'
    })
    branch!: Branch
    
    @Fields.date<NewsBranch>({ caption: 'נצפה' })
    seen!: Date

}
