import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { remult } from 'remult';
import { RouteHelperService } from '../../common-ui-elements';
import { firstDateOfWeek, lastDateOfWeek, resetDateTime } from '../../common/dateFunc';
import { UIToolsService } from '../../common/UIToolsService';
import { uploader } from '../../common/uploader';
import { terms } from '../../terms';
import { UserMenuComponent } from '../../users/user-menu/user-menu.component';
import { News } from '../news';
import { NewsController } from '../newsController';
import { NewsType } from '../newsType';

@Component({
  selector: 'app-news-weekly-question',
  templateUrl: './news-weekly-question.component.html',
  styleUrls: ['./news-weekly-question.component.scss']
})
export class NewsWeeklyQuestionComponent implements OnInit {

  news!: News
  languages = [] as { caption: string, id: string }[]
  query = new NewsController()
  page = 1
  tenantPhotoLink = ''

  constructor(
    private routeHelper: RouteHelperService,
    private route: ActivatedRoute,
    private ui: UIToolsService) {
  }
  terms = terms;
  remult = remult;

  async ngOnInit(): Promise<void> {
    remult.user!.lastComponent = NewsWeeklyQuestionComponent.name
    let date = resetDateTime(new Date())
    this.query.fdate = firstDateOfWeek(date)
    this.query.tdate = lastDateOfWeek(date)
    this.news = await this.query.getWeeklyQuestion()
    if (!this.news) {
      let today = resetDateTime(new Date())
      this.news = remult.repo(News).create()
      this.news.active = true
      this.news.type = NewsType.text
      this.news.subject = 'שאלת השבוע'
      this.news.weeklyQuestion = true
      this.news.fdate = firstDateOfWeek(today)
      this.news.tdate = lastDateOfWeek(today)
    }
    //console.log(`VisitComponent: { this.route.snapshot.paramMap: ${JSON.stringify(this.route.snapshot.paramMap)}}`)
    // if (!this.args) {
    //   this.args = { id: '' }
    // }
    // this.args.id = this.route.snapshot.paramMap.get('id') ?? '';
    // //console.log(`VisitComponent: {id: ${this.args.id}}`)
    // if (this.args.id?.trim().length) {
    //   await this.reloadId()
    // }
    // else {
    //   //console.log('new tenant')
    //   this.news = remult.repo(News).create()
    //   this.news.active = true
    //   this.news.subject = 'שאלת השבוע'
    //   this.news.weeklyQuestion = true
    //   // this.volunteer.address = this.remult.user?.branchName!
    //   // this.volunteer.volunteer = true
    //   // this.volunteer.branch = await remult.repo(Branch).findId(remult.user!.branch)
    //   // this.volunteer.address = this.volunteer.branch?.name
    // }
  }

  onSelect(e: any) {
    //console.log('TenantComponent.onSelect.e', e, 'this.tenant.birthday', this.tenant?.birthday)
  }

  birthday() {
    //console.log('TenantComponent.birthday', this.tenant?.birthday)
  }

  async tenantPhoto() {
    if (this.news?.id?.trim().length) {
      // let media = new MediaController()
      // this.tenantPhotoLink = await media.getVolunteerPhotoLink(this.volunteer.id)

      //console.log(`tenantPhoto: ${this.tenantPhotoLink}`)
    }
  }

  async reloadId() {
    // this.news = undefined!
    // if (this.args.id?.trim().length) {
    //   this.news = await this.query.getNews(this.args.id)
    //   await this.reloadVolunteers()
    //   await this.setLanguages()
    //   //console.log('reloadId.volunteersNames', this.tenant.volunteers)
    //   await this.tenantPhoto()
    //   // //console.log('reloadId.visit.id', this.visit.id, this.isVisited(), this.isDelivered(), this.visit.status, VisitStatus.visited)
    // }
  }

  async setLanguages() {
    this.languages = [] as { caption: string, id: string }[]
    // let l = this.volunteer?.languages?.trim() || ''
    // if (l.length) {
    //   let s = l.split(',')
    //   for (const ll of s) {
    //     if (ll === '1') {
    //       this.languages.push({ caption: 'עברית', id: '1' })
    //     }
    //     else if (ll === '2') {
    //       this.languages.push({ caption: 'רוסית', id: '2' })
    //     }
    //     else if (ll === '3') {
    //       this.languages.push({ caption: 'אנגלית', id: '3' })
    //     }
    //   }
    // }
  }

  async removeLanguage(l: { caption: string, id: string }) {
    let yes = await this.ui.yesNoQuestion(`?להסיר את ${l.caption}`)
    if (yes) {
      let find = this.languages.findIndex(ll => ll === l)
      //console.log(`removeLanguage.find=${find}`)
      if (find > -1) {
        let removed = this.languages.splice(find, 1)
        //console.log(`removeLanguage.tenant.languages.removed=${JSON.stringify(removed)}`)
        // this.volunteer.languages = this.volunteer.languages.replace(l.id + ',', '').replace(',' + l.id, '').replace(l.id, '')
        //console.log(`removeLanguage.tenant.languages=${this.tenant.languages}`)
      }
    }
  }

