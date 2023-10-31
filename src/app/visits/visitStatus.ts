import { ValueListFieldType } from "remult"

@ValueListFieldType<VisitStatus>({
    caption: 'סטטוס ביקור'
})
export class VisitStatus {
    static none = new VisitStatus('לא צוין', 'transparent', 'a-none')// 'איחר'
    static visited = new VisitStatus('ביקרתי', 'orange', 'visited')// 'נוכח'
    static delivered = new VisitStatus('מסרתי', 'green', 'delivered')
    constructor(public caption = '', public color = '', public id = '') { }
}
 