import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { remult } from 'remult';
import { RouteHelperService } from '../../common-ui-elements';
import { UIToolsService } from '../../common/UIToolsService';
import { HomeComponent } from '../../home/home.component';
import { terms } from '../../terms';
import { SignInController } from '../SignInController';
import { UserMenuComponent } from '../user-menu/user-menu.component';

@Component({
  selector: 'app-user-validation',
  templateUrl: './user-validation.component.html',
  styleUrls: ['./user-validation.component.scss']
})
export class UserValidationComponent implements OnInit {

  signer = new SignInController();
  sent = false

  constructor(
    private routeHelper: RouteHelperService,
    private route: ActivatedRoute,
    private ui: UIToolsService) {
  }
  terms = terms;
  remult = remult;

  async ngOnInit(): Promise<void> {
    // console.log('mobile', this.signer.mobile)
    this.signer.mobile = this.route.snapshot.paramMap.get('mobile') ?? '';
  }

  async signIn() {
    let res = await this.signer.signIn()
    if (res.success) {
      remult.user = res.userInfo
      this.routeHelper.navigateToComponent(UserMenuComponent)
    }
    else {
      this.ui.info(res.error)
    }
  }

  isNumberKey(evt: any) {
    var charCode = (evt.which) ? evt.which : evt.keyCode
    return !(charCode > 31 && (charCode < 48 || charCode > 57));
  }

  async sendAgain() {
    let sent = await this.signer.sendValidationCode()
  }

  async back() {
    this.routeHelper.navigateToComponent(HomeComponent)
  }

}
