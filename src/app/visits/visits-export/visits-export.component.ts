import { Component, OnInit } from '@angular/core';
import { remult } from 'remult';
import * as xlsx from 'xlsx';
import { BranchGroup } from '../../branches/branchGroup';
import { RouteHelperService } from '../../common-ui-elements';
import { UIToolsService } from '../../common/UIToolsService';
import { dateDiff, firstDateOfWeek, lastDateOfWeek, resetDateTime } from '../../common/dateFunc';
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

  constructor(private routeHelper: RouteHelperService,
    private ui: UIToolsService) { }
  terms = terms;
  remult = remult;
  ExportType = ExportType
  BranchGroup = BranchGroup

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
    this.query.detailed = false
    this.query.type = ExportType.all
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
    if (this.validate()) {
      // data
      let result = await this.query.exportVisits()
      // excel-sheet
      let wb = xlsx.utils.book_new();
      wb.Workbook = { Views: [{ RTL: true }] };

      let group = this.query.group === BranchGroup.all
        ? 'נוער+קמפוס'
        : this.query.group === BranchGroup.avrach
          ? 'נוער'
          : 'קמפוס'

      // let ws = xlsx.utils.json_to_sheet(result)
      let ws = xlsx.utils.aoa_to_sheet(result)
      // let csv = xlsx.utils.sheet_to_csv(ws, {  })
      // console.log('csv', csv)
      xlsx.utils.book_append_sheet(
        wb,
        ws,
        `${this.query.fdate.getDate()}-${this.query.tdate.getDate()}.${this.query.tdate.getMonth() + 1}.${this.query.tdate.getFullYear()} ${group}`)
      // `${dateFormat(this.query.fdate, '.')}-${dateFormat(this.query.tdate, '.')}`);
      xlsx.writeFile(
        wb,
        `גט חסד דוח דיווחים${this.query.detailed ? ' מפורט' : ''}.${this.ext}`,
        {
          bookType: this.ext === 'html' ? 'html' : this.ext === 'csv' ? 'csv' : 'xlsx',
          Props: { Company: 'BizTechoff™' },
          cellStyles: true
        });


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

    }
  }

  validate() {
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
    if (dateDiff(this.query.fdate, this.query.tdate) > 45) {
      this.ui.info('מקסימום טווח של 45 יום')
      return false
    }
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
