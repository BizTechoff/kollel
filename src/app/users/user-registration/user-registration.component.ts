import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { remult } from 'remult';
import { RouteHelperService } from '../../common-ui-elements';
import { UIToolsService } from '../../common/UIToolsService';
import { terms } from '../../terms';
import { RegisterController } from '../registerController';
import { UserValidationComponent } from '../user-validation/user-validation.component';

@Component({
  selector: 'app-user-registration',
  templateUrl: './user-registration.component.html',
  styleUrls: ['./user-registration.component.scss']
})
export class UserRegistrationComponent implements OnInit {

  register = new RegisterController()
  branch = '..מחפש כולל'
  foundBrnach = false

  constructor(
    private routeHelper: RouteHelperService,
    private ui: UIToolsService,
    private route: ActivatedRoute) {
  }
  terms = terms;
  remult = remult;

  async ngOnInit(): Promise<void> {

    let branchId = '0f3fa39f-dedc-4265-82d5-3b5e0873f3e7'// 'בדיקות'
    // this.route.queryParams.subscribe(prms => {
    //   // console.log('registration.prms', JSON.stringify(prms))
    //   branchId = prms['branch'] ?? ''
    // })
    //console.log(`register.branch: ${branchId}`)
    if (branchId?.trim().length) {
      branchId = branchId.trim()
      this.foundBrnach = await this.register.setBranchIfExists(branchId)
    }
    if (!this.foundBrnach) {
      this.info('לא נמצא כולל')
      this.branch = 'לא נמצא כולל'
    }
    else {
      this.branch = 'הצטרפות לכולל ' + this.register.branch?.name
    }
  }

  info(message: string) {
    this.ui.info(message)
  }

  async registerMe() {
    let res = await this.register.sendValidationCode()
    // res.success = true
    if (res.special) {

    }
    if (res.success) {
      this.routeHelper.navigateToComponent(UserValidationComponent, { mobile: this.register.mobile })
    }
    else {
      this.ui.info(res.error)
    }

    // let res = await this.register.register()
    // //console.log('registerMe', res)
    // this.info(res)
    // if (this.register.ok) {
    //   // this.routeHelper.navigateToComponent(HomeComponent)
    // }
  }

  isNumberKey(evt: any) {
    // //console.log('evt', evt)
    var charCode = (evt.which) ? evt.which : evt.keyCode
    return !(charCode > 31 && (charCode < 48 || charCode > 57));
  }

}
