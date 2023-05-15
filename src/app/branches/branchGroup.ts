import { ValueListFieldType } from "remult"

@ValueListFieldType<BranchGroup>({ caption: 'קבוצת לומדים' })
export class BranchGroup {
    static all = new BranchGroup('שניהם', '', 'transparent', 'all')
    static avrach = new BranchGroup('אברכים', 'אברך', 'rgba(227, 172, 119, 1)', 'avrach')
    static tenant = new BranchGroup('דיירים', 'דייר', 'rgba(35, 194, 233, 1)', 'tenant')
    constructor(public caption = '', public single = '', public color = '', public id = '') { }
    static getOptions(includeAll = true) {
        let result = [BranchGroup.avrach, BranchGroup.tenant]
        if (includeAll) {
            result.push(BranchGroup.all)
        }
        return result
    }
    static fromId(id: string) {
        // if (id === BranchGroup.avrach.id) {
        //     return BranchGroup.avrach
        // }
        if (id === BranchGroup.tenant.id) {
            return BranchGroup.tenant
        }
        return BranchGroup.avrach
    }
}
