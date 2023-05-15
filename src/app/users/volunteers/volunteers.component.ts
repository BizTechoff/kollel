import { Component, OnInit } from '@angular/core';
import { remult } from 'remult';
import { BusyService, RouteHelperService } from '../../common-ui-elements';
import { GridSettings } from '../../common-ui-elements/interfaces';
import { saveToExcel } from '../../common-ui-elements/interfaces/src/saveGridToExcel';
import { UIToolsService } from '../../common/UIToolsService';
import { terms } from '../../terms';
import { User } from '../user';
import { UserMenuComponent } from '../user-menu/user-menu.component';
import { UserBranch } from '../userBranch';
import { UserController } from '../userController';
import { VolunteerComponent } from '../volunteer/volunteer.component';

@Component({
  selector: 'app-volunteers',
  templateUrl: './volunteers.component.html',
  styleUrls: ['./volunteers.component.scss']
})
export class VolunteersComponent implements OnInit {

  volunteers = [] as User[]
  query = new UserController()

  constructor(
    private routeHelper: RouteHelperService,
    private ui: UIToolsService,
    private busy: BusyService) {
  }
  terms = terms;
  remult = remult;

  async ngOnInit(): Promise<void> {
    remult.user!.lastComponent = VolunteersComponent.name
    //console.log('TenantsComponent.ngOnInit')
    this.volunteers = await this.query.getVoulnteers()
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
    let vols = this.volunteers.map(v => ({ id: v.id, caption: v.name }))
    let id = ''
    await this.ui.selectValuesDialog({
      allowAdd: false,
      title: 'חיפוש מתנדב',
      values: vols,
      onSelect: (v) => { id = v.id },
      onAdd: (v) => {
        this.routeHelper.navigateToComponent(
          VolunteerComponent,
          {
            name: v.caption,
            callback: 'volunteers'
          })
      }
    })
    if (id?.trim().length) {
      this.edit(id)
    }
  }

  async addVolunteer() {
    this.routeHelper.navigateToComponent(VolunteerComponent)
  }

  async edit(id = '') {
    this.routeHelper.navigateToComponent(VolunteerComponent, { id: id })
  }

  async onFileInput(e: any, u: User) {
    let branch = 'get.hesed.hod.hasharon'

    // let b = await remult.repo(UserBranch).findFirst({user: u})
    // let s3 = new uploader(
      // false,
    //   b.branch,
    //   undefined!,
    //   u)

    // await s3.loadFiles(e.target.files, branch)
  }

  async upload() {

  }

  async call(mobile = '') {
    if (mobile?.trim().length) {
      window.open(`tel:${mobile}`, '_blank')
    }
  }

  async photos() {

  }

  async delete(u: User) {
    let yes = await this.ui.yesNoQuestion(`?להפוך את ${u.name} ללא פעיל`)
    if (yes) {
      u.active = false
      await remult.repo(User).save(u)
      this.volunteers = this.volunteers.filter(itm => itm.id != u.id)
    }
  }

  rootmenu() {
    this.routeHelper.navigateToComponent(UserMenuComponent)
  }

  async export() {
    await saveToExcel(
      new GridSettings<User>(remult.repo(User),
        {
          where: {
            active: true,
            volunteer: true,
            id: (await remult.repo(UserBranch).find({ where: { branch: { $id: remult.user?.id! } } }))
              .map(ub => ub.branch.id)
          }
        })
      , 'רשימת מתנדבים כולל ' + remult.user?.branchName,
      this.busy)
  }

}
