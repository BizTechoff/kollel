import { BackendMethod, Controller, ControllerBase, Fields } from "remult";
// import '../server/aws-s3';
import { download } from "../server/aws-s3";
// import { uploader } from "./common/uploader";
import { Roles } from "./users/roles";

@Controller('excel')
export class ExcelController extends ControllerBase {

    @Fields.string<ExcelController>({ caption: 'קובץ' })
    file = ''

    @Fields.string<ExcelController>({ caption: 'כולל' })
    branch = ''

    @Fields.string<ExcelController>({ caption: 'נתונים' })
    data = [] as string[]

    @BackendMethod({ allowed: Roles.manager })
    async import() {
        this.data = [] as string[]
        let branchEngName = this.branch.trim().split('@')[0]
        // console.log('ExcelController.import()')
        // let importedRowsCount = 0
        this.data.push(... await download(this.file, branchEngName))
        // return importedRowsCount
        // console.log('ExcelController.import().data', this.data?.length, this.data?.join(','))
        // console.log('ExcelController.import()','data',data)
        // return this.data
    }

}
