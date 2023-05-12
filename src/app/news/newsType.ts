import { ValueListFieldType } from "remult"

@ValueListFieldType<NewsType>({
    caption: 'סוג הודעה'
})
export class NewsType {
    static none = new NewsType('לא צוין')
    static link = new NewsType('תמונה')
    static text = new NewsType('מלל')
    constructor(public caption = '') { }
    id!: string
}
