import { isBackend } from "remult";

import * as xlsx from 'xlsx';

export class ExportToExcel {

    // constructor(private busy: BusyService) { }

    // async export() {
    //     let grid: GridSettings<Tenant> = new GridSettings<Tenant>(remult.repo(Tenant),
    //         {
    //             where: { active: true }
    //         })
    //     await saveToExcel(grid, 'get.chesed.tenants', this.busy)
    // }

    async import(fileName = '') {
        // console.log('import from server = ' + isBackend())
        if (fileName?.trim().length) {
            let wb = xlsx.readFile(fileName)
            // console.log(`import: { fileName: ${fileName}}`)
        }

        // let wb = xlsx.utils.book_new();
        // wb.Workbook = { Views: [{ RTL: true }] };
        // // xlsx.utils.book_append_sheet(wb, '')
        // // xlsx.utils.sheet_to_csv(wb.Sheets[0]), `${dateFormat(this.query.fdate, '.')}-${dateFormat(this.query.tdate, '.')}`);
        // xlsx.utils.book_append_sheet(
        //   wb,
        //   xlsx.utils.json_to_sheet(result),
        //   `${dateFormat(this.query.fdate, '.')}-${dateFormat(this.query.tdate, '.')}`);
        // xlsx.writeFile(
        //   wb,
        //   `גט חסד דוח דיווחים${this.query.detailed ? ' מפורט' : ''}.${this.ext}`,
        //   {
        //     bookType: this.ext === 'html' ? 'html' : this.ext === 'csv' ? 'csv' : 'xlsx',
        //     Props: { Company: 'BizTechoff™' }
        //   });
    }

}
