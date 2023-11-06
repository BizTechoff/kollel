import { Component, OnInit } from '@angular/core';
import { remult } from 'remult';
import * as xlsx from 'xlsx';
import { Branch } from '../../branches/branch';
import { BranchController } from '../../branches/branchController';
import { BranchGroup } from '../../branches/branchGroup';
import { RouteHelperService } from '../../common-ui-elements';
import { UIToolsService } from '../../common/UIToolsService';
import { addDaysToDate, dateDiff, firstDateOfWeek, lastDateOfWeek, resetDateTime } from '../../common/dateFunc';
import { terms } from '../../terms';
import { UserMenuComponent } from '../../users/user-menu/user-menu.component';
import { VisitController } from '../visitController';
import { ExportType } from './exportType';

@Component({
  selector: 'app-visits-export',
  templateUrl: './visits-export.component.html',
  styleUrls: ['./visits-export.component.scss']
})
export class VisitsExportComponent implements OnInit {

  query = new VisitController()
  ext = 'xlsx'
  allowChangeExt = false
  selectedBranch!: Branch

  constructor(private routeHelper: RouteHelperService,
    private ui: UIToolsService) { }
  terms = terms;
  remult = remult;
  ExportType = ExportType
  BranchGroup = BranchGroup

  async selectBranch() {
    // console.log('selectBranch..')
    let vols: { caption: string, id: string }[] = [] as { caption: string, id: string }[]
    let uc = new BranchController()
    uc.group = this.query.group
    for (const v of await uc.getBranches()) {
      vols.push({ caption: v.name, id: v.id })
    }
    await this.ui.selectValuesDialog({
      clear: true,
      title: 'בחירת כוללים',
      values: vols,
      onSelect: async (selected) => {
        console.log(selected)
        this.selectedBranch = await remult.repo(Branch).findId(selected.id)
        console.log('selected branch changed: ' + this.selectedBranch?.name)
      }
    })
  }

  startFilter = (d: Date): boolean => {
    const day = d.getDay();
    // Prevent Saturday and Sunday from being selected.
    return day === 1
  }

  endFilter = (d: Date): boolean => {
    const day = d.getDay();
    // Prevent Saturday and Sunday from being selected.
    return day === 4
  }

  ngOnInit(): void {
    remult.user!.lastComponent = VisitsExportComponent.name
    let today = resetDateTime(new Date())
    this.query.fdate = firstDateOfWeek(today)
    this.query.tdate = lastDateOfWeek(today)
    this.query.detailed = remult.user?.isManager ?? false
    this.query.type = ExportType.all
    this.query.actual = remult.user?.isAdmin ?? false
    //  remult.user!.isManager
    //   ? ExportType.all
    //   : ExportType.doneAndNotDone
    this.query.group = BranchGroup.fromId(remult.user!.group)
    this.ext = 'xlsx'
  }

  async groupChanged() {
    let group = BranchGroup.fromId(remult.user!.group)
    if (group) {
      console.log(`AlbumComponent.groupChanged: { this.query.group: ${this.query.group.id}, group: ${group.id}`)
      if (group !== this.query.group) {
        this.query.group = group
        // var swap = this.query.type
        // this.query.type = undefined!
        // this.query.type = swap
      }
    }
  }

  // @https://www.npmjs.com/package/xlsx
  async export() {
    if (await this.validate()) {
      // data
      let result = await this.query.exportVisits3()
      // console.log('result')
      // console.table(result)
      // excel-sheet
      let wb = xlsx.utils.book_new();
      wb.Workbook = { Views: [{ RTL: true }] };
      let ws = xlsx.utils.aoa_to_sheet(result)
      var name = `` +
        `${this.query.fdate.getDate()}.` +
        `${this.query.fdate.getMonth() + 1}-` +
        `${this.query.tdate.getDate()}.` +
        `${this.query.tdate.getMonth() + 1}.` +
        `${this.query.tdate.getFullYear()}` +
        ` ${this.query.group.caption}`

      xlsx.utils.book_append_sheet(
        wb,
        ws,
        name)
      xlsx.writeFile(
        wb,
        `דוח דיווחים${this.query.detailed ? ' מפורט' : ''}.${this.ext}`,
        {
          bookType: this.ext === 'html' ? 'html' : this.ext === 'csv' ? 'csv' : 'xlsx',
          Props: { Company: 'BizTechoff™' },
          cellStyles: true
        });
    }
  }

