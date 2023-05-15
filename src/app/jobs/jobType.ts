
import { ValueListFieldType } from "remult"

@ValueListFieldType<JobType>({
    caption: 'סוג התראה'
})
export class JobType {

    static volunteerVisit4Times = new JobType('מתנדב השתתף 4 פעמים ברצף',
        `!volunteer! היקר,\n
        יישר כח שאתה נותן מזמנך ומאיר יותר את העולם,
        המשך כך !\n
        פרוייקט ההתנדבות גט חסד`)

    static volunteerMiss2Times = new JobType('מתנדב נעדר 2 פעמים ברצף',
        `!volunteer! כבר שבועיים שלא הגעת להתנדבות חבד לנוער,
        נשמח לשמוע ממך :)\n
        פרוייקט ההתנדבות גט חסד`)

    static tenantBirthday = new JobType('יומולדת לדייר',
        `לידיעתך! השבוע חל יום הולדתו של -!tenant! בתאריך !date! אנא תאמ/י חגיגה עם המתנדבים.\n
        פרוייקט ההתנדבות גט חסד`)

    static managerTodayIsThursday = new JobType('היום יום חמישי',
        `בוקר אור!\n
        היום יום חמישי, חמישי!\n
        הדווח פתוח מהשעה 17:00\n
        בהצלחה :)\n
        פרוייקט ההתנדבות גט חסד`)

    static managerWaitingForYourFeddback = new JobType('ממתינים לדיווח',
        `המערכת מחכה לתגובתך\n
        פרוייקט ההתנדבות גט חסד`)

    static managerAlertForYourFeddback = new JobType('התראה שניה לדיווח',
        `טרם דיווחת במערכת\n
        פרוייקט ההתנדבות גט חסד`)

    static managerVolunteerNotCome3Times = new JobType('מתנדב החסיר שלושה מפגשים',
        `!volunteer! נעדר מההתנדבות כבר 3 פעמים אנא צור איתו קשר\n
        !mobile!\n
        פרוייקט ההתנדבות גט חסד`)

    static managerTenantNotVisit2Times = new JobType('דייר לא בוקר פעמיים',
        `!tenant! כבר שבועיים שהוא לבד ומחכה לביקור,\n
        אנא בדוק עם המתנדבים!\n
        פרוייקט ההתנדבות גט חסד`)

    static managerEndOfMonthReport = new JobType('ראש כולל דוח סוף חודש')

    constructor(public caption = '', public message = '') { }
    id!: string
    
}
