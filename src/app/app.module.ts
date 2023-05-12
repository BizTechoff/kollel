import { APP_INITIALIZER, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BrowserModule } from '@angular/platform-browser';
import { CommonUIElementsModule } from 'common-ui-elements';
import { ChartsModule } from 'ng2-charts';
import { remult } from 'remult';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BranchComponent } from './branches/branch/branch.component';
import { BranchesComponent } from './branches/branches/branches.component';
import { DataAreaDialogComponent } from './common/data-area-dialog/data-area-dialog.component';
import { TextAreaDataControlComponent } from './common/textarea-data-control/textarea-data-control.component';
import { UIToolsService } from './common/UIToolsService';
import { YesNoQuestionComponent } from './common/yes-no-question/yes-no-question.component';
import { HomeComponent } from './home/home.component';
import { AlbumComponent } from './media/album/album.component';
import { GalleryComponent } from './media/gallery/gallery.component';
import { NewsWeeklyQuestionComponent } from './news/news-weekly-question/news-weekly-question.component';
import { NewsComponent } from './news/news/news.component';
import { NewsesComponent } from './news/newses/newses.component';
import { TenantComponent } from './tenants/tenant/tenant.component';
import { TenantsImportComponent } from './tenants/tenants-import/tenants-import.component';
import { TenantsComponent } from './tenants/tenants/tenants.component';
import { AdminGuard, DonorGuard, ManagerGuard, ManagerOrAboveGuard, TenantGuard, VolunteerGuard } from './users/AuthGuard';
import { ManagerComponent } from './users/manager/manager.component';
import { ManagersComponent } from './users/managers/managers.component';
import { SignInController } from './users/SignInController';
import {MatRadioModule} from '@angular/material/radio';
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
import { VisitsReportComponent } from './visits/visits-report/visits-report.component';
import { VisitsComponent } from './visits/visits/visits.component';
import { BranchGroupComponent } from './branches/branch-group/branch-group.component';
import { MediaTextComponent } from './media/media-text/media-text.component';
import { VisitsReadonlyComponent } from './visits/visits-readonly/visits-readonly.component';

@NgModule({
  declarations: [
    AppComponent,
    UsersComponent,
    HomeComponent,
    YesNoQuestionComponent,
    DataAreaDialogComponent,
    TextAreaDataControlComponent,
    VisitsComponent,
    VisitComponent,
    VisitsFinishedBlessingComponent,
    VisitsFinishedMessagesComponent,
    VisitsFinishedSummaryComponent,
    VisitsChartComponent,
    UserMenuComponent,
    TenantsComponent,
    TenantComponent,
    UserRegistrationComponent,
    UserMenu2Component,
    VolunteersComponent,
    VolunteerComponent,
    ManagersComponent,
    ManagerComponent,
    BranchesComponent,
    BranchComponent,
    NewsesComponent,
    NewsComponent,
    NewsWeeklyQuestionComponent,
    UserValidationComponent,
    VisitsReportComponent,
    AlbumComponent,
    UserVolunteerThanksComponent,
    VisitsExportComponent,
    TenantsImportComponent,
    GalleryComponent,
    BranchGroupComponent,
    MediaTextComponent,
    VisitsReadonlyComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSidenavModule,
    MatListModule,
    MatToolbarModule,
    MatCheckboxModule,
    MatCardModule,
    MatDialogModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatRadioModule,
    MatIconModule,
    MatMenuModule,
    ChartsModule,
    CommonUIElementsModule,
    MatSelectModule,
    MatTableModule
  ],
  providers: [
    UIToolsService,
    AdminGuard,
    DonorGuard,
    ManagerGuard,
    VolunteerGuard,
    TenantGuard,
    ManagerOrAboveGuard,
    {
      provide: APP_INITIALIZER,
      useFactory: initApp,
      multi: true
    }
  ],
  bootstrap: [AppComponent],
  entryComponents: [YesNoQuestionComponent, DataAreaDialogComponent]
})
export class AppModule { }

export function initApp() {
  // GalleryModule.withConfig({ })
  const loadCurrentUserBeforeAppStarts = async () => {
    remult.user = await SignInController.currentUser();
  };
  // addDefaultBoardBranch()
  return loadCurrentUserBeforeAppStarts;
}