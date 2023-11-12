import { Allow, BackendMethod, Controller, ControllerBase, Fields, remult, UserInfo } from "remult";
import { getRequest } from "../../server/getRequest";
import { SmsService } from "../../server/sms";
import { AppController } from "../appController";
import { Branch } from "../branches/branch";
import { BranchGroup } from "../branches/branchGroup";
import { mobileToDb } from "../common/mobileFunc";
import { terms } from "../terms";
import { Roles } from "./roles";
import { User } from "./user";
import { UserBranch } from "./userBranch";

@Controller('signIn')
export class SignInController extends ControllerBase {

    @Fields.string<SignInController>({
        // validate: [Validators.required.withMessage('לא הוזן מספר נייד')],
        caption: 'סלולרי'
    })
    mobile = '';

    @Fields.string<SignInController>({
        caption: 'קוד אימות'
    })
    verifyCode = '';

    @Fields.boolean<SignInController>({
        caption: 'כניסת אדמין כמנהל'
    })
    adminAsManager = false


    @Fields.boolean<SignInController>({
        caption: terms.rememberOnThisDevice,
    })
    rememberOnThisDevice = true;

    @BackendMethod({ allowed: true })
    /**
     * This sign mechanism represents a simplistic sign in management utility with the following behaviors
     * 1. The first user that signs in, is created as a user and is determined as admin.
     * 2. When a user that has no password signs in, that password that they've signed in with is set as the users password
     */
    async signIn2() {
        let result: UserInfo | undefined;
        const userRepo = remult.repo(User);
        // //console.log('remult.user', JSON.stringify(remult))
        // //console.log('userRepo',userRepo)
        let u = await userRepo.findFirst({ mobile: [this.mobile, '1' + this.mobile] }, { useCache: false });
        // console.log('signIn', u?.mobile, this.mobile)
        if (!u) {
            // console.log('!u')
            if (await userRepo.count() === 0) { //first ever user is the admin
                u = await userRepo.insert({
                    mobile: this.mobile,
                    admin: true,
                    name: 'admin'
                })
                let branch = await remult.repo(Branch).findFirst({ system: true })
                const userBranchRepo = remult.repo(UserBranch);
                let ub = await userBranchRepo.insert({
                    branch: branch,
                    user: u
                })
            }
        }
        if (u) {
            let uMobile = mobileToDb(u.mobile)
            // console.log('u', uMobile, this.mobile)
            if (uMobile === this.mobile || uMobile === '1' + this.mobile) {

                if (!u.active) {
                    throw new Error('משתמש זה איננו פעיל');
                }
                let adminVerifyCode = process.env['ADMIN_VERIFY_CODE'] ?? ''
                if ([u.verifyCode, adminVerifyCode].includes(this.verifyCode)) {
                    if (this.verifyCode === adminVerifyCode) {

                    } else {
                        let validVerificationCodeResponseMinutes = 5
                        let now = new Date();
                        let minValidTime = new Date(
                            now.getFullYear(),
                            now.getMonth(),
                            now.getDate(),
                            now.getHours(),
                            now.getMinutes() - validVerificationCodeResponseMinutes);
                        if (u.verifyTime < minValidTime) {
                            throw new Error('קוד זה כבר אינו בתוקף');
                        }
                    }

                    u.logedIn = new Date()
                    await u.save()
                    // console.log('u.firstName',u.firstName)
                    result = {
                        id: u.id,
                        roles: [],
                        name: u.name,
                        isAdmin: false,
                        isDonor: false,
                        isManager: false,
                        isVolunteer: false,
                        isTenant: false,
                        branch: '',
                        branchName: '',
                        lastComponent: '',
                        group: ''
                    };
                    if (!remult.user) {
                        remult.user = result
                    }
                    if (u.admin && !this.adminAsManager) {
                        result.roles!.push(Roles.admin);
                        remult.user!.isAdmin = true
                    }
                    else if (u.donor) {
                        result.roles!.push(Roles.donor);
                        remult.user!.isDonor = true
                    }
                    else if (u.manager || this.adminAsManager) {
                        result.roles!.push(Roles.manager);
                        remult.user!.isManager = true
                    }
                    else if (u.volunteer) {
                        result.roles!.push(Roles.volunteer);
                        remult.user!.isVolunteer = true
                    }
                    else if (u.tenant) {
                        result.roles!.push(Roles.tenant);
                        remult.user!.isTenant = true
                    }
                    //set user-branch
                    let ub = await remult.repo(UserBranch).find({ where: { user: { $id: u.id } } })
                    if (ub?.length) {
                        remult.user.branch = ub[0].branch.id
                        remult.user.branchName = ub[0].branch.name
                        remult.user.group = BranchGroup.all.id
                    }
                }
            }
        }

        if (result) {
            // console.log('result')
            const req = getRequest();
            req.session!['user'] = result;
            if (this.rememberOnThisDevice) {
                let day = 24 * 60 * 60 * 1000 // one-day
                req.sessionOptions.maxAge = 365 * day; //remember for a year
            }
            return result;
        }
        // console.log('throw')
        throw new Error(terms.invalidSignIn);
    }

