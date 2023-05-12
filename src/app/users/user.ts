import { Allow, Entity, Fields, IdEntity, isBackend, remult, Validators } from "remult";
import { mobileToDb } from "../common/mobileFunc";
import { terms } from "../terms";
import { Roles } from './roles';
import { UserBranch } from "./userBranch";

@Entity<User>("users", {
    allowApiRead: Allow.authenticated,
    allowApiUpdate: Allow.authenticated,
    allowApiDelete: Roles.admin,
    allowApiInsert: Allow.authenticated,
    // backendPrefilter: async () => {
    //     if (remult.user?.isAdmin) {
    //         return {}
    //     }
    //     else if (remult.user?.isManager) {
    //         let ub = await remult.repo(UserBranch).find({
    //             where: { branch: { $id: remult.user?.branch! } }
    //         }) 
    //         let uids = ub.map(ub => ub.user?.id)
    //         //console.log('User.apiPrefilter.uids.length', uids.length)
    //         return { id: uids }
    //     }
    //     else {
    //         return { id: remult.user?.id }
    //     }
    // },
    apiPrefilter: async () => {
        if (remult.user?.isAdmin) {
            return {}
        }
        else if (remult.user?.isManager) {
            let ub = await remult.repo(UserBranch).find({
                where: { branch: { $id: remult.user?.branch! } }
            })
            let uids = ub.map(ub => ub.user?.id)
            //console.log('User.apiPrefilter.uids.length', uids.length)
            return { id: uids }
        }
        else {
            return { id: remult.user?.id }
        }
    },
    saving: async (user) => {
        if (isBackend()) {
            if (user._.isNew()) {
                user.created = new Date()
                user.createdBy = remult.user?.id!
            }
            else {
                user.modified = new Date()
                user.modifiedBy = remult.user?.id!
            }
        }
    },
    deleted: async (user) => {

        if (isBackend()) {
            // console.log(`user ${user?.name} deleted by ${remult.user?.id}`)
            // for await (const vv of remult.repo(VisitVolunteer).query({
            //     where: { volunteer: user }
            // })) {
            //     await remult.repo(VisitVolunteer).delete(vv)

            //     // let remain = await remult.repo(VisitVolunteer).count({
            //     //     visit: vv.visit
            //     // })
            //     // if (remain === 0) {
            //     //     await remult.repo(Visit).delete(vv.visit)
            //     // }
            // }

            // for await (const tv of remult.repo(TenantVolunteer).query({
            //     where: { volunteer: user }
            // })) {
            //     await remult.repo(TenantVolunteer).delete(tv)
            // }

            // for await (const ub of remult.repo(UserBranch).query({
            //     where: { user: user }
            // })) {
            //     await remult.repo(UserBranch).delete(ub)
            // }
        }
    }
})
export class User extends IdEntity {

    tenantsNames = [] as string[]
    branchesNames = [] as string[]

    @Fields.string<User>({
        validate: [Validators.required.withMessage('לא הוזן שם')],
        caption: terms.username
    })
    name = '';

    @Fields.string<User>({
        sqlExpression: e => {
            return `split_part(name, ' ', 1)`
        }
    })
    firstName = ''

    @Fields.string<User>({
        validate: [
            Validators.required.withMessage('לא הוזן נייד'),
            // Validators.uniqueOnBackend.withMessage('נייד קיים')
        ],
        caption: 'נייד',
        // displayValue: (row, col) =>{ 
        //     console.log('displayValue',mobileFromDb(mobileToDb(row.mobile) as string))
        //     return mobileFromDb(mobileToDb(col) as string)},
        valueConverter: {
            // fromDb: col => mobileFromDb(mobileToDb(col) as string),
            toDb: col => mobileToDb(col) as string
        }
    })
    mobile = '';

    @Fields.string<User>({
        caption: 'אמייל'
    })
    email = '';

    @Fields.string<User>({ caption: 'כתובת' })
    address: string = '';

    @Fields.string<User>({ includeInApi: false })
    verifyCode: string = ''

    @Fields.date<User>({
        includeInApi: false,
        // displayValue: (row,col) => datetimeFormat(col)
    })
    verifyTime!: Date

    // @Fields.string<User>({
    //     validate: [Validators.required],
    //     caption: terms.username
    // })
    // organization = '';

    // @Fields.object<User, Branch[]>({
    //     // lazy: true, //reload when required
    //     serverExpression: async v => (await remult.repo(UserBranch).find({ where: { user: { $id: v.id } } }))
    //         ?.map(row => row.branch) ?? [] as Branch[],
    //     displayValue: (row, bs) => bs?.map(b => b.name)?.join(', ')
    // })
    // branches = [] as Branch[]

    @Fields.dateOnly<User>({
        caption: 'תאריך לידה'//,
        // validate: (row, col) => {
        //     if (!col.value) {
        //         col.error = terms.required
        //     }
        // }
    })
    birthday!: Date

    @Fields.boolean<User>({
        caption: 'מסך מלא'
    })
    fullScreen = false;

    @Fields.boolean<User>({
        allowApiUpdate: Roles.admin,
        caption: terms.admin
    })
    admin = false;

    @Fields.boolean<User>({
        allowApiUpdate: Roles.admin,
        caption: 'תורם'
    })
    donor = false;

    @Fields.boolean<User>({
        allowApiUpdate: Roles.admin,
        caption: terms.manager
    })
    manager = false;

    @Fields.boolean<User>({
        allowApiUpdate: Allow.authenticated,
        caption: terms.volunteer
    })
    volunteer = false;

    @Fields.boolean<User>({
        allowApiUpdate: Roles.admin,
        caption: terms.tenant
    })
    tenant = false;

    @Fields.boolean<User>({
        caption: 'פעיל'
    })
    active = true;

    @Fields.date<User>({
        allowApiUpdate: false
    })
    logedIn!: Date

    @Fields.date<User>({
        allowApiUpdate: false
    })
    lastSent!: Date

    @Fields.string<User>({ caption: 'הערה' })
    remark: string = ''

    @Fields.date<User>({
        allowApiUpdate: false
    })
    created!: Date

    @Fields.date<User>({
        allowApiUpdate: false
    })
    modified!: Date

    @Fields.uuid<User>({
        allowApiUpdate: false
    })
    createdBy = ''

    @Fields.uuid<User>({
        allowApiUpdate: false
    })
    modifiedBy = ''

}
