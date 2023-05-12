import { ValueListFieldType } from "remult"

@ValueListFieldType<ExportType>({
    caption: 'סוג ייצוא'
})
export class ExportType {
    // static done = new ExportType('דיווחו את כולם', 'transparent', 'done')
    // static doneAndNotDone = new ExportType('דיווחו לפחות אחד', 'transparent', 'doneAndNotDone')
    // static notDone = new ExportType('לא דווחו בכלל', 'orange', 'notDone')
    // static all = new ExportType('כל הדיווחים', 'green', 'all')
    static done = new ExportType('סניף שדיווח את כל הדיירים', 'transparent', 'done')
    static doneAndNotDone = new ExportType('סניף שדיווח לפחות על דייר אחד', 'transparent', 'doneAndNotDone')
    static notDone = new ExportType('סניף שלא דיווח אף דייר', 'orange', 'notDone')
    static all = new ExportType('הכל', 'green', 'all')
    constructor(public caption = '', public color = '', public id = '') { }
    static getOptions(includeAll = true) {
        let result = [ExportType.done, ExportType.doneAndNotDone, ExportType.notDone]
        if (includeAll) {
            result.push(ExportType.all)
        }
        return result
    }
}