    @BackendMethod({ allowed: true })
    /**
     * This sign mechanism represents a simplistic sign in management utility with the following behaviors
     * 1. The first user that signs in, is created as a user and is determined as admin.
     * 2. When a user that has no password signs in, that password that they've signed in with is set as the users password
     */
    async signIn() {
        let result: { success: boolean, userInfo: UserInfo, error: string } = {
            success: false,
            userInfo: {
                id: '',
                roles: [],
                name: '',
                isAdmin: false,
                isDonor: false,
                isManager: false,
                isVolunteer: false,
                isTenant: false,
                branch: '',
                branchName: '',
                lastComponent: '',
                group: ''
            },
            error: ''
        }
        if (this.mobile?.trim().length) {
            const userRepo = remult.repo(User);
            let u = await userRepo.findFirst({ mobile: [this.mobile, '1' + this.mobile] }, { useCache: false });
            if (!u) {
                if (await userRepo.count() === 0) { //first ever user is the admin
                    u = await userRepo.insert({
                        mobile: this.mobile,
                        admin: true,
                        name: 'admin'
                    })
                    let branch = await remult.repo(Branch).findFirst({ system: true })
                    const userBranchRepo = remult.repo(UserBranch);
                    let ub = await userBranchRepo.insert({
                        branch: branch,
                        user: u
                    })
                }
            }
            if (u) {
                let uMobile = mobileToDb(u.mobile)
                if (uMobile === this.mobile || uMobile === '1' + this.mobile) {
                    if (u.active) {
                        u.logedIn = new Date()
                        await u.save()
                        result.success = true
                        result.userInfo.id = u.id
                        result.userInfo.name = u.name

                        if (!remult.user) {
                            remult.user = result.userInfo
                        }
                        if (u.admin && !this.adminAsManager) {
                            result.userInfo.roles!.push(Roles.admin);
                            remult.user!.isAdmin = true
                        }
                        else if (u.donor) {
                            result.userInfo.roles!.push(Roles.donor);
                            remult.user!.isDonor = true
                        }
                        else if (u.manager || this.adminAsManager) {
                            result.userInfo.roles!.push(Roles.manager);
                            remult.user!.isManager = true
                        }
                        else if (u.volunteer) {
                            result.userInfo.roles!.push(Roles.volunteer);
                            remult.user!.isVolunteer = true
                        }
                        else if (u.tenant) {
                            result.userInfo.roles!.push(Roles.tenant);
                            remult.user!.isTenant = true
                        }
                        //set user-branch
                        let ub = await remult.repo(UserBranch).findFirst({ user: { $id: u.id } }, {useCache: false})
                        if (ub) {
                            // console.log('u.id',u.id,ub.branch,ub.user,ub)
                            remult.user.branch = ub.branch.id
                            remult.user.branchName = ub.branch.name
                            remult.user.group = ub.branch.group?.id
                            result.userInfo.branch = ub.branch.id
                            result.userInfo.branchName = ub.branch.name
                            result.userInfo.group = ub.branch.group?.id
                        }
                    } 
                    else {
                        result.error = 'משתמש זה איננו פעיל'
                    }
                }
                else {
                    result.error = 'סלולרי לא תקין';
                }
            }
            else {
                result.error = terms.invalidSignIn;
            }

            if (result.success) {
                const req = getRequest();
                req.session!['user'] = result.userInfo;
                if (this.rememberOnThisDevice) {
                    let day = 24 * 60 * 60 * 1000 // one-day
                    req.sessionOptions.maxAge = 365 * day; //remember for a year
                }
            }
            else {
                if (!result.error?.trim().length) {
                    result.error = terms.invalidSignIn;
                }
            }
        }
        else {
            result.error = terms.mobileRequired;
        }
        return result;
    }

    @BackendMethod({ allowed: Allow.authenticated })
    static signOut() {
        getRequest().session!['user'] = undefined;
    }

    @BackendMethod({ allowed: true })
    static currentUser() {
        return remult.user;
    }

    @BackendMethod({ allowed: true })
    async sendValidationCode() {
        let result = { success: false, error: '', special: false }
        if (this.mobile?.trim().length === 10) {
            let user = await remult.repo(User).findFirst({ mobile: [this.mobile, '1' + this.mobile] }, { useCache: false });
            if (user) {
                let adminMobile = process.env['ADMIN_MOBILE'] ?? ''
                if (adminMobile === this.mobile) {
                    result.special = true
                    result.success = true
                }
                else {
                    let code = this.randomValidationCode()

                    let sms = new SmsService()
                    let res = await sms.sendSmsMulti({
                        international: user.mobile?.startsWith('1'),
                        message: `קוד אימות: ${code}, תקף לחמש דקות`,
                        mobiles: [user.mobile],
                        senderid: user.id
                    })
                    let isDevMode = await (new AppController()).isDevMode()
                    if (res.success || isDevMode) {
                        user.verifyCode = code.toString()
                        user.verifyTime = new Date()
                        await user.save()
                        result.success = true
                        // console.log('code', code)
                    }
                    else {
                        result.error = res.message
                    }
                }
            }
            else {
                result.error = terms.mobileNotExists
                // throw new Error(terms.mobileNotExists);
            }
        }
        else {
            result.error = terms.mobileRequired
            // throw new Error(terms.mobileRequired);
        }
        return result
    }

    randomValidationCode() {
        let min = 555770
        let max = 999770
        return Math.floor(Math.random() * (max - min) + min)
    }

}
