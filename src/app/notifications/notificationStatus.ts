import { ValueListFieldType } from "remult"

@ValueListFieldType<NotificationStatus>({
    caption: 'סטטוס התראה'
})
export class NotificationStatus {
    static none = new NotificationStatus('לא צוין')
    static sent = new NotificationStatus('נשלח')
    static read = new NotificationStatus('נקרא')
    static error = new NotificationStatus('שגיאה')
    constructor(public caption = '') { }
    id!: string
}
