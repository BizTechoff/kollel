import { Component, OnInit } from '@angular/core';
import { remult } from 'remult';
import { BranchGroup } from '../../branches/branchGroup';
import { RouteHelperService } from '../../common-ui-elements';
import { dateFormat, firstDateOfWeek, lastDateOfWeek, resetDateTime } from '../../common/dateFunc';
import { UIToolsService } from '../../common/UIToolsService';
import { terms } from '../../terms';
import { UserMenuComponent } from '../../users/user-menu/user-menu.component';
import { News } from '../news';
import { NewsComponent } from '../news/news.component';
import { NewsController } from '../newsController';

@Component({
  selector: 'app-newses',
  templateUrl: './newses.component.html',
  styleUrls: ['./newses.component.scss']
})
export class NewsesComponent implements OnInit {

  newses = [] as News[]
  query = new NewsController()

  constructor(
    private routeHelper: RouteHelperService,
    private ui: UIToolsService) {
  }
  terms = terms;
  remult = remult;

  async ngOnInit(): Promise<void> {
    remult.user!.lastComponent = NewsesComponent.name
    let date = resetDateTime(new Date())
    this.query.fdate = firstDateOfWeek(date)
    this.query.tdate = lastDateOfWeek(date)
    this.query.group = BranchGroup.fromId(remult.user!.group)
    await this.retrieve()
  }

  async retrieve() {
    this.newses = await this.query.getNewses()
  }

  async groupChanged() {
    let group = BranchGroup.fromId(remult.user!.group)
    if (group) {
      console.log(`NewsesComponent.groupChanged: { this.query.group: ${this.query.group.id}, group: ${group.id}`)
      if (group !== this.query.group) {
        this.query.group = group
        await this.retrieve()
      }
    }
  }

  back() {
    this.routeHelper.navigateToComponent(UserMenuComponent)
  }

  curNews() {
    return JSON.stringify(remult.user)
  }

  async volunteersMobiles() {

  }

  async search() {
    // let vols: { caption: string, id: string }[] = [] as { caption: string, id: string }[]
    // let uc = new NewsController()
    // for (const v of await uc.getVoulnteers()) {
    //   vols.push({ caption: v.name, id: v.id })
    //   // let found = this.visits.find(u => u.tenant === v.id)
    //   // if (!found) {
    //   //   vols.push({ caption: v.name, id: v.id })
    //   // }
    // }
    let vols = this.newses.map(v => ({ id: v.id, caption: v.subject }))
    let id = ''
    // let caption = ''
    await this.ui.selectValuesDialog({
      title: 'חיפוש נושא',
      values: vols,
      onSelect: (v) => { id = v.id }
    })
    if (id?.trim().length) {
      this.edit(id)
    }
  }

  async addVolunteer() {
    this.routeHelper.navigateToComponent(NewsComponent)
  }

  async edit(id = '') {
    this.routeHelper.navigateToComponent(NewsComponent, { id: id })
  }

  async onFileInput(e: any, u: News) {
    let branch = 'get.hesed.hod.hasharon'

    // let b = await remult.repo(NewsBranch).findFirst({News: u})
    // let s3 = new uploader(
      // false,
    //   b.branch,
    //   undefined!,
    //   u)

    // await s3.loadFiles(e.target.files, branch)
  }

  async upload() {

  }

  async photos() {

  }

  async delete(n: News) {
    let yes = await this.ui.yesNoQuestion(`?להפוך את ${n.subject} ללא פעיל`)
    if (yes) {
      n.active = false
      await remult.repo(News).save(n)
      this.newses = this.newses.filter(itm => itm.id != n.id)
    }
  }

  rootmenu() {
    this.routeHelper.navigateToComponent(UserMenuComponent)
  }

}
