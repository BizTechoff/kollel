import { Entity, Field, Fields, IdEntity, isBackend, remult } from "remult";
import { mobileFromDb, mobileToDb } from "../common/mobileFunc";
import { NotificationStatus } from "./notificationStatus";
// import { JobType } from "../../server/jobs";

@Entity<Notification>('notifications', {
    caption: 'התראות שנשלחו',
    allowApiCrud: () => remult.authenticated(),
    saving: async (user) => {
        if (isBackend()) {
            if (user._.isNew()) {
                user.created = new Date()
            }
        }
    }
})
export class Notification extends IdEntity {

    @Fields.dateOnly<Notification>({ caption: 'תאריך' })
    date!: Date

    @Fields.string<Notification>({ caption: 'שעה', inputType: 'time' })
    time!: string

    @Fields.string<Notification>({ caption: 'שולח' })
    sender!: string

    @Fields.string<Notification>({
        caption: 'סלולרי',
        valueConverter: {
            fromDb: col => mobileFromDb(mobileToDb(col) as string),
            toDb: col => mobileToDb(col) as string
        }
    })
    mobile = ''

    @Fields.string<Notification>({ caption: 'אימייל' })
    email!: string

    @Fields.string<Notification>({ caption: 'נושא' })
    subject!: string

    @Fields.string<Notification>({ caption: 'הודעה' })
    message!: string

    @Field<Notification, NotificationStatus>(() => NotificationStatus, {
        caption: 'סטטוס',
        allowApiUpdate: false
    })
    status = NotificationStatus.none

    @Fields.string<Notification>({
        caption: 'שגיאה',
        allowApiUpdate: false
    })
    error!: string

    @Fields.date<Notification>({
        caption: 'נשלח',
        allowApiUpdate: false
    })
    sent!: Date

    @Fields.date<Notification>({
        caption: 'נוצר',
        allowApiUpdate: false
    })
    created!: Date

}
