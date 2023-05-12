import { Entity, Field, Fields, IdEntity, isBackend, remult, Validators } from "remult";
import { BranchGroup } from "../branches/branchGroup";
import { terms } from "../terms";
import { NewsType } from "./newsType";

@Entity<News>('news', {
    caption: 'חדשות',
    allowApiCrud: () => remult.authenticated(),
    saving: (row) => {
        if (isBackend()) {
            if (!row.tdate) {
                row.tdate = row.fdate
            }
            else if (row.tdate < row.fdate) {
                row.tdate = row.fdate
            }
            if (row.isNew()) {
                row.created = new Date()
                row.createdby = remult.user?.id!
            }
            else {
                row.modified = new Date()
                row.modifiedby = remult.user?.id!
            }
        }
    }
})
export class News extends IdEntity {

    @Field<News, BranchGroup>(() => BranchGroup, {
        caption: 'קבוצה',
        dbName: 'group_'
    })
    group = BranchGroup.all

    @Fields.dateOnly<News>({
        caption: 'מתאריך',
        validate: (row, col) => {
            if (!col.value) {
                col.error = terms.required
            }
        }
    })
    fdate!: Date

    @Fields.dateOnly<News>({ caption: 'עד תאריך' })
    tdate!: Date

    @Field<News, NewsType>(() => NewsType, { caption: 'סוג הודעה' })
    type = NewsType.none

    @Fields.string<News>({
        caption: 'נושא',
        validate: Validators.required.withMessage(terms.required)
    })
    subject = ''

    @Fields.string<News>({
        caption: 'תוכן',
        validate: Validators.required.withMessage(terms.required)
    })
    content = ''

    @Fields.boolean<News>({ caption: 'יכול להגיב' })
    isCanFeedback = true

    @Fields.boolean<News>({ caption: 'נדרש להגיב' })
    needFeedback = true

    @Fields.boolean<News>({ caption: 'שאלה שבועית' })
    weeklyQuestion = false

    @Fields.string<News>({
        caption: 'הערה'
    })
    remark = '';

    @Fields.boolean<News>({ caption: 'פעיל' })
    active = true

    @Fields.date<News>({
        allowApiUpdate: false
    })
    created = new Date();

    @Fields.date<News>({
        allowApiUpdate: false
    })
    modified = new Date();

    @Fields.uuid<News>({
        allowApiUpdate: false
    })
    createdby = ''

    @Fields.uuid<News>({
        allowApiUpdate: false
    })
    modifiedby = ''

}
