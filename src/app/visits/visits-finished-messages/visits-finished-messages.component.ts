import { Component, OnInit } from '@angular/core';
import { remult } from 'remult';
import { RouteHelperService } from '../../common-ui-elements';
import { firstDateOfWeek, lastDateOfWeek, resetDateTime } from '../../common/dateFunc';
import { News } from '../../news/news';
import { NewsController } from '../../news/newsController';
import { NewsUser } from '../../news/newsUser';
import { terms } from '../../terms';
import { User } from '../../users/user';
import { UserMenuComponent } from '../../users/user-menu/user-menu.component';
import { VisitsFinishedBlessingComponent } from '../visits-finished-blessing/visits-finished-blessing.component';
import { VisitsFinishedSummaryComponent } from '../visits-finished-summary/visits-finished-summary.component';
import { VisitsComponent } from '../visits/visits.component';

@Component({
  selector: 'app-visits-finished-messages',
  templateUrl: './visits-finished-messages.component.html',
  styleUrls: ['./visits-finished-messages.component.scss']
})
export class VisitsFinishedMessagesComponent implements OnInit {

  news = [] as News[]
  curIndex = -1
  message = `..מחפש הודעות`
  feedback = this.message
  subject = ''
  query = new NewsController()

  constructor(
    private routeHelper: RouteHelperService) {
  }
  terms = terms;
  remult = remult

  async ngOnInit(): Promise<void> {
    let date = resetDateTime(new Date())
    this.query.fdate = firstDateOfWeek(date)
    this.query.tdate = lastDateOfWeek(date)
    this.news = await this.query.getWeeklyNews()
    // console.log(`found ${this.news.length} weekly news`)
    await this.saw()
  }

  async setMessageAndFeedback(news1: News) {
    this.message = ''
    this.feedback = ''
    if (news1) {
      this.subject = news1.subject?.trim() || ''
      this.message = news1.content?.trim() || ''
      // 
      let un = await this.query.getNewsUser(news1.id)
      if (un) {
        // //console.log(5552)
        this.feedback = un.feedback?.trim() || ''
        //console.log('news1.content',news1.content,'un.feedback',un.feedback)
      }
      //console.log(666)
    }
  }

  async saw() {
    //console.log(1)
    if (this.curIndex > -1 && this.news.length && this.curIndex < this.news.length) {//user pressed
      // update seen date 
      // console.log(this.curIndex, this.news[this.curIndex].id)
      let un = await this.query.getNewsUser(
        this.news[this.curIndex].id)
      if (!un) {
        un = remult.repo(NewsUser).create()
        un.news = this.news[this.curIndex]
        un.manager = await remult.repo(User).findId(remult.user?.id!)
      }
      un.feedback = this.feedback?.trim() || ''
      un.seen = new Date()
      await remult.repo(NewsUser).save(un)
      //console.log(3)
    }
    //console.log(4)
    if (this.curIndex < this.news.length - 1) {
      //console.log(5)
      ++this.curIndex
      await this.setMessageAndFeedback(this.news[this.curIndex])
      //console.log(6)
    }
    else {
      //console.log(7)
    this.routeHelper.navigateToComponent(VisitsComponent)
      // this.routeHelper.navigateToComponent(VisitsFinishedSummaryComponent)
    }
  }

  back() {
    this.routeHelper.navigateToComponent(VisitsFinishedBlessingComponent)
  }

  rootmenu() {
    this.routeHelper.navigateToComponent(UserMenuComponent)
  }

}
