import { ValueListFieldType } from "remult"

@ValueListFieldType<JosStatus>({
    caption: 'סטטוס עבודת שרת'
})
export class JosStatus {
    static created = new JosStatus('נוצר')
    static processing = new JosStatus('בתהליך')
    static done = new JosStatus('הסתיים')
    static error = new JosStatus('שגיאה')
    constructor(public caption = '') { }
    id!: string
}
