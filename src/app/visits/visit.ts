import { Entity, Field, Fields, IdEntity, isBackend, remult, Validators } from "remult";
import { Branch } from "../branches/branch";
import { Tenant } from "../tenants/tenant";
import { VisitStatus } from "./visitStatus";

@Entity<Visit>('visits', {
    caption: 'ביקורים',
    allowApiCrud: () => remult.authenticated(),
    validation: (row, col) => {
        if (isBackend()) {
            //TenantVolunteers
        }
    },
    apiPrefilter: async () => {
        if (remult.user?.isAdmin) {
            return {}
        }
        else {
            return { branch: { $id: remult.user?.branch! } }
        }
    },
    saving: async row => {
        if (isBackend()) {
            if (row.isNew()) {
                row.created = new Date()
                row.createdBy = remult.user?.id!
            }
            else {
                row.modified = new Date()
                row.modifiedBy = remult.user?.id!
            }
        }
    },
    saved: async row => {
        if (isBackend()) {
            // row.status.


            /*
            
            מתנדב שסיים ביקור בהצלחה נוסף לו 1+ למונה
            בכל יצירת רשומת דיווח - יצירת רשומה של חוסר ביקור אצל דייר
            דייר שביקרו אצלו יתאפס\ימחק המונה שלו
            מי שהמונה 2 ומעלה - שליחת עדכון לראש כולל על חוסר ביקור הדייר פעמיים ומעלה 
            
            */

        }
    },
    deleted: async row => {
        if (isBackend()) {
            // for await (const vv of remult.repo(VisitVolunteer).query({ where: { visit: { $id: row.id } } })) {
            //     await remult.repo(VisitVolunteer).delete(vv)
            // }
        }
    }
})
export class Visit extends IdEntity {

    @Field<Visit, Branch>(() => Branch, {
        caption: 'כולל',
        validate: (row, col) => [Validators.required]
    })
    branch!: Branch

    @Field<Visit, Tenant>(() => Tenant, { caption: 'דייר' })
    tenant!: Tenant

    volunteersNames = ''

    // getv(){return 'VVViVVV'}

    // async getVolunteersNames() {
    //     return (await remult.repo(VisitVolunteer).find({
    //         where: { visit: this }
    //     }))
    //         .map(r => r.volunteer)
    //         .join(', ')
    // }

    // volunteers = [] as User[]
    // async loadVolunteers() {
    //     if (this.volunteers !== undefined)
    //         return this.volunteers;
    //     this.volunteers = [];
    //     return this.volunteers = (await remult.repo(VisitVolunteer).find({
    //         where: { visit: this }
    //     })).map(r => r.volunteer)
    // }

    // @DataControl<Visit, User[]>({
    //     getValue(row, col) { return col.value.join(', ') },
    // })
    // @Fields.object<Visit, User[]>({
    //     caption: 'מתנדבים',
    //     // lazy:true,
    //     serverExpression: async row => (await remult.repo(VisitVolunteer).find({
    //         where: { visit: { $id: row.id } },
    //         load: row => [row.volunteer]
    //     })).map(row => row.volunteer)//,
    //     // displayValue: (row, us) => us?.map(u => u.name)?.join(', ')
    // })
    // volunteers = [] as User[]

    @Fields.dateOnly<Visit>({ caption: 'תאריך' })
    date = new Date

    @Field<Visit, VisitStatus>(() => VisitStatus, { caption: 'סטטוס' })
    status = VisitStatus.none

    @Fields.number<Visit>({ caption: 'מנות שנמסרו' })// מנות | שמיכות
    deliversCount = 0

    @Fields.number<Visit>({
        sqlExpression: e => {
            return 'extract(dow from date)'
        }
    })
    dayOfWeek: number = -1

    @Fields.number<Visit>({
        sqlExpression: e => {
            return 'extract(week from date)'
        }
    })
    week: number = -1

    @Fields.number<Visit>({
        sqlExpression: e => {
            return 'extract(month from date)'
        }
    })
    month: number = -1

    @Fields.string<Visit>({ caption: 'הערה' })
    remark = ''

    @Fields.string<Visit>({ caption: 'תשובת המתנדב לשאלה השבועית' })
    volunteerWeeklyAnswer = ''

    @Fields.date<Visit>({
        // allowApiUpdate: false
    })
    statusModified!: Date;

    @Fields.date<Visit>({
        allowApiUpdate: false
    })
    created = new Date();

    @Fields.date<Visit>({
        allowApiUpdate: false
    })
    modified = new Date();

    @Fields.uuid<Visit>({
        allowApiUpdate: false
    })
    createdBy = ''

    @Fields.uuid<Visit>({
        allowApiUpdate: false
    })
    modifiedBy = ''

}