  async removeVolunteer(id = '', name = '') {

    let yes = await this.ui.yesNoQuestion(`?להסיר את ${name}`)
    // if (yes) {
    //   let tv = await remult.repo(TenantVolunteer).findFirst({
    //     tenant: { $id: this.volunteer?.id },
    //     volunteer: { $id: id }
    //   })
    //   if (tv) {
    //     await remult.repo(TenantVolunteer).delete(tv)
    //     await this.reloadVolunteers()
    //   }
    // }
  }

  async reloadVolunteers() {
    // this.volunteers = await this.qVolunteers.getVolunteers(this.volunteer.id)
  }

  volunteersNames() {
    return ''// this.volunteer?.volunteers.map(u => u.name).join(', ')
  }

  async onFileInput(e: any) {
    let s3 = new uploader(
      false,
      undefined!,
      undefined!,
      undefined!,
      this.news)

    let res = await s3.loadFiles(e.target.files)
    if (res?.length) {
      await this.reloadId()
    }
  }

  async rv(volunteer: News) {
    let yes = await this.ui.yesNoQuestion(`?להסיר את ${volunteer.subject}`)
    // // if (yes) {
    // //   let tv = await remult.repo(TenantVolunteer).findFirst({
    // //     tenant: { $id: this.volunteer?.id },
    // //     volunteer: { $id: volunteer?.id }
    // //   })
    // //   if (tv) {
    // //     await remult.repo(TenantVolunteer).delete(tv)
    // //     await this.reloadId()
    // //   }
    // }
  }

  async save() {
    await remult.repo(News).save(this.news)
    this.back()
  }

  // @BackendMethod({ allowed: remult.authenticated() })
  // async uploadToS3(files: any, branch: any) {
  //   await upload(files, branch)
  //   // e.target.files
  // }

  back() {
    this.routeHelper.navigateToComponent(UserMenuComponent)
  }

  async close() {
    this.routeHelper.navigateToComponent(UserMenuComponent)
  }

  async selectVolunteers() {
    // let vols: { caption: string, id: string }[] = [] as { caption: string, id: string }[]
    // let uc = new UserController()
    // for (const v of await uc.getVoulnteers()) {
    //   let found = this.volunteers.find(u => u.volunteer.id === v.id)
    //   if (!found) {
    //     vols.push({ caption: v.name, id: v.id })
    //   }
    // }
    // await this.ui.selectValuesDialog({
    //   title: 'בחירת מתנדבים',
    //   values: vols,
    //   onSelect: async (v) => { await this.addVolunteer(v.id) },
    //   onAdd: async (v) => { await this.addNewVolunteer(v.caption) }
    // })
  }

  async addVolunteer(id = '') {
    //console.log(JSON.stringify(id))
    // let tv = await remult.repo(TenantVolunteer).findFirst(
    //   {
    //     tenant: { $id: this.volunteer?.id },
    //     volunteer: { $id: id }
    //   },
    //   { createIfNotFound: true })
    // if (tv?.isNew()) {
    //   await remult.repo(TenantVolunteer).save(tv)
    //   await this.reloadId()
    // }
  }

  async addNewVolunteer(name = '') {
    //console.log('addNewVolunteer', name)
    // let tv = await remult.repo(TenantVolunteer).findFirst(
    //   {
    //     tenant: { $id: this.tenant?.id },
    //     volunteer: { $id: id }
    //   },
    //   { createIfNotFound: true })
    // if (tv.isNew()) {
    //   await tv.save()
    //   await this.reloadId()
    // }
  }

  async selectLanguages() {
    let vols: { caption: string, id: string }[] = [] as { caption: string, id: string }[]

    // let found = this.volunteer.languages.includes('1')
    // if (!found) {
    //   vols.push({ caption: 'עברית', id: '1' })
    // }
    // found = this.volunteer.languages.includes('2')
    // if (!found) {
    //   vols.push({ caption: 'רוסית', id: '2' })
    // }
    // found = this.volunteer.languages.includes('3')
    // if (!found) {
    //   vols.push({ caption: 'אנגלית', id: '3' })
    // }

    await this.ui.selectValuesDialog({
      title: 'בחירת שפות',
      values: vols,
      onSelect: async (v) => { await this.addLanguage(v.id) }//,
      // onAdd: async (v) => { await this.addNewVolunteer(v.caption) }
    })
  }

  async addLanguage(id: string) {
    // if (!this.volunteer.languages) {
    //   this.volunteer.languages = ''
    // }
    // if (this.volunteer.languages?.trim().length) {
    //   this.volunteer.languages += ','
    // }
    // this.volunteer.languages += id
    this.setLanguages()
    // await remult.repo(Tenant).save(this.tenant)
  }

  async selectBirthday() {
    // let date = this.tenant.birthday
    // await this.ui.selectDate(date)
  }

  rootmenu() {
    this.routeHelper.navigateToComponent(UserMenuComponent)
  }

}
