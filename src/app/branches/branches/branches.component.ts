import { Component, OnInit } from '@angular/core';
import { remult } from 'remult';
import { RouteHelperService } from '../../common-ui-elements';
import { UIToolsService } from '../../common/UIToolsService';
import { terms } from '../../terms';
import { UserMenuComponent } from '../../users/user-menu/user-menu.component';
import { Branch } from '../branch';
import { BranchComponent } from '../branch/branch.component';
import { BranchController } from '../branchController';
import { BranchGroup } from '../branchGroup';

@Component({
  selector: 'app-branches',
  templateUrl: './branches.component.html',
  styleUrls: ['./branches.component.scss']
})
export class BranchesComponent implements OnInit {

  branches = [] as Branch[]
  query = new BranchController()
  totals = { tenants: 0 }//, volunteers: 0 }

  constructor(
    private routeHelper: RouteHelperService,
    private ui: UIToolsService) { }
  terms = terms;
  remult = remult;
  BranchGroup = BranchGroup;

  async ngOnInit(): Promise<void> {
    remult.user!.lastComponent = BranchesComponent.name
    this.query.group = BranchGroup.fromId(remult.user!.group)
    await this.retrieve()
  }

  clear() {
    this.branches.splice(0)
    this.totals.tenants = 0
    // this.totals.volunteers = 0
  }

  async retrieve() {
    this.clear();

    this.branches = await this.query.getBranches(true)
    this.totals.tenants = this.branches.reduce(
      (sum, current) => sum + current.tenantsCount, 0);
    // this.totals.volunteers = this.branches.reduce(
    //   (sum, current) => sum + current.volunteersCount, 0);

    // .filter(item => item.tax === '25.00')

  }

  async groupChanged() {
    let group = BranchGroup.fromId(remult.user!.group)
    if (group) {
      if (group !== this.query.group) {
        console.log(`BranchesComponent.groupChanged: { from: ${this.query.group.id}, to: ${group.id} }`)
        this.query.group = group
        await this.retrieve()
      }
    }
  }

  back() {
    this.routeHelper.navigateToComponent(UserMenuComponent)
  }

  async search() {
    let vols: { caption: string, id: string }[] = [] as { caption: string, id: string }[]
    for (const v of this.branches) {
      vols.push({ caption: v.name, id: v.id })
      // let found = this.visits.find(u => u.tenant === v.id)
      // if (!found) {
      //   vols.push({ caption: v.name, id: v.id })
      // }
    }
    let id = ''
    let caption = ''
    await this.ui.selectValuesDialog({
      title: 'חיפוש כולל',
      values: vols,
      onSelect: (v) => { id = v.id; caption = v.caption }
    })
    if (id?.trim().length) {
      this.edit(id)
    }
  }

  async addBranch() {
    this.routeHelper.navigateToComponent(BranchComponent)
  }

  async edit(id = '') {
    this.routeHelper.navigateToComponent(BranchComponent, { id: id })
  }

  async delete(e:any, u: Branch) {
    e?.stopPropagation()
    let yes = await this.ui.yesNoQuestion(`?להפוך את ${u.name} ללא פעיל`)
    if (yes) {
      u.active = false
      await remult.repo(Branch).save(u)
      this.branches = this.branches.filter(itm => itm.id != u.id)
    }
  }

  rootmenu() {
    this.routeHelper.navigateToComponent(UserMenuComponent)
  }

}
