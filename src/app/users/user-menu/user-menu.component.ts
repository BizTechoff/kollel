import { Component, OnInit } from '@angular/core';
import { remult } from 'remult';
import { BranchGroup } from '../../branches/branchGroup';
import { BranchesComponent } from '../../branches/branches/branches.component';
import { RouteHelperService } from '../../common-ui-elements';
import { HomeComponent } from '../../home/home.component';
import { AlbumComponent } from '../../media/album/album.component';
import { NewsWeeklyQuestionComponent } from '../../news/news-weekly-question/news-weekly-question.component';
import { NewsesComponent } from '../../news/newses/newses.component';
import { TenantsImportComponent } from '../../tenants/tenants-import/tenants-import.component';
import { TenantsComponent } from '../../tenants/tenants/tenants.component';
import { terms } from '../../terms';
import { VisitsChartComponent } from '../../visits/visits-chart/visits-chart.component';
import { VisitsExportComponent } from '../../visits/visits-export/visits-export.component';
import { VisitsFinishedMessagesComponent } from '../../visits/visits-finished-messages/visits-finished-messages.component';
import { SignInController } from '../SignInController';
import { ManagersComponent } from '../managers/managers.component';
import { UserMenu2Component } from '../user-menu2/user-menu2.component';
import { VolunteersComponent } from '../volunteers/volunteers.component';
import { VisitsComponent } from '../../visits/visits/visits.component';

@Component({
  selector: 'app-user-menu',
  templateUrl: './user-menu.component.html',
  styleUrls: ['./user-menu.component.scss']
})
export class UserMenuComponent implements OnInit {

  group!: BranchGroup
  constructor(
    private routeHelper: RouteHelperService) {
  }
  terms = terms;
  remult = remult;

  async ngOnInit(): Promise<void> {
    this.group = BranchGroup.fromId(remult.user!.group)
    // await this.groupChanged()
  }

  async logout() {
    SignInController.signOut();
    remult.user = undefined;
    this.routeHelper.navigateToComponent(HomeComponent)
  }

  openBizTechoff(){
    window?.open('https://biztechoff.co.il', '_blank')
  }

  // async groupChanged() {
  //   this.group = BranchGroup.fromId(remult.user!.group)
  //   if (this.group) {
  //     remult.user!.group = this.group.id
  //   }
  // }

  async visits() {
    this.routeHelper.navigateToComponent(VisitsComponent);//VisitsFinishedMessagesComponent)
  }

  async tenants() {
    this.routeHelper.navigateToComponent(TenantsComponent)
  }

  async volunteers() {
    this.routeHelper.navigateToComponent(VolunteersComponent)
  }

  async chart() {
    this.routeHelper.navigateToComponent(VisitsChartComponent)
  }

  async managers() {
    this.routeHelper.navigateToComponent(ManagersComponent)
  }

  async branches() {
    this.routeHelper.navigateToComponent(BranchesComponent)
  }

  async news() {
    this.routeHelper.navigateToComponent(NewsesComponent)
  }

  async weeklyQuestion() {
    this.routeHelper.navigateToComponent(NewsWeeklyQuestionComponent)
  }

  async rootmenu() {
    this.routeHelper.navigateToComponent(UserMenuComponent)
  }

  async test() {
    this.routeHelper.navigateToComponent(UserMenu2Component)
  }

  async album() {
    this.routeHelper.navigateToComponent(AlbumComponent)
  }

  async export() {
    this.routeHelper.navigateToComponent(VisitsExportComponent)
  }

  async import() {
    this.routeHelper.navigateToComponent(TenantsImportComponent)
  }

}
