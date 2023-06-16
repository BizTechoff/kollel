import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { remult } from 'remult';
import { RouteHelperService } from '../../common-ui-elements';
import { UIToolsService } from '../../common/UIToolsService';
import { terms } from '../../terms';
import { UserMenuComponent } from '../../users/user-menu/user-menu.component';
import { Branch } from '../branch';
import { BranchGroup } from '../branchGroup';
import { BranchesComponent } from '../branches/branches.component';

@Component({
  selector: 'app-branch',
  templateUrl: './branch.component.html',
  styleUrls: ['./branch.component.scss']
})
export class BranchComponent implements OnInit {

  branch!: Branch
  title = ''
  constructor(
    private routeHelper: RouteHelperService,
    private route: ActivatedRoute,
    private ui: UIToolsService) {
  }
  terms = terms;
  remult = remult;
  BranchGroup = BranchGroup

  async ngOnInit(): Promise<void> {
    remult.user!.lastComponent = BranchComponent.name

    let id = this.route.snapshot.paramMap.get('id') ?? '';
    if (id?.trim().length) {
      this.title = 'עדכון כולל'
      this.branch = await remult.repo(Branch).findId(id)
    }
    else {
      this.title = 'הוספת כולל חדש'
      this.branch = remult.repo(Branch).create()
      this.branch.group = BranchGroup.fromId(remult.user!.group)
    }
  }

  async save() {
    await this.branch.save()
    this.back()
  }

  back() {
    this.routeHelper.navigateToComponent(BranchesComponent)
  }

  rootmenu() {
    this.routeHelper.navigateToComponent(UserMenuComponent)
  }

}
