import { Injectable } from '@angular/core';
import { AuthenticatedGuard } from 'common-ui-elements';
import { Roles } from './roles';


@Injectable()
export class AdminGuard extends AuthenticatedGuard {

    override isAllowed() {
        return Roles.admin;
    }
}

@Injectable()
export class DonorGuard extends AuthenticatedGuard {

    override isAllowed() {
        return Roles.donor;
    }
}


@Injectable()
export class ManagerGuard extends AuthenticatedGuard {

    override isAllowed() {
        return Roles.manager;
    }
}


@Injectable()
export class VolunteerGuard extends AuthenticatedGuard {

    override isAllowed() {
        return Roles.volunteer;
    }
}


@Injectable()
export class TenantGuard extends AuthenticatedGuard {

    override isAllowed() {
        return Roles.tenant;
    }
}

@Injectable()
export class ManagerOrAboveGuard extends AuthenticatedGuard {

    override isAllowed() {
        // console.log('ManagerOrAboveGuard',this.remult.user?.isManager!, this.remult.user?.isDonor! , this.remult.user?.isAdmin!)
        return this.remult.user?.isManager! || this.remult.user?.isDonor! || this.remult.user?.isAdmin!
        // .isAllowed(Roles.manager) ||
        //     this.remult.isAllowed(Roles.board)||
        //     this.remult.isAllowed(Roles.donor)||
        //     this.remult.isAllowed(Roles.admin);
    }
} 
