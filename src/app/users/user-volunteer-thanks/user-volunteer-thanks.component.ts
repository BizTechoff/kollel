import { Component, OnInit } from '@angular/core';
import { remult } from 'remult';
import { RouteHelperService } from '../../common-ui-elements';
import { terms } from '../../terms';
import { VisitsFinishedMessagesComponent } from '../../visits/visits-finished-messages/visits-finished-messages.component';
import { VisitsComponent } from '../../visits/visits/visits.component';
import { UserMenuComponent } from '../user-menu/user-menu.component';

@Component({
  selector: 'app-user-volunteer-thanks',
  templateUrl: './user-volunteer-thanks.component.html',
  styleUrls: ['./user-volunteer-thanks.component.scss']
})
export class UserVolunteerThanksComponent implements OnInit {


  constructor(
    private routeHelper: RouteHelperService) {
  }
  terms = terms;
  remult = remult;

  ngOnInit(): void {
  }
 
  async thanks() {
    this.routeHelper.navigateToComponent(VisitsFinishedMessagesComponent)
  }

  back() {
    this.routeHelper.navigateToComponent(VisitsComponent)
  }

  rootmenu() {
    this.routeHelper.navigateToComponent(UserMenuComponent)
  }

}
