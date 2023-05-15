import { BackendMethod, Controller, ControllerBase, Field, Fields, remult, Validators } from "remult";
import { Branch } from "../branches/branch";
import { User } from "./user";
import { UserBranch } from "./userBranch";

@Controller('register')
export class RegisterController extends ControllerBase {

    @Field<RegisterController, Branch>(() => Branch, {
        caption: 'כולל',
        validate: (row, col) => [Validators.required]
    })
    branch!: Branch

    @Fields.string<RegisterController>({
        // validate: [Validators.required.withMessage('לא הוזן שמך')],
        caption: 'שם'
    })
    name = '';

    @Fields.string<RegisterController>({
        // validate: [Validators.required.withMessage('לא הוזן מספר נייד')],
        caption: 'סלולרי'
    })
    mobile = '';

    @Fields.boolean<RegisterController>({
        // validate: [Validators.required.withMessage('לא הוזן מספר נייד')],
        caption: 'תקין'
    })
    ok = false;

    @BackendMethod({ allowed: true })
    async sendValidationCode() {
        let result = { success: false, error: '', special: false }
        // if (this.name?.trim().length === 0) {
        //     result.error = terms.nameRequired
        // }
        // else if (this.mobile?.trim().length < 10) {
        //     result.error = terms.mobileRequired
        // }
        // let user = await remult.repo(User).findFirst({ mobile: [this.mobile, '1' + this.mobile] }, { useCache: false });
        // if (user) {
        //     result.error = 'סלולרי זה קיים'
        // }
        // else{
        //     let code = this.randomValidationCode()

        //     let sms = new SmsService()
        //     let res = await sms.sendSmsMulti({
        //         international: this.mobile?.startsWith('1'),
        //         message: `קוד אימות: ${code}, תקף לחמש דקות`,
        //         mobiles: [this.mobile],
        //         senderid: 'registered'
        //     })
        //     let isDevMode = await (new AppController()).isDevMode()
        //     if (res.success || isDevMode) {
        //         user = remult.repo(User).create()
        //         user.name = this.name
        //         user.mobile = this.mobile
        //         user.verifyCode = code.toString()
        //         user.verifyTime = new Date()
        //         await user.save()
        //         await remult.repo(UserBranch).insert({
        //             user: user,
        //             branch: this.branch
        //         })
        //         result.success = true
        //         // console.log('code', code)
        //     }
        //     else {
        //         result.error = res.message
        //     }
        // }
        return result
    }

    randomValidationCode() {
        let min = 555770
        let max = 999770
        return Math.floor(Math.random() * (max - min) + min)
    }

    @BackendMethod({ allowed: true })
    async register() {
        this.ok = false
        // if (this.branch?.trim().length) { }
        // else return 'חובה להזין כולל'
        if (this.name?.trim().length) { }
        else return 'חובה להזין שם'
        if (this.mobile?.trim().length) { }
        else return 'חובה להזין מספר נייד'
        const userRepo = remult.repo(User);
        let u = await userRepo.findFirst({ mobile: this.mobile }, { useCache: false });
        if (!u) {
            // (new SmsService()).sendSmsMulti({
            //     message: '',
            //     mobiles: [],
            //     international: false,
            //     senderid: ''
            // })
            // send-verification-sms
            let volunteer = await userRepo.insert({
                active: true,
                volunteer: true,
                mobile: this.mobile,
                name: this.name
            })
            await remult.repo(UserBranch).insert({
                branch: this.branch,
                user: volunteer
            })
            this.ok = true
            return 'נוספת בהצלחה! תודה על התנדבותך'
        }
        return 'אין צורך להוסיף אותך שוב'
    }

    @BackendMethod({ allowed: true })
    async setBranchIfExists(id = '') {
        //console.log(`RegisterController.branchExists( name: ${name} )`)
        this.branch = await remult.repo(Branch).findId(id)
        if (this.branch) {
            // this.branch = b.id
            return true
        }
        return false
    }

}
