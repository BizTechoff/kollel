import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { ActivatedRoute, Route, Router } from '@angular/router';

import { openDialog, RouteHelperService } from 'common-ui-elements';
import { remult } from 'remult';
import screenfull from 'screenfull';
import { AppController } from './appController';
import { DataAreaDialogComponent } from './common/data-area-dialog/data-area-dialog.component';
import { UIToolsService } from './common/UIToolsService';
import { HomeComponent } from './home/home.component';
import { terms } from './terms';
import { SignInController } from './users/SignInController';
import { User } from './users/user';
import { UserMenuComponent } from './users/user-menu/user-menu.component';
import { UserVolunteerThanksComponent } from './users/user-volunteer-thanks/user-volunteer-thanks.component';
import { VisitsExportComponent } from './visits/visits-export/visits-export.component';
import { VisitsFinishedMessagesComponent } from './visits/visits-finished-messages/visits-finished-messages.component';
import { BranchesComponent } from './branches/branches/branches.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  constructor(
    public router: Router,
    public activeRoute: ActivatedRoute,
    private routeHelper: RouteHelperService,
    public uiService: UIToolsService) {
  }
  terms = terms;
  remult = remult;
  screenfull = screenfull
  // BranchGroup = BranchGroup

  // @Output() groupChangedHandler: EventEmitter = new EventEmitter()

  showRemultUser(e: MouseEvent) {
    try {
      if (e.ctrlKey) { alert(JSON.stringify(this.remult.user)) }
    }
    catch (err) { console.error(err) }
  }

  // async groupChanged(group: BranchGroup) {
  //   console.log(group)
  //   this.groupChangedHandler.emit()
  // }

  async signIn() {
    // const signIn = new SignInController();
    // openDialog(DataAreaDialogComponent, i => i.args = {
    //   title: terms.signIn,
    //   object: signIn,
    //   ok: async () => {
    //     remult.user = await signIn.signIn();
    //   }
    // });
  }
  ngOnDestroy(): void {
    //console.log('ngOnDestroy')
    // screenfull.off('change',this.toggleFullscreen)
    // screenfull.off('change', () => //console.log('screenfull.isFullscreen', screenfull.isFullscreen))
  }

  async ngOnInit() {
    // if (remult.user) {
    //   remult.user!.group = BranchGroup.noar.id
    // }
    //this.signOut()
    // try {
    //   if (screenfull.isEnabled) {
    //     //console.log('screenfull.isEnabled', screenfull.isEnabled)
    //     screenfull.request()
    //     //console.log('screenfull.requested')
    //   }
    // } catch (err) {
    //   //console.log(err)
    // }
    // this.routeHelper.navigateToComponent(VisitsComponent);

    //console.log('ngOnInit')
    // screenfull.on('change',this.toggleFullscreen)
    // console.log('Helloaaa')
    let isDevMode = await (new AppController()).isDevMode()
    if (isDevMode) {
      // console.log('Helloaaa 1')
      this.routeHelper.navigateToComponent(BranchesComponent)
    } else {
      // console.log('Helloaaa 2')
      // alert(JSON.stringify(remult?.user))
      if (remult?.authenticated()) {
        // console.log('Helloaaa 3')
        //console.log('signed in')
        // remult.user!.lastComponent = 'visit'
        if (remult.user?.lastComponent?.trim().length) {
          // console.log('Helloaaa 5')
          // let comp = Object.create(remult.user.lastComponent) //eval(`new ${remult.user.lastComponent}()`)
          var comp = remult.user!.lastComponent// new (<any>window)[remult.user!.lastComponent]();
          // Object.create(window[comp].prototype)
          this.router.navigate(['/' + remult.user!.lastComponent])
          // this.routeHelper.navigateToComponent(comp)
        }
        else if (remult.user?.isVolunteer) {
          // console.log('Helloaaa 6')
          this.routeHelper.navigateToComponent(UserVolunteerThanksComponent)//VisitComponent, { id: '1ca8bd94-b277-479b-bb41-30d45a5a65d6' });
        }
        else {
          // console.log('Helloaaa 7')
          this.routeHelper.navigateToComponent(UserMenuComponent)//VisitComponent, { id: '1ca8bd94-b277-479b-bb41-30d45a5a65d6' });
        }
      }
      else {
        // console.log('Helloaaa 4')
        if (!this.router?.url?.includes('register')) {
          this.routeHelper.navigateToComponent(HomeComponent)
        }
        //console.log('NOT signed in')
      }
    }
  }
  // activator<T extends IActivatable>(type: { new(): T; }): T {
  //   return new type();
  // }

  toggleFullscreen() {
    //console.log('toggleFullscreen')
    try {
      if (screenfull.isEnabled) {
        if (screenfull.isFullscreen) {
          screenfull.exit()
        }
        else {
          screenfull.request()
        }
        // //console.log('screenfull().isEnabled', screenfull.isEnabled)
        // screenfull.request()
        // //console.log('screenfull().requested')
      }
    } catch (err) {
      console.error(err)
    }
  }

  signOut() {
    SignInController.signOut();
    remult.user = undefined;
    this.routeHelper.navigateToComponent(HomeComponent);
  }

  async updateInfo() {
    let user = await remult.repo(User).findId(remult.user!.id);
    openDialog(DataAreaDialogComponent, i => i.args = {
      title: terms.updateInfo,
      fields: [
        user.$.name
      ],
      ok: async () => {
        await user._.save();
      }
    });
  }

  // routeName(route: Route) {
  //   let name = route.path;
  //   if (route.data && route.data['name'])
  //     name = route.data['name'];
  //   return name;
  // }

  currentTitle() {
    if (this.activeRoute!.snapshot && this.activeRoute!.firstChild)
      if (this.activeRoute.snapshot.firstChild!.data!['name']) {
        return this.activeRoute.snapshot.firstChild!.data['name'];
      }
      else {
        if (this.activeRoute.firstChild.routeConfig)
          return this.activeRoute.firstChild.routeConfig.path;
      }
    return 'kollel';
  }

  shouldDisplayRoute(route: Route) {
    if (!(route.path && route.path.indexOf(':') < 0 && route.path.indexOf('**') < 0))
      return false;
    return this.routeHelper.canNavigateToRoute(route);
  }

  //@ts-ignore ignoring this to match angular 7 and 8
  @ViewChild('sidenav') sidenav: MatSidenav;
  routeClicked() {
    if (this.uiService.isScreenSmall())
      this.sidenav.close();
  }

}
