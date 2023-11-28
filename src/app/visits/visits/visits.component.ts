import { Component, OnInit } from '@angular/core';
import { remult } from 'remult';
import { RouteHelperService } from '../../common-ui-elements';
import { UIToolsService } from '../../common/UIToolsService';
import { addDaysToDate, firstDateOfWeek, lastDateOfWeek, resetDateTime } from '../../common/dateFunc';
import { JobController } from '../../jobs/jobController';
import { NewsController } from '../../news/newsController';
import { terms } from '../../terms';
import { UserMenuComponent } from '../../users/user-menu/user-menu.component';
import { Visit } from '../visit';
import { VisitComponent } from '../visit/visit.component';
import { VisitController } from '../visitController';
import { VisitStatus } from '../visitStatus';
import { VisitsFinishedBlessingComponent } from '../visits-finished-blessing/visits-finished-blessing.component';

@Component({
  selector: 'app-visits',
  templateUrl: './visits.component.html',
  styleUrls: ['./visits.component.scss']
})
export class VisitsComponent implements OnInit {

  visits = [] as Visit[]
  query = new VisitController()
  jobs = new JobController()
  weeklyQuestion = ''

  constructor(
    private routeHelper: RouteHelperService,
    private ui: UIToolsService) {
  }
  terms = terms;
  remult = remult;

  async ngOnInit(): Promise<void> {

    remult.user!.lastComponent = VisitsComponent.name
    // await this.jobs.getLastWeeklyVisitsRun()
    // let date = this.jobs.lastJobRun
    // console.log('this.jobs.lastJobRun', this.jobs.lastJobRun)
    let today = addDaysToDate(resetDateTime(new Date()))//, -7*2)
    this.query.fdate = firstDateOfWeek(today)
    this.query.tdate = lastDateOfWeek(today)
    this.visits = await this.query.getVisits()

    let news = new NewsController()
    let content = (await news.getWeeklyQuestion())?.content
    if (content?.trim().length) { }
    else {
      content = 'אין'
    }
    content = content.trim()
    this.weeklyQuestion = content
    // this.weeklyQuestion = 'היי בוקר טוב יש למלא את כל הטפסים ששלחנו לכם כל אחד לפי הצוות שלו ולעדכן חזרה את הראש כולל לא לשכוח זאת תודה ופסח כשר ושמח'
    // this.weeklyQuestion += this.weeklyQuestion 
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
    this.routeHelper.navigateToComponent(UserMenuComponent)
  }

  async call(e: any, mobile = '') {
    e?.stopPropagation()
    if (mobile?.trim().length) {
      window.open(`tel:${mobile}`, '_blank')
    }
  }

  async search() {
    let vols = this.visits.map(v => ({ id: v.id, caption: v.tenant.name }))
    let id = ''
    await this.ui.selectValuesDialog({
      allowAdd: false,
      title: `חיפוש דיווח לפי ${this.query.group.single}`,
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
    this.routeHelper.navigateToComponent(UserMenuComponent)
  }

  async visited(visit: Visit) {
    if (visit) {
      console.log(visit.status, VisitStatus.visited,visit.status === VisitStatus.visited )
      if (this.isVisited(visit)) {
        visit.status = VisitStatus.none
        visit.statusModified = undefined!
      }
      else {
        visit.status = VisitStatus.visited
        visit.statusModified = new Date()
      }
      await remult.repo(Visit).save(visit)
    }
  }

  async delivered(visit: Visit) {
    if (visit) {
      if (this.isDelivered(visit)) {
        visit.status = VisitStatus.none
      }
      else {
        visit.status = VisitStatus.delivered
      }
      await remult.repo(Visit).save(visit)
    }
  }

}
