import { Entity, Field, Fields, IdEntity, remult } from "remult";
import { NotificationType } from "./notificationType";

@Entity<Alarm>('alarms', {
    caption: 'התראות',
    allowApiCrud: () => remult.authenticated()
})
export class Alarm extends IdEntity {

    @Field<Alarm, NotificationType>(() => NotificationType, { caption: 'סוג התראה' })
    type = NotificationType.none

    @Fields.string<Alarm>({ caption: 'ימים' })
    days = ''

    @Fields.string<Alarm>({ caption: 'חזרות' })
    recurrency = 'שבועי|חודשי|יומי|סוף חודש'

    @Fields.string<Alarm>({ caption: 'שעה' })
    hour = ''

}

// tenant birthday
// sunday?  10:00am? branch|mobile/email|tenant:{ name: '', date: '' }  => notify({ type: 'tenant-birthday', by: 'sms/email' })
// thursday?10:00am? branch|mobile/email                                => notify({ type: 'today-is-thursday', by: 'sms/email' })
// thursday?21:00pm? branch|mobile/email|visit:{ status: none, date: today}  => notify({ type: 'no-report-yet', by: 'sms/email' })
// saturday?21:00pm? branch|mobile/email|visit:{ status: none, date: today}  => notify({ type: 'still-no-report', by: 'sms/email' })
// sunday?  10:00am? branch|mobile/email|volunteer:{ name: '', mobile: '' }  => notify({ type: 'tenant-birthday', by: 'sms/email' })

// volunteer-counter: { id, date, count }=> x4: { visit: { status: { '!=': none }}}
// tenant-counter: { id, date, count }=> x2: { visit: { status: none }}
// volunteer-counter: { id, date, count }=> x4: { visit-volunteer: { volunteer: { '!=' user }}}
// end-of-month: sammry-email => visit: { volunteers-count, tenant-count, vol-tenant-recurrency }
