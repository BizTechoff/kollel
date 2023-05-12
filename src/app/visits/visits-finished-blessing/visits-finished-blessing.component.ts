import { Component, OnInit } from '@angular/core';
import { remult } from 'remult';
import { RouteHelperService } from '../../common-ui-elements';
import { terms } from '../../terms';
import { UserMenuComponent } from '../../users/user-menu/user-menu.component';
import { VisitsFinishedMessagesComponent } from '../visits-finished-messages/visits-finished-messages.component';
import { VisitsFinishedSummaryComponent } from '../visits-finished-summary/visits-finished-summary.component';
import { VisitsComponent } from '../visits/visits.component';

@Component({
  selector: 'app-visits-finished-blessing',
  templateUrl: './visits-finished-blessing.component.html',
  styleUrls: ['./visits-finished-blessing.component.scss']
})
export class VisitsFinishedBlessingComponent implements OnInit {


  constructor(
    private routeHelper: RouteHelperService) {
  }
  terms = terms;
  remult = remult;

  ngOnInit(): void {
  }
 
  async thanks() {
    this.routeHelper.navigateToComponent(VisitsFinishedSummaryComponent)
  }

  back() {
    this.routeHelper.navigateToComponent(VisitsComponent)
  }

  rootmenu() {
    this.routeHelper.navigateToComponent(UserMenuComponent)
  }

}
