import { ValueListFieldType } from "remult"
import { BranchGroup } from "../../branches/branchGroup"

@ValueListFieldType<ExportType>({
    caption: 'סוג ייצוא'
})
export class ExportType {
    // static done = new ExportType('דיווחו את כולם', 'transparent', 'done')
    // static doneAndNotDone = new ExportType('דיווחו לפחות אחד', 'transparent', 'doneAndNotDone')
    // static notDone = new ExportType('לא דווחו בכלל', 'orange', 'notDone')
    // static all = new ExportType('כל הדיווחים', 'green', 'all')
    static done = new ExportType('', 'כולל שדיווח את כל ה{0}', 'transparent', 'done')
    static doneAndNotDone = new ExportType('', 'כולל שדיווח לפחות על {1} אחד', 'transparent', 'doneAndNotDone')
    static notDone = new ExportType('', 'כולל שלא דיווח אף {1}', 'orange', 'notDone')
    static all = new ExportType('', 'הכל', 'green', 'all')
    constructor(public caption = '', public schema = '', public color = '', public id = '') { }
    static getOptions(includeAll = true, group: BranchGroup) {
        let result = [ExportType.done, ExportType.doneAndNotDone, ExportType.notDone]
        if (includeAll) {
            result.push(ExportType.all)
        }
        if (group) {
            for (const o of result) {
                // console.log('BEFORE:',o.caption,' | ',o.schema,' | ',group.caption,' | ', group.single)
                o.caption = o.schema.replace('{0}', group.caption).replace('{1}', group.single)
                // o.caption = o.schema.replace('{1}', group.single)
                // console.log('AFTER:',o.caption,' | ',o.schema,' | ',group.caption,' | ', group.single)
            }
        }
        return result
    }
}
