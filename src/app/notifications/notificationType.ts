import { ValueListFieldType } from "remult"

@ValueListFieldType<NotificationType>({
    caption: 'סוג התראה'
})
export class NotificationType {
    static none = new NotificationType('לא צוין')
    static sms = new NotificationType('מסרון')
    static email = new NotificationType('אימייל')
    constructor(public caption = '') { }
    id!: string
}
