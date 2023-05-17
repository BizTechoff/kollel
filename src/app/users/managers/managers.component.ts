import { Component, OnInit } from '@angular/core';
import { remult } from 'remult';
import { BranchGroup } from '../../branches/branchGroup';
import { RouteHelperService } from '../../common-ui-elements';
import { UIToolsService } from '../../common/UIToolsService';
import { terms } from '../../terms';
import { ManagerComponent } from '../manager/manager.component';
import { User } from '../user';
import { UserMenuComponent } from '../user-menu/user-menu.component';
import { UserController } from '../userController';

@Component({
  selector: 'app-managers',
  templateUrl: './managers.component.html',
  styleUrls: ['./managers.component.scss']
})
export class ManagersComponent implements OnInit {

  managers = [] as User[]
  query = new UserController()

  constructor(
    private routeHelper: RouteHelperService,
    private ui: UIToolsService) { }
  terms = terms;
  remult = remult;

  async ngOnInit(): Promise<void> {
    remult.user!.lastComponent = ManagersComponent.name
    this.query.group = BranchGroup.fromId(remult.user!.group)
    await this.retrieve()
  }

  async retrieve() {
    this.managers = await this.query.getManagers()
  }

  async groupChanged() {
    let group = BranchGroup.fromId(remult.user!.group)
    if (group) {
      console.log(`ManagersComponent.groupChanged: { this.query.group: ${this.query.group.id}, group: ${group.id}`)
      if (group !== this.query.group) {
        this.query.group = group
        await this.retrieve()
      }
    }
  }

  back() {
    this.routeHelper.navigateToComponent(UserMenuComponent)
  }

  async search() {
    let vols = this.managers.map(m => ({ id: m.id, caption: m.name }))
    let id = ''
    await this.ui.selectValuesDialog({
      title: 'חיפוש ראש כולל',
      values: vols,
      onSelect: (v) => { id = v.id }
    })
    if (id?.trim().length) {
      this.edit(id)
    }
  }

  async addManager() {
    this.routeHelper.navigateToComponent(ManagerComponent)
  }

  async edit(id = '') {
    this.routeHelper.navigateToComponent(ManagerComponent, { id: id })
  }

  async delete(e:any, u: User) {
    e?.stopPropagation()
    let yes = await this.ui.yesNoQuestion(`?להפוך את ${u.name} ללא פעיל`)
    if (yes) {
      u.active = false
      await remult.repo(User).save(u)
      this.managers = this.managers.filter(itm => itm.id != u.id)
    }
  }

  rootmenu() {
    this.routeHelper.navigateToComponent(UserMenuComponent)
  }

  async call(e:any, mobile = '') {
    e?.stopPropagation()
    if (mobile?.trim().length) {
      window.open(`tel:${mobile}`, '_blank')
    }
  }

}
