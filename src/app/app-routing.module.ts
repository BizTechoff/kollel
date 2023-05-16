import { ErrorHandler, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonUIElementsModule, NotAuthenticatedGuard } from 'common-ui-elements';
import { BranchComponent } from './branches/branch/branch.component';
import { BranchesComponent } from './branches/branches/branches.component';
import { ShowDialogOnErrorErrorHandler } from './common/UIToolsService';
import { HomeComponent } from './home/home.component';
import { AlbumComponent } from './media/album/album.component';
import { GalleryComponent } from './media/gallery/gallery.component';
import { NewsWeeklyQuestionComponent } from './news/news-weekly-question/news-weekly-question.component';
import { NewsComponent } from './news/news/news.component';
import { NewsesComponent } from './news/newses/newses.component';
import { TenantComponent } from './tenants/tenant/tenant.component';
import { TenantsImportComponent } from './tenants/tenants-import/tenants-import.component';
import { TenantsComponent } from './tenants/tenants/tenants.component';
import { terms } from './terms';
import { AdminGuard, DonorGuard, ManagerGuard, ManagerOrAboveGuard, TenantGuard, VolunteerGuard } from './users/AuthGuard';
import { ManagerComponent } from './users/manager/manager.component';
import { ManagersComponent } from './users/managers/managers.component';
import { UserMenuComponent } from './users/user-menu/user-menu.component';
import { UserMenu2Component } from './users/user-menu2/user-menu2.component';
import { UserRegistrationComponent } from './users/user-registration/user-registration.component';
import { UserValidationComponent } from './users/user-validation/user-validation.component';
import { UserVolunteerThanksComponent } from './users/user-volunteer-thanks/user-volunteer-thanks.component';
import { UsersComponent } from './users/users/users.component';
import { VolunteerComponent } from './users/volunteer/volunteer.component';
import { VolunteersComponent } from './users/volunteers/volunteers.component';
import { VisitComponent } from './visits/visit/visit.component';
import { VisitsChartComponent } from './visits/visits-chart/visits-chart.component';
import { VisitsExportComponent } from './visits/visits-export/visits-export.component';
import { VisitsFinishedBlessingComponent } from './visits/visits-finished-blessing/visits-finished-blessing.component';
import { VisitsFinishedMessagesComponent } from './visits/visits-finished-messages/visits-finished-messages.component';
import { VisitsFinishedSummaryComponent } from './visits/visits-finished-summary/visits-finished-summary.component';
import { VisitsReadonlyComponent } from './visits/visits-readonly/visits-readonly.component';
import { VisitsComponent } from './visits/visits/visits.component';

const defaultRoute = terms.home;
const routes: Routes = [
  { path: defaultRoute, component: HomeComponent, canActivate: [NotAuthenticatedGuard], data: { name: 'בית' } },
  // { path: 'register', component: UserRegistrationComponent, canActivate: [NotAuthenticatedGuard], data: { name: 'רישום מתנדב' } },
  { path: 'menu', component: UserMenuComponent, canActivate: [ManagerOrAboveGuard], data: { name: 'תפריט' } },
  { path: 'visits', component: VisitsComponent, canActivate: [ManagerGuard], data: { name: 'דיווחים' } },
  { path: 'blessing', component: VisitsFinishedBlessingComponent, canActivate: [ManagerGuard], data: { name: 'זיקוקין' } },
  { path: 'messages', component: VisitsFinishedMessagesComponent, canActivate: [ManagerGuard], data: { name: 'הודעות' } },
  { path: 'summary', component: VisitsFinishedSummaryComponent, canActivate: [ManagerGuard], data: { name: 'סיכום' } },
  { path: 'tenants', component: TenantsComponent, canActivate: [ManagerGuard], data: { name: 'דיירים' } },
  { path: 'volunteers', component: VolunteersComponent, canActivate: [ManagerGuard], data: { name: 'מתנדבים' } },
  { path: 'chart', component: VisitsChartComponent, canActivate: [ManagerOrAboveGuard], data: { name: 'מצב נוכחי' } },
  { path: 'visit', component: VisitComponent, canActivate: [ManagerGuard], data: { name: 'דיווח' } },
  { path: 'tenant', component: TenantComponent, canActivate: [ManagerGuard], data: { name: 'דייר' } },
  { path: 'volunteer', component: VolunteerComponent, canActivate: [ManagerGuard], data: { name: 'מתנדב' } },
  { path: 'manager', component: ManagerComponent, canActivate: [AdminGuard], data: { name: 'ראש כולל' } },
  { path: 'branch', component: BranchComponent, canActivate: [AdminGuard], data: { name: 'כולל' } },
  { path: 'news', component: NewsComponent, canActivate: [AdminGuard], data: { name: 'הודעה מתפרצת' } },
  { path: 'valid', component: UserValidationComponent, canActivate: [NotAuthenticatedGuard], data: { name: 'אימות סלולרי' } },
  { path: 'users', component: UsersComponent, canActivate: [AdminGuard], data: { name: terms.userAccounts } },
  { path: 'managers', component: ManagersComponent, canActivate: [AdminGuard], data: { name: 'ראשי כולל' } },
  { path: 'branches', component: BranchesComponent, canActivate: [AdminGuard], data: { name: 'כוללים' } },
  { path: 'newses', component: NewsesComponent, canActivate: [AdminGuard], data: { name: 'הודעות הנהלה' } },
  { path: 'weekly', component: NewsWeeklyQuestionComponent, canActivate: [AdminGuard], data: { name: 'שאלת השבוע' } },
  { path: 'album', component: AlbumComponent, canActivate: [ManagerOrAboveGuard], data: { name: 'אלבום תמונות' } },
  { path: 'gallery', component: GalleryComponent, canActivate: [ManagerOrAboveGuard], data: { name: 'גלריית תמונות' } },
  { path: 'thanks', component: UserVolunteerThanksComponent, canActivate: [VolunteerGuard], data: { name: 'תודה' } },
  { path: 'export', component: VisitsExportComponent, canActivate: [ManagerOrAboveGuard], data: { name: 'ייצוא' } },
  { path: 'import', component: TenantsImportComponent, canActivate: [ManagerGuard], data: { name: 'ייבוא' } },
  // { path: 'visits-readonly', component: VisitsReadonlyComponent, canActivate: [AdminGuard], data: { name: 'דיווחים' } },
  // { path: 'import', component: TenantsImportComponent, canActivate: [NotAuthenticatedGuard], data: { name: 'ריסטרט' } },
  { path: '**', redirectTo: '/' + defaultRoute, pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes),
    CommonUIElementsModule],
  providers: [AdminGuard, DonorGuard, ManagerGuard, VolunteerGuard, TenantGuard, ManagerOrAboveGuard,
    { provide: ErrorHandler, useClass: ShowDialogOnErrorErrorHandler }],
  exports: [RouterModule]
})
export class AppRoutingModule { }
