import { Component, OnInit } from '@angular/core';
import { remult } from 'remult';
import { Branch } from '../../branches/branch';
import { RouteHelperService } from '../../common-ui-elements';
import { resetDateTime } from '../../common/dateFunc';
import { UIToolsService } from '../../common/UIToolsService';
import { uploader } from '../../common/uploader';
import { ExcelController } from '../../excelController';
import { terms } from '../../terms';
import { UserMenuComponent } from '../../users/user-menu/user-menu.component';
import { Tenant } from '../tenant';
import { TenantsComponent } from '../tenants/tenants.component';

@Component({
  selector: 'app-tenants-import',
  templateUrl: './tenants-import.component.html',
  styleUrls: ['./tenants-import.component.scss']
})
export class TenantsImportComponent implements OnInit {

  rows = [] as { id: number, name: string, address: string, phone: string, /*birthday: string,*/ color: string, error: string }[]
  today = resetDateTime()
  constructor(
    private routeHelper: RouteHelperService,
    private ui: UIToolsService) { }

  ngOnInit(): void {
    // console.log('Helloaaa 1 - 1')
    document.getElementById('openFileSelector')?.click()
    // console.log('Helloaaa 1 - 2')
    // this.onFileInput(undefined!, undefined!)
  }
  terms = terms;
  remult = remult;

  async import() { }

  async validate() { }

  async addTenants() { }

  async onFileInput(e: any, target: string) {
    this.rows = [] as { id: number, name: string, address: string, phone: string, /*birthday: string,*/ color: string, error: string }[]

    let s3 = new uploader(
      true,
      undefined!,
      undefined!,
      undefined!,
      undefined!)
    let links = await s3.loadFiles(e?.target.files)
    if (links?.length) {
      let branch = await remult.repo(Branch).findId(remult.user?.branch!)
      if (branch) {
        for (const l of links) {
 
          let excel = new ExcelController()
          excel.file = l.file
          excel.branch = branch.email
          // excel.branch = l.br
          await excel.import()
          // let data =  excel.data  
          // console.log('onFileInput.import().data', excel.data?.length, excel.data?.join(','))
          let counter = 0
          for (const d of excel.data) {
            // console.log('onFileInput.import().d', d)
            let split = d.split('|')
            let r = { id: ++counter, name: split[0], address: split[1], phone: split[2], /*birthday: split[3],*/ color: 'transperant', error: '' }
            this.rows.push(r)
            // id: ++counter,
            // name: split[0],
            // address: split[1],
            // phone: split[2],
            // birthday: split[3],
            // color: 'transperant'

          }
          // // let data = await s3.download(l.file)
          // console.log('data', excel.data.join(','))
          // { data: string[], error: string }
          // if (res.error.length) {
          //   console.error('error', res.error)
          // }
          // else {
          //   console.log('data', JSON.stringify(res.data))
          // }

        }
        // let excel = new ExcelController()
        // excel.links = links.join('|')
        // let rowsCount = await excel.import()
        // console.log(`imported ${rowsCount} rows`)
      }
    }
  }

  rootmenu() {
    this.routeHelper.navigateToComponent(UserMenuComponent)
  }

  back() {
    this.routeHelper.navigateToComponent(TenantsComponent)
  }

  async addRow() {
    this.rows.push({
      id: this.rows.length,
      name: '',
      address: '',
      phone: '',
      // birthday: '',
      color: 'transperant',
      error: ''
    })
  }

  async add() {
    if (remult.user?.isManager) {
      let count = 0
      let branch = await remult.repo(Branch).findId(remult.user?.branch)
      if (branch) {
        // console.log('this.rows', JSON.stringify(this.rows))
        for (let i = this.rows.length - 1; i >= 0; --i) {
          // console.log(1,i)
          let r = this.rows[i]
          // console.log('current: ' + JSON.stringify(r))
          if (!(r.name?.trim().length ?? 0)) {
            // console.log(2)
            r.error = 'שם: שדה חובה'
            r.color = 'red'
          }
          else if (!(r.address?.trim().length ?? 0)) {
            // console.log(3)
            r.error = 'כתובת: שדה חובה'
            r.color = 'red'
          }
          else {
            // console.log(4)
            let found =
              r.phone?.trim().length ?
                await remult.repo(Tenant).findFirst({
                  $or: [
                    { name: r.name },
                    { phone: r.phone }
                  ]
                })
                :
                await remult.repo(Tenant).findFirst({
                  $or: [
                    { name: r.name }
                  ]
                })
            if (found) {
              r.error = 'שם\\טלפון קיימים'
              r.color = 'red'
            } 
            else {
              // console.log(5)
              // let date!: Date
              // try { date = new Date(r.birthday) }
              // catch (err) { console.error(`error convert date '${r.birthday}', err: ${err}`) }
              // if (date) {
                try {
                  await remult.repo(Tenant).insert({
                    branch: branch,
                    name: r.name,
                    address: r.address,
                    phone: r.phone//,
                    // birthday: r.birthday?.trim().length ? date : undefined!
                  })
                  // console.log(6)
                  this.remove(r)
                  ++count
                }
                catch (err) {
                  console.error(`error insert row '${JSON.stringify(r)}', err: ${err}`)
                  r.error = 'שגיאה: ' + JSON.stringify(r)
                  r.color = 'red'
                }
              // }
              // else {
              //   r.error = 'תאריך: לא חוקי'
              //   r.color = 'red'
              // }
            }
          }
        }
        this.ui.info(`נקלטו ${count} אברכים בהצלחה`)
      }
      else {
        this.ui.info(`שגיאה כולל שלך`)
      }
    }
  }

  async remove(r: { id: number, name: string, address: string, phone: string, /*birthday: string,*/ color: string }) {
    let i = this.rows.findIndex(itm => itm.id === r.id)
    if (i >= 0) {
      this.rows.splice(i, 1)
    }
  }

}
