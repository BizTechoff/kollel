import './common/dateFunc'

export const terms = {
    appVersion: '2025.02.02',
    username: "שם",
    signIn: "Sign In",
    confirmPassword: "Confirm Password",
    signUp: "Sign Up",
    doesNotMatchPassword: "doesn't match password",
    password: 'password',
    updateInfo: "Update Info",
    changePassword: "Change Password",
    hello: "Hello",
    invalidOperation: "Invalid Operation",
    admin: 'אדמין',
    manager: 'ראש כולל',
    volunteer: 'מתנדב',
    tenant: 'דייר',
    yes: 'כן',
    no: 'לא', 
    ok: 'אישור',
    areYouSureYouWouldLikeToDelete: "Are you sure you would like to delete",
    cancel: 'Cancel',
    home: 'welcome',
    userAccounts: 'משתמשים',
    invalidSignIn: "פרטי כניסה שגויים",
    signOut: 'Sign Out',
    resetPassword: 'Reset Password',
    passwordDeletedSuccessful: "Password Deleted",
    passwordDeleteConfirmOf: "Are you sure you want to delete the password of",
    rememberOnThisDevice: "Remember on this device?",
    RTL: false,
    mobileNotExists:'סלולרי לא קיים',
    mobileRequired:'סלולרי לא תקין',
    nameRequired:'נא להזין את שמך',
    created: 'נוצר',
    createdBy: 'נוצר ע"י',
    modified: 'השתנה',
    modifiedBy: 'השתנה ע"י',
    required: 'חובה'
}


export const hebrewMonths = [
    'ינואר',//index 0
    'פברואר',
    'מרץ',
    'אפריל',
    'מאי',
    'יוני',
    'יולי',
    'אוגוסט',
    'ספטמבר',
    'אוקטובר',
    'נובמבר',
    'דצמבר'
]
 
declare module 'remult' {
    export interface UserInfo {
        isAdmin: boolean;
        isDonor: boolean;
        isManager: boolean;
        isVolunteer: boolean;
        isTenant: boolean;
        branch: string;
        branchName: string;
        lastComponent: string;
        group: string;
    }
}

// declare module 'Validators' {
//     static required: ((entity: any, col: FieldRef<any, string>, message?: any) => void) & {
//         withMessage: (message: string) => (entity: any, col: FieldRef<any, string>) => void;
//         defaultMessage: string;
//     };
