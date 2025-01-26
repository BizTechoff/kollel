import { Component, OnInit } from '@angular/core';
import { remult } from 'remult';
import * as xlsx from 'xlsx';
import { Branch } from '../../branches/branch';
import { BranchController } from '../../branches/branchController';
import { BranchGroup } from '../../branches/branchGroup';
import { RouteHelperService } from '../../common-ui-elements';
import { UIToolsService } from '../../common/UIToolsService';
import { addDaysToDate, firstDateOfWeek, getWeekNumber, lastDateOfWeek, resetDateTime } from '../../common/dateFunc';
import { Tenant } from '../../tenants/tenant';
import { TenantController } from '../../tenants/tenantController';
import { hebrewMonths, terms } from '../../terms';
import { UserMenuComponent } from '../../users/user-menu/user-menu.component';
import { Visit } from '../visit';
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
  allowChangeExt = true
  selectedBranch!: Branch
  selectedTenant!: Tenant
  years = [new Date().getFullYear()] as number[]
  weeks = [] as { num: number, display: string, start: Date, end: Date }[]
  selectedYear = 0
  selectedMonth = 0
  selectedWeek = 0

  constructor(
    private routeHelper: RouteHelperService,
    private ui: UIToolsService) { }
  terms = terms;
  remult = remult;
  hebrewMonths = hebrewMonths
  ExportType = ExportType
  BranchGroup = BranchGroup

  async ngOnInit() {
    remult.user!.lastComponent = VisitsExportComponent.name
    let today = resetDateTime(new Date())
    this.selectedYear = today.getFullYear()
    this.selectedMonth = today.getMonth()
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

    let ystart = (await remult.repo(Visit).findFirst({}, { orderBy: { date: 'asc' } }))?.date.getFullYear()
    let yend = (await remult.repo(Visit).findFirst({}, { orderBy: { date: 'desc' } }))?.date.getFullYear()
    let wstart = 1
    let wend = 52

    this.years.splice(0)
    for (let i = yend; i >= ystart; --i) {
      if (!this.years.includes(i)) {
        this.years.push(i)
      }
    }
    if(!this.years.length){
      this.years.push(new Date().getFullYear())
    }

    // for (let i = wstart; i <= wend; ++i) {
    //   if (!this.weeks.includes(i)) {
    //     this.weeks.push(i)
    //   }
    // }

    this.selectedMonthChanged()

    // this.selectedWeek = { num: -1, display: 'כל החודש', start: undefined!, end: undefined! }
    // this.weeks.push(this.selectedWeek)

    this.loadFromStorage()
  }

  hebrewNumbers = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי']

  selectedMonthChanged() {
    this.weeks.splice(0)
    let date = new Date(this.selectedYear, this.selectedMonth, 1)
    for (let d = 1; d <= 31; ++d) {
      // console.log('date.getDay()', date.getDay())
      if (date.getDay() === 4 /*Thursday*/) {
        let f = firstDateOfWeek(date)
        // console.log('getWeekNumber(f)', getWeekNumber(f))
        let l = lastDateOfWeek(date)//this.hebrewNumbers[this.weeks.length]
        // let display =`שבוע (${this.weeks.length + 1}): ` + `${f.getDate()}-${l.getDate()}.${l.getMonth() + 1}`.padEnd(12,' ')
        // let display =`${this.weeks.length + 1}) שבוע` + ' ' + `${f.getDate()}-${l.getDate()}.${l.getMonth() + 1}`
        let display = `(ש${this.weeks.length + 1})` + '\t' + `${f.getDate()}-${l.getDate()}.${l.getMonth() + 1}`
        this.weeks.push({
          start: f,
          end: l,
          num: getWeekNumber(f)[1],
          display: display.trim()
        })
      }// if has next day
      date = addDaysToDate(date, 1)
      let m = date.getMonth()
      if (m !== this.selectedMonth) {
        break;
      }
    }
    this.weeks.push({ num: -1, display: 'כל החודש', start: undefined!, end: undefined! })
    this.selectedWeek = this.weeks.length - 1
  }

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
      title: 'בחירת כולל',
      values: vols,
      onSelect: async (selected) => {
        // console.log(selected)
        let b = await remult.repo(Branch).findId(selected.id)
        this.selectedBranch = b
        await this.onSelectedBranchChanged()
        // if (b && b.id !== this.selectedBranch?.id)
        //   { this.selectedBranch = b }
        // console.log('selected branch changed: ' + this.selectedBranch?.name)
      }
    })
  }

  async onSelectedBranchChanged() {
    // this.selectedTenants.splice(0)
    // if (this.selectedBranch?.id?.length) {
    //   let q = new TenantController()
    //   q.kollel = this.selectedBranch
    //   let tenants = await q.getTenants()
    //   this.selectedTenants.push(...tenants)
    // }
    // else {
    //   this.ui.info(`לא נבחר כולל`)
    // }
  }

  async selectTenant() {
    // console.log('selectBranch..')
    let vols: { caption: string, id: string }[] = [] as { caption: string, id: string }[]
    let uc = new TenantController()
    uc.kollel = this.selectedBranch
    for (const v of await uc.getTenantsByKollel()) {
      vols.push({ caption: v.name, id: v.id })
    }
    await this.ui.selectValuesDialog({
      clear: true,
      title: 'בחירת אברך',
      values: vols,
      onSelect: async (selected) => {
        // console.log(selected)
        this.selectedTenant = await remult.repo(Tenant).findId(selected.id)
        // console.log('selected branch changed: ' + this.selectedBranch?.name)
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

  async groupChanged() {
    let group = BranchGroup.fromId(remult.user!.group)
    if (group) {
      // console.log(`AlbumComponent.groupChanged: { this.query.group: ${this.query.group.id}, group: ${group.id}`)
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
      this.storeToStorage()
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

      // console.log('name', name)
      //דוח דיווחים מפורט - 2023-11-12T092658.966.xlsx

      xlsx.utils.book_append_sheet(
        wb,
        ws,
        name)
      xlsx.writeFile(
        wb,
        `דוח דיווחים${this.query.detailed ? ' מפורט' : ''}.${this.ext}`,
        {
          bookType: this.ext === 'html' ? 'html' : this.ext === 'csv' ? 'csv' : 'xlsx',
          // bookType: this.ext === 'html' ? 'html' : this.ext === 'csv' ? 'csv' : this.ext === 'xls' ? 'xls' : 'xlsx',
          Props: { Company: 'BizTechoff™' },
          cellStyles: true
        });
    }
  }

  storeToStorage() {
    localStorage.setItem('bto.kollel.export.selected.year', this.selectedYear + '')
    localStorage.setItem('bto.kollel.export.selected.month', this.selectedMonth + '')
    localStorage.setItem('bto.kollel.export.selected.week', this.selectedWeek + '')
    localStorage.setItem('bto.kollel.export.selected.detailed', this.query.detailed + '')
    localStorage.setItem('bto.kollel.export.selected.actual', this.query.actual + '')
    localStorage.setItem('bto.kollel.export.selected.ext', this.ext + '')
  }

  loadFromStorage() {
    // let year = localStorage.getItem('bto.kollel.export.selected.year')
    // if (year) {
    //   this.selectedYear = parseInt(year)
    // }
    // let month = localStorage.getItem('bto.kollel.export.selected.month')
    // if (month) {
    //   this.selectedMonth = parseInt(month)
    // }
    // let week = localStorage.getItem('bto.kollel.export.selected.week')
    // if (week) {
    //   this.selectedWeek = parseInt(week)
    // }
    // let detailed = localStorage.getItem('bto.kollel.export.selected.detailed')
    // if (detailed) {
    //   this.query.detailed = detailed === 'true'
    // }
    // let actual = localStorage.getItem('bto.kollel.export.selected.actual')
    // if (actual) {
    //   this.query.actual = actual === 'true'
    // }
    let ext = localStorage.getItem('bto.kollel.export.selected.ext')
    if (ext) {
      this.ext = ext
    }
  }


  async validate() {

    var year = this.selectedYear
    var month = this.selectedMonth
    var week = this.weeks[this.selectedWeek]

    // console.log('this.selectedWeek', JSON.stringify(this.selectedWeek))

    var fdate = week.start
    var tdate = week.end
    if (!fdate || !tdate) {
      fdate = new Date(year, month, 1)
      tdate = addDaysToDate(new Date(fdate.getFullYear(), fdate.getMonth() + 1, 1), -1)
    }
    this.query.fdate = fdate
    this.query.tdate = tdate

    // console.log(fdate, tdate)
    // return false
    // if (!this.query.fdate) {
    //   this.query.fdate = new Date()
    //   // this.ui.info('לא צויין תאריך התחלה')
    //   // return false
    // }
    // this.query.fdate = firstDateOfWeek(this.query.fdate)
    // if (!this.query.tdate) {
    //   this.query.tdate = this.query.fdate
    // }
    // this.query.tdate = lastDateOfWeek(this.query.tdate)
    // if (this.query.tdate < this.query.fdate) {
    //   this.query.tdate = lastDateOfWeek(this.query.fdate)
    // }
    // let sevenWeeks = 7 * 7 - 1
    // if (dateDiff(this.query.fdate, this.query.tdate) > sevenWeeks) {
    //   let yes = await this.ui.yesNoQuestion('מקסימום טווח של 7 שבועות, לבחור לך תאריך כזה?')
    //   if (!yes) {
    //     return false
    //   }
    //   this.query.fdate = firstDateOfWeek(
    //     addDaysToDate(this.query.tdate, -sevenWeeks))
    // }
    if (![ExportType.all, ExportType.doneAndNotDone].includes(this.query.type)) {
      this.query.actual = false
    }
    this.query.branch = this.selectedBranch
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
