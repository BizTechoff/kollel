import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { remult } from 'remult';
import { RouteHelperService } from '../../common-ui-elements';
import { firstDateOfWeek, lastDateOfWeek, resetDateTime } from '../../common/dateFunc';
import { UIToolsService } from '../../common/UIToolsService';
import { terms } from '../../terms';
import { UserMenuComponent } from '../../users/user-menu/user-menu.component';
import { Visit } from '../visit';
import { VisitComponent } from '../visit/visit.component';
import { VisitController } from '../visitController';
import { VisitsFinishedBlessingComponent } from '../visits-finished-blessing/visits-finished-blessing.component';
import { VisitStatus } from '../visitStatus';

@Component({
  selector: 'app-visits-readonly',
  templateUrl: './visits-readonly.component.html',
  styleUrls: ['./visits-readonly.component.scss']
})
export class VisitsReadonlyComponent implements OnInit {

  args: {
    branch: string,
    name: string
  } = { branch: '',name: '' }

  visits = [] as Visit[]
  query = new VisitController()

  constructor(
    private routeHelper: RouteHelperService,
    private ui: UIToolsService,
    private dialogRef: MatDialogRef<any>) {
  }
  terms = terms;
  remult = remult;

  async ngOnInit(): Promise<void> {
    if (!this.args) {
      this.args = { branch: '',name: '' }
    }
    // remult.user!.lastComponent = VisitsReadonlyComponent.name
    // await this.jobs.getLastWeeklyVisitsRun()
    // let date = this.jobs.lastJobRun
    // console.log('this.jobs.lastJobRun', this.jobs.lastJobRun)
    if (this.args?.branch?.trim().length) {
      let today = resetDateTime(new Date())
      this.query.fdate = firstDateOfWeek(today)
      this.query.tdate = lastDateOfWeek(today)
      this.visits = await this.query.getVisitsReadOnly(this.args.branch)
    }
  }

  isNone(v: Visit) {
    return v?.status?.id === VisitStatus.none.id
  }

  isDelivered(v: Visit) {
    return v?.status?.id === VisitStatus.delivered.id
  }

  isVisited(v: Visit) {
    return v?.status?.id === VisitStatus.visited.id
  }

  curUser() {
    return JSON.stringify(remult.user)
  }

  back() {
    this.dialogRef.close()
  }

  async search() {
    let vols = this.visits.map(v => ({ id: v.id, caption: v.tenant.name }))
    let id = ''
    await this.ui.selectValuesDialog({
      allowAdd: false,
      title: 'חיפוש דיווח לפי דייר',
      values: vols,
      onSelect: (v) => { id = v.id }
    })
    if (id?.trim().length) {
      this.edit(id)
    }
  }

  async searchAddress() {
    let vols = this.visits.map(v => ({ id: v.id, caption: v.tenant.address }))
    let id = ''
    await this.ui.selectValuesDialog({
      allowAdd: false,
      title: 'חיפוש דיווח לפי כתובת',
      values: vols,
      onSelect: (v) => { id = v.id }
    })
    if (id?.trim().length) {
      this.edit(id)
    }
  }

  async finished() {
    let count = await this.query.getOpenVisitsCount()
    if (count > 0) {
      let yes = await this.ui.yesNoQuestion(`עדיין נותרו דיווחים פתוחים,\nלהמשיך בכל זאת`)
      if (yes) {
        this.routeHelper.navigateToComponent(VisitsFinishedBlessingComponent)
      }
    }
    else {
      this.routeHelper.navigateToComponent(VisitsFinishedBlessingComponent)
    }
  }

  async addTenant() {
    this.routeHelper.navigateToComponent(VisitComponent)
  }

  async edit(id = '') {
    this.routeHelper.navigateToComponent(VisitComponent, { id: id })
  }

  async addVisit() {
    this.routeHelper.navigateToComponent(VisitComponent)
  }

  rootmenu() {
    this.back()
  }

}
