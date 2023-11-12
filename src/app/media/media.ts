import { Entity, Field, Fields, IdEntity, isBackend, remult, Validators } from "remult";
import { Branch } from "../branches/branch";
import { News } from "../news/news";
import { Tenant } from "../tenants/tenant";
import { User } from "../users/user";
import { Visit } from "../visits/visit";
import { MediaType } from "./mediaTypes";

@Entity<Media>('media', {
    caption: 'מדיה',
    allowApiCrud: () => remult.authenticated(),
    validation: (row, col) => {
        if (isBackend()) {
            //TenantVolunteers
        }
    },
    saving: async row => {
        if (isBackend()) {
            if (row.isNew()) {
                row.created = new Date()
                row.createdBy = remult.user?.id!
            }
        }
    },
    deleted: async row => {
        if (isBackend()) {
            // for await (const vv of remult.repo(VisitVolunteer).query({ where: { visit: row } })) {
            //     await remult.repo(VisitVolunteer).delete(vv)
            // }
        }
    }
})
export class Media extends IdEntity {

    @Field<Media, Branch>(() => Branch, {
        caption: 'כולל',
        validate: (row, col) => {
            if (col) {
                if (col.value) {
                    if (col.value.name?.trim().length) {

                    }
                    else {
                        col.error = 'Required Field'
                    }
                }
            }
        }
    })
    branch!: Branch

    @Field<Media, Visit>(() => Visit, { caption: 'ביקור' })
    visit!: Visit

    @Field<Media, Tenant>(() => Tenant, { caption: 'דייר' })
    tenant!: Tenant

    @Field<Media, User>(() => User, { caption: 'מתנדב' })
    volunteer!: User

    @Field<Media, News>(() => News, { caption: 'הודעה' })
    news!: News

    @Field<Media, MediaType>(() => MediaType, { caption: 'סוג מדיה' })
    type = MediaType.none

    @Fields.string<Media>({
        caption: 'לינק',
        validate: [Validators.required.withMessage('לא הוזן לינק')]
    })
    link = ''

    @Fields.boolean<Media>({ caption: 'פעיל' })
    active = true

    @Fields.date<Media>({
        caption: 'צולמה',
        allowApiUpdate: false
    })
    taken!: Date

    @Fields.date<Media>({
        caption: 'נוצר',
        allowApiUpdate: false
    })
    created!: Date

    @Fields.uuid<Media>({
        caption: 'נוצר ע"י',
        allowApiUpdate: false
    })
    createdBy = ''

}
