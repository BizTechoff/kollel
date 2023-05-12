import { ValueListFieldType } from "remult"

@ValueListFieldType<BranchGroup>({ caption: 'קבוצת סניפים' })
export class BranchGroup {
    static all = new BranchGroup('נוער + קמפוס', 'transparent', 'all')
    static noar = new BranchGroup('נוער', 'rgba(227, 172, 119, 1)', 'noar')
    static campus = new BranchGroup('קמפוס', 'rgba(35, 194, 233, 1)', 'campus')
    constructor(public caption = '', public color = '', public id = '') { }
    static getOptions(includeAll = true) {
        let result = [BranchGroup.noar, BranchGroup.campus]
        if (includeAll) {
            result.push(BranchGroup.all)
        }
        return result
    }
    static fromId(id: string) {
        if (id === BranchGroup.noar.id) {
            return BranchGroup.noar
        }
        if (id === BranchGroup.campus.id) {
            return BranchGroup.campus
        }
        return BranchGroup.all
    }
}
