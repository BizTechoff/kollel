import { Component, OnInit } from '@angular/core';
import { remult } from 'remult';
import { AppController } from '../appController';
import { RouteHelperService } from '../common-ui-elements';
import { UIToolsService } from '../common/UIToolsService';
import { terms } from '../terms';
import { SignInController } from '../users/SignInController';
import { UserMenuComponent } from '../users/user-menu/user-menu.component';
import { UserValidationComponent } from '../users/user-validation/user-validation.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  signer = new SignInController();

  constructor(
    private routeHelper: RouteHelperService,
    private ui: UIToolsService) {
  }
  terms = terms;
  remult = remult;

  ngOnInit(): void {
  }

  async signIn() {

    // let u = await remult.repo(User).findFirst({ mobile: this.signer.mobile, active: true }, { useCache: false });
    // if(u && u.admin && u.manager){
    //   let yes = await this.ui.yesNoQuestion(`כן - כניסה כאדמין\nלא - כניסה כראש כולל`)
    // }
    try {
      let isDevMode = false
      try { isDevMode = await (new AppController()).isDevMode() }
      catch (err) { console.error(`isDevMode error: ${err}`) }
      if (isDevMode && false) {
        let res = await this.signer.sendValidationCode()
        if (res.special) {

        }
        if (res.success) {
          this.routeHelper.navigateToComponent(UserValidationComponent, { mobile: this.signer.mobile })
        }
        else {
          this.ui.info(res.error)
        }
      }
      else {
        let res = await this.signer.signIn()
        if (res.success) {
          remult.user = res.userInfo
          this.routeHelper.navigateToComponent(UserMenuComponent)
        }
        else {
          this.ui.info(res.error)
        }
      }
    }
    catch (err) {
      console.info(`AppController.error: ${JSON.stringify(err)}`)
    }

  }

  isNumberKey(evt: any) {
    // //console.log('evt', evt)
    var charCode = (evt.which) ? evt.which : evt.keyCode
    return !(charCode > 31 && (charCode < 48 || charCode > 57));
  }

}
