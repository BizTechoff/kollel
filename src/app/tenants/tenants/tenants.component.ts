import { Component, OnInit } from '@angular/core';
import { remult } from 'remult';
import { BusyService, RouteHelperService } from '../../common-ui-elements';
import { GridSettings } from '../../common-ui-elements/interfaces';
import { saveToExcel } from '../../common-ui-elements/interfaces/src/saveGridToExcel';
import { UIToolsService } from '../../common/UIToolsService';
import { terms } from '../../terms';
import { UserMenuComponent } from '../../users/user-menu/user-menu.component';
import { Tenant } from '../tenant';
import { TenantComponent } from '../tenant/tenant.component';
import { TenantController } from '../tenantController';
import { TenantsImportComponent } from '../tenants-import/tenants-import.component';
import { BranchGroup } from '../../branches/branchGroup';

@Component({
  selector: 'app-tenants',
  templateUrl: './tenants.component.html',
  styleUrls: ['./tenants.component.scss']
})
export class TenantsComponent implements OnInit {

  tenants = [] as Tenant[]
  query = new TenantController()
  group!:BranchGroup

  constructor(
    private routeHelper: RouteHelperService,
    private ui: UIToolsService,
    private busy: BusyService) {
  }
  terms = terms;
  remult = remult;

  async ngOnInit(): Promise<void> {
    this.group = BranchGroup.fromId(remult.user!.group)
    remult.user!.lastComponent = TenantsComponent.name
    //console.log('TenantsComponent.ngOnInit')
    this.tenants = await this.query.getTenants()
    // console.log('this.tenants',this.tenants.length)
    //console.log(`getTenants retrun: ${this.tenants.length} rows`)
  }

  back() {
    this.routeHelper.navigateToComponent(UserMenuComponent)
  }

  curUser() {
    return JSON.stringify(remult.user)
  }

  async volunteersMobiles() {

  }

  async search() {
    let vols = this.tenants.map(t => ({ id: t.id, caption: t.name }))
    // let vols: { caption: string, id: string }[] = [] as { caption: string, id: string }[]
    // let m = this.tenants.map(t => ({ id: t.id, caption: t.name }))
    // vols.push()
    // for (const v of await this.query.getTenants()) {
    //   vols.push({ caption: v.name, id: v.id })
    //   // let found = this.visits.find(u => u.tenant === v.id)
    //   // if (!found) {
    //   //   vols.push({ caption: v.name, id: v.id })
    //   // }
    // }
    let id = ''
    await this.ui.selectValuesDialog({
      title: `חיפוש ${this.group.single}`,
      values: vols,
      onSelect: (v) => { id = v.id }
    })
    if (id?.trim().length) {
      this.edit(id)
    }
  }

  async addTenant() {
    this.routeHelper.navigateToComponent(TenantComponent)
  }

  async edit(id = '') {
    this.routeHelper.navigateToComponent(TenantComponent, { id: id })
  }

  async onFileInput(e: any, t: Tenant) {
    // let branch = 'get.hesed.hod.hasharon'

    // let s3 = new uploader(
      // false,
    //   t.branch,
    //   undefined!,
    //   t)

    // await s3.loadFiles(e.target.files, branch)
  }

  async upload() {

  }

  async import() {
    this.routeHelper.navigateToComponent(TenantsImportComponent)
  }

  async photos() {

  }

  async call(e:any,mobile = '') {
    e?.stopPropagation()
    if (mobile?.trim().length) {
      window.open(`tel:${mobile}`, '_blank')
    }
  }



  async delete(e:any,t: Tenant) {
    e?.stopPropagation()
    let yes = await this.ui.yesNoQuestion(`?להפוך את ${t.name} ללא פעיל`)
    if (yes) {
      t.active = false
      await remult.repo(Tenant).save(t)
      this.tenants = this.tenants.filter(itm => itm.id != t.id)
    }
  }

  rootmenu() {
    this.routeHelper.navigateToComponent(UserMenuComponent)
  }

  async export() {
    await saveToExcel(
      new GridSettings<Tenant>(remult.repo(Tenant),
        {
          // columnSettings: row => [row.name, row.mobile, row.phone],
          where: {
            active: true,
            branch: { $id: remult.user!.branch }
          },
          orderBy: { name: 'asc', address: 'asc' }
        })
      , 'רשימת אברכים כולל ' + remult.user?.branchName,
      this.busy)
  }

  /*
  async saveToExcel() {
    const xlsx = await import('xlsx');
    let wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, xlsx.utils.json_to_sheet(this.events.map(e => {
      const url = remult.context.getOrigin() + `/guest/event/${e.site}/${e.id}/${e.remoteUrl ? "remote" : ""}`
      return ({
        "שם התנדבות": e.name,
        "סוג התנדבות": "פומבי",
        "קטגוריה": "עזרה ומזון לנזקקים",
        "תאור": e.description,
        "תאור עם קישור": "לפרטים והרשמה לחצו " + url + "\n\n" + e.description,
        "שם פרטי איש קשר": e.thePhoneDescription,
        "טלפון איש קשר": e.thePhoneDisplay,
        "חד פעמי/חוזרת": isGeneralEvent(e) ? "חוזרת" : "חד פעמית",
        "תאריך": isGeneralEvent(e) ? "" : e.eventDateJson,
        "משעה": e.startTime,
        "עד שעה": e.endTime,
        "קישור": url
      })
    })));
    xlsx.writeFile(wb, "hagai-events.xlsx");

  }
*/
}
