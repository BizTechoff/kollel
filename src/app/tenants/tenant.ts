import { Entity, Field, Fields, IdEntity, isBackend, remult, Validators } from "remult";
import { Branch } from "../branches/branch";
import { mobileFromDb, mobileToDb } from "../common/mobileFunc";
import { User } from "../users/user";

@Entity<Tenant>('tenants', {
    caption: 'דייר',
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
    deleted: async row => {
        if (isBackend()) {
            // for await (const tv of remult.repo(TenantVolunteer).query({ where: { tenant: row } })) {
            //     await remult.repo(TenantVolunteer).delete(tv)
            // }
        }
    },
    saving: async row => {
        if (isBackend()) {
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
export class Tenant extends IdEntity {

    // @Fields.object<Tenant, User[]>({
    //     // lazy: true, //reload when required
    //     serverExpression: async t => (await remult.repo(TenantVolunteer).find({
    //         where: { tenant: { $id: t.id } },
    //         load: row => [row.volunteer]
    //     })).map(row => row.volunteer),
    //     displayValue: (row, us) => us?.map(u => u.name)?.join(', ')
    // })
    volunteers = [] as User[]

    volunteersNames = this.volunteers.map(u => u.name) //.join(', ')

    @Field<Tenant, Branch>(() => Branch, {
        caption: 'כולל',
        validate: (row, col) => [Validators.required]
    })
    branch!: Branch

    @Fields.string<Tenant>({
        validate: [Validators.required.withMessage('לא הוזן שם')],
        caption: 'שם'
    })
    name = '';

    @Fields.string<Tenant>({
        // validate: [Validators.required.withMessage('לא הוזנה כתובת')],
        caption: 'כתובת'
    })
    address = '';

    @Fields.dateOnly<Tenant>({
        caption: 'תאריך לידה'//,
        // validate: (row, col) => {
        //     if (!col.value) {
        //         col.error = terms.required
        //     }
        // }
    })
    birthday!: Date

    @Fields.string<Tenant>({
        caption: 'שפות'
    })
    languages = '';

    @Fields.number<Tenant>({
        sqlExpression: e => {
            return 'extract(week from birthday)'
        }
    })
    weekBirthday: number = -1

    @Fields.number<Tenant>({
        sqlExpression: e => {
            return 'extract(day from birthday)'
        }
    })
    dayBirthday: number = -1

    @Fields.number<Tenant>({
        sqlExpression: e => {
            return 'extract(month from birthday)'
        }
    })
    monthBirthday: number = -1

    @Fields.number<Tenant>({
        caption: 'גורם מפנה'
    })
    referrer = 0;

    @Fields.number<Tenant>({
        caption: 'כמות מנות'
    })
    foodcount = 1;

    @Fields.string<Tenant>({
        caption: 'הערות גורם מפנה'
    })
    referrerremark = 0;

    @Fields.number<Tenant>({
        caption: 'מין'
    })
    gender = 0;

    @Fields.string<Tenant>({
        caption: 'איזור חלוקה'
    })
    fooddeliveryarea = 0;

    @Fields.string<Tenant>({
        caption: 'סלולרי',
        valueConverter: {
            fromDb: col => mobileFromDb(mobileToDb(col) as string),
            toDb: col => mobileToDb(col) as string
        }
    })
    mobile = ''

    @Fields.string<Tenant>({
        caption: 'טלפון'
    })
    phone = ''

    @Fields.string<Tenant>({
        caption: 'ת.ז'
    })
    idNumber = ''

    @Fields.string<Tenant>({
        caption: 'הערות לכתובת'
    })
    addressremark = ''

    @Fields.string<Tenant>({
        caption: 'דירה'
    })
    apartment = ''

    @Fields.string<Tenant>({
        caption: 'קומה'
    })
    floor = ''

    @Fields.string<Tenant>({
        caption: 'הערה'
    })
    remark = '';

    @Fields.dateOnly<Tenant>({
        caption: 'תאריך שליחת התראה'//,
        // validate: (row, col) => {
        //     if (!col.value) {
        //         col.error = terms.required
        //     }
        // }
    })
    notificationSent!: Date

    @Fields.boolean<Tenant>({
        caption: 'פעיל'
    })
    active = true;

    @Fields.date<Tenant>({
        allowApiUpdate: false
    })
    created = new Date();

    @Fields.date<Tenant>({
        allowApiUpdate: false
    })
    modified = new Date();

    @Fields.uuid<Tenant>({
        allowApiUpdate: false
    })
    createdby = ''

    @Fields.uuid<Tenant>({
        allowApiUpdate: false
    })
    modifiedby = ''

}