  async validate() {
    if (!this.query.fdate) {
      this.query.fdate = new Date()
      // this.ui.info('לא צויין תאריך התחלה')
      // return false
    }
    this.query.fdate = firstDateOfWeek(this.query.fdate)
    if (!this.query.tdate) {
      this.query.tdate = this.query.fdate
    }
    this.query.tdate = lastDateOfWeek(this.query.tdate)
    if (this.query.tdate < this.query.fdate) {
      this.query.tdate = lastDateOfWeek(this.query.fdate)
    }
    let sevenWeeks = 7 * 7 - 1
    if (dateDiff(this.query.fdate, this.query.tdate) > sevenWeeks) {
      let yes = await this.ui.yesNoQuestion('מקסימום טווח של 7 שבועות, לבחור לך תאריך כזה?')
      if (!yes) {
        return false
      }
      this.query.fdate = firstDateOfWeek(
        addDaysToDate(this.query.tdate, -sevenWeeks))
    }
    if (![ExportType.all, ExportType.doneAndNotDone].includes(this.query.type)) {
      this.query.actual = false
    }
    this.query.branch =  this.selectedBranch
    // if (!this.query.detailed) {
    //   this.query.type = ExportType.done
    // } 
    return true
  }

  back() {
    this.routeHelper.navigateToComponent(UserMenuComponent)
  }

  rootmenu() {
    this.routeHelper.navigateToComponent(UserMenuComponent)
  }

}




// let ws = xlsx.utils.json_to_sheet(result)
// let csv = xlsx.utils.sheet_to_csv(ws, {  })
// console.log('csv', csv)
// `${dateFormat(this.query.fdate, '.')}-${dateFormat(this.query.tdate, '.')}`);
// let rows = [
//   { v: "Courier: 24", t: "s", s: { font: { name: "Courier", sz: 24 } } },
//   { v: "bold & color", t: "s", s: { font: { bold: true, color: { rgb: "FF0000" } } } },
//   { v: "fill: color", t: "s", s: { fill: { fgColor: { rgb: "E9E9E9" } } } },
//   { v: "line\nbreak", t: "s", s: { alignment: { wrapText: true } } },
//   { v: "border", t: "s", s: { border: { style: 'thin', color: '000000' } } }
// ];
// xlsx.utils.encode_cell
// const ws = xlsx.utils.aoa_to_sheet([rows]);

//   ws.s = { // styling for all cells
//     font: {
//         name: "arial"
//     },
//     alignment: {
//         vertical: "center",
//         horizontal: "center",
//         wrapText: '1', // any truthy value here
//     },
//     border: {
//         right: {
//             style: "thin",
//             color: "000000"
//         },
//         left: {
//             style: "thin",
//             color: "000000"
//         },
//     }
// };


// xlsx.utils.book_append_sheet(wb, ws, "readme demo");

// this.query.fdate = new Date(2023, 1, 6)
// this.query.tdate = new Date(2023, 1, 12)
// console.log('client', this.query.fdate, this.query.tdate, this.query.detailed, this.query.onlyDone)
// if (this.ext === 'csv') {
//   let sep: exportDataRow = {}
//   // sep[ 'sep=,'] = ''
//   result.unshift(sep)
// }
// xlsx.utils.book_append_sheet(wb, '')
// xlsx.utils.sheet_to_csv(wb.Sheets[0]), `${dateFormat(this.query.fdate, '.')}-${dateFormat(this.query.tdate, '.')}`);
