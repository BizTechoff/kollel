import { ValueListFieldType } from "remult"

@ValueListFieldType<MediaType>({
    caption: 'סוג מדיה'
})
export class MediaType {
    static none = new MediaType('לא צוין')
    static photo = new MediaType('תמונה')
    static video = new MediaType('סרטון')
    static text = new MediaType('טקסט')
    static excel = new MediaType('אקסל')
    constructor(public caption = '') { }
    id!: string
}
