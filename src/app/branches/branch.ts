import { Entity, Field, Fields, IdEntity, isBackend, remult, Validators } from "remult";
import { BranchGroup } from "./branchGroup";

@Entity<Branch>('branches', {
    caption: 'כולל',
    allowApiCrud: () => remult.authenticated(),
    allowApiRead: true,
    validation: async (row, col) => {
        if (isBackend()) {
            // let c = await remult.repo(Tenant)
        }
    },
    apiPrefilter: async () => {
        if (remult.user?.isAdmin) {
            return {}
        }
        else {
            return { id: remult.user?.branch }
        }
    },
    deleted: async row => {
        if (isBackend()) {
            // for await (const tv of remult.repo(TenantVolunteer).query({ where: { tenant: row } })) {
            //     await remult.repo(TenantVolunteer).delete(tv)
            // }
        }
    }
})
export class Branch extends IdEntity {

    volunteersCount = 0
    tenantsCount = 0

    @Field<Branch, BranchGroup>(() => BranchGroup, {
        caption: 'קבוצה',
        dbName: 'group_'
    })
    group = BranchGroup.avrach

    @Fields.string<Branch>({
        validate: [Validators.required.withMessage('לא הוזן שם')],
        caption: 'שם'
    })
    name = '';

    @Fields.string<Branch>({
        // validate: [Validators.required],
        caption: 'כתובת'
    })
    address = '';

    @Fields.string<Branch>({
        // validate: [Validators.required],
        caption: 'אימייל'
    })
    email = '';

    @Fields.boolean<Branch>({
        caption: 'לשימוש פנימי'
    })
    system = false

    @Fields.string<Branch>({
        // validate: [Validators.required],
        caption: 'הערה'
    })
    remark = '';

    @Fields.boolean<Branch>({
        caption: 'פעיל'
    })
    active = true;

}
