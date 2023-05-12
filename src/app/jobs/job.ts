import { Entity, Field, Fields, IdEntity, isBackend, remult } from "remult";
import { JosStatus } from "./jobStatus";

@Entity<Job>('jobs', {
    caption: 'עבודות שרת',
    allowApiCrud: () => remult.authenticated(),
    saving: async row => {
        if (isBackend()) {
            let now = new Date()
            row.runAt = now
            row.date = now
        }
    }
})
export class Job extends IdEntity {

    @Fields.string<Job>({ caption: 'שם' })
    name = ''

    @Fields.date<Job>({ caption: 'זמן ריצה', allowApiUpdate: false })
    runAt!: Date

    @Fields.dateOnly<Job>({ caption: 'תאריך' })
    date!: Date

    @Field<Job, JosStatus>(() => JosStatus, { caption: 'סטטוס' })
    status = JosStatus.created

    @Fields.string<Job>({ caption: 'הערה' })
    remark = ''

}
