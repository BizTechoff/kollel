import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { remult } from 'remult';
import { Branch } from '../../branches/branch';
import { RouteHelperService } from '../../common-ui-elements';
import { UIToolsService } from '../../common/UIToolsService';
import { uploader } from '../../common/uploader';
import { MediaController } from '../../media/mediaController';
import { terms } from '../../terms';
import { User } from '../../users/user';
import { UserMenuComponent } from '../../users/user-menu/user-menu.component';
import { UserController } from '../../users/userController';
import { Tenant } from '../tenant';
import { TenantController } from '../tenantController';
import { TenantsComponent } from '../tenants/tenants.component';
import { TenantVolunteer } from '../TenantVolunteer';
import { TenantVolunteerController } from '../tenantVolunteerController';
import { BranchGroup } from '../../branches/branchGroup';

@Component({
  selector: 'app-tenant',
  templateUrl: './tenant.component.html',
  styleUrls: ['./tenant.component.scss']
})
export class TenantComponent implements OnInit {

  tenant!: Tenant
  volunteers = [] as TenantVolunteer[]
  languages = [] as { caption: string, id: string }[]
  query = new TenantController()
  qVolunteers = new TenantVolunteerController()
  page = 1
  tenantPhotoLink = ''
  title = ''
  group!:BranchGroup

  args!: {
    id: string
  }
  constructor(
    private routeHelper: RouteHelperService,
    private route: ActivatedRoute,
    private ui: UIToolsService) {
  }
  terms = terms;
  remult = remult;

  async ngOnInit(): Promise<void> {
    this.group = BranchGroup.fromId(remult.user!.group)
    //console.log(`VisitComponent: { this.route.snapshot.paramMap: ${JSON.stringify(this.route.snapshot.paramMap)}}`)
    if (!this.args) {
      this.args = { id: '' }
    }
    this.args.id = this.route.snapshot.paramMap.get('id') ?? '';
    //console.log(`VisitComponent: {id: ${this.args.id}}`)
    if (this.args.id?.trim().length) {
      this.title = `עדכון ${this.group.single}`
      await this.reloadId()
    }
    else {
      //console.log('new tenant')
      this.title = `הוספת ${this.group.single} חדש`
      this.tenant = remult.repo(Tenant).create()
      this.tenant.active = true
      this.tenant.branch = await remult.repo(Branch).findId(remult.user!.branch)
      this.tenant.address = this.tenant.branch?.name
    }
  }

  async save() {
    await remult.repo(Tenant).save(this.tenant)
    this.back()
  }

  onSelect(e: any) {
    //console.log('TenantComponent.onSelect.e', e, 'this.tenant.birthday', this.tenant?.birthday)
  }

  // birthday() {
  //   //console.log('TenantComponent.birthday', this.tenant?.birthday)
  // }

  async tenantPhoto() {
    if (this.tenant?.id?.trim().length) {
      let media = new MediaController()
      this.tenantPhotoLink = await media.getTenantPhotoLink(this.tenant.id)

      //console.log(`tenantPhoto: ${this.tenantPhotoLink}`)
    }
  }

  async reloadId() {
    this.tenant = undefined!
    if (this.args.id?.trim().length) {
      this.tenant = await this.query.getTenant(this.args.id)
      // if (this.tenant.birthday) {
      //   console.log('this.tenant.birthday',this.tenant.birthday)//,resetDateTime( this.tenant.birthday))
      //   var date = new Date(this.tenant.birthday)
      //   const format = 'yyyy-MM-dd'
      //   const locale = 'en-US'
      //   const formatedDate = formatDate(date,format,locale)
      //   this.tenant.birthday = new Date(formatedDate)
      //   // this.tenant.birthday = resetDateTime(this.tenant.birthday)
      // }
      // await this.reloadVolunteers()
      // await this.setLanguages()
      //console.log('reloadId.volunteersNames', this.tenant.volunteers)
      // await this.tenantPhoto()
      // //console.log('reloadId.visit.id', this.visit.id, this.isVisited(), this.isDelivered(), this.visit.status, VisitStatus.visited)
    }
  }

  setDate() {
    // console.log('setDate clicked')
    this.tenant.birthday = new Date()
  }

  async setLanguages() {
    this.languages = [] as { caption: string, id: string }[]
    let l = this.tenant?.languages?.trim() || ''
    if (l.length) {
      let s = l.split(',')
      for (const ll of s) {
        if (ll === '1') {
          this.languages.push({ caption: 'עברית', id: '1' })
        }
        else if (ll === '2') {
          this.languages.push({ caption: 'רוסית', id: '2' })
        }
        else if (ll === '3') {
          this.languages.push({ caption: 'אנגלית', id: '3' })
        }
      }
    }
  }

  async removeLanguage(l: { caption: string, id: string }) {
    let yes = await this.ui.yesNoQuestion(`?להסיר את ${l.caption}`)
    if (yes) {
      let find = this.languages.findIndex(ll => ll === l)
      //console.log(`removeLanguage.find=${find}`)
      if (find > -1) {
        let removed = this.languages.splice(find, 1)
        //console.log(`removeLanguage.tenant.languages.removed=${JSON.stringify(removed)}`)
        this.tenant.languages = this.tenant.languages.replace(l.id + ',', '').replace(',' + l.id, '').replace(l.id, '')
        //console.log(`removeLanguage.tenant.languages=${this.tenant.languages}`)
      }
    }
  }

  async removeVolunteer(id = '', name = '') {

    let yes = await this.ui.yesNoQuestion(`?להסיר את ${name}`)
    if (yes) {
      let tv = await remult.repo(TenantVolunteer).findFirst({
        tenant: { $id: this.tenant?.id },
        volunteer: { $id: id }
      })
      if (tv) {
        await remult.repo(TenantVolunteer).delete(tv)
        await this.reloadVolunteers()
      }
    }
  }

  async reloadVolunteers() {
    this.volunteers = await this.qVolunteers.getVolunteers(this.tenant.id)
  }

  volunteersNames() {
    return this.tenant?.volunteers.map(u => u.name).join(', ')
  }

  async onFileInput(e: any) {
    let branch = 'get.hesed.hod.hasharon'

    let s3 = new uploader(
      false,
      undefined!,
      this.tenant,
      undefined!,
      undefined!)

    let res = await s3.loadFiles(e.target.files)
    if (res?.length) {
      await this.reloadId()
    }
  }

  async rv(volunteer: User) {
    let yes = await this.ui.yesNoQuestion(`?להסיר את ${volunteer.name}`)
    if (yes) {
      let tv = await remult.repo(TenantVolunteer).findFirst({
        tenant: { $id: this.tenant?.id },
        volunteer: { $id: volunteer?.id }
      })
      if (tv) {
        await remult.repo(TenantVolunteer).delete(tv)
        await this.reloadId()
      }
    }
  }

  // if (this.args.id?.trim().length) { }
  // else {
  //   let today = resetDateTime(new Date())
  //   let found = await remult.repo(Visit).findFirst({
  //     branch: await remult.repo(Branch).findId(remult.user!.branch),
  //     tenant: this.tenant,
  //     date: firstDateOfWeek(today)
  //   })
  //   if (!found) {
  //     let yes = await this.ui.yesNoQuestion(`?האם לייצר לדייר זה רשומת דיווח`)
  //     if (yes) {
  //       let visit = remult.repo(Visit).create()
  //       visit.tenant = this.tenant
  //       visit.date = today
  //       await remult.repo(Visit).save(visit)
  //     }
  //   }
  // }
  // @BackendMethod({ allowed: remult.authenticated() })
  // async uploadToS3(files: any, branch: any) {
  //   await upload(files, branch)
  //   // e.target.files
  // }

  back() {
    this.routeHelper.navigateToComponent(TenantsComponent)
  }

  async close() {
    this.routeHelper.navigateToComponent(TenantsComponent)
  }

  async selectVolunteers() {
    await remult.repo(Tenant).save(this.tenant)
    let vols: { caption: string, id: string }[] = [] as { caption: string, id: string }[]
    let uc = new UserController()
    for (const v of await uc.getVoulnteers()) {
      let found = this.volunteers.find(u => u.volunteer.id === v.id)
      if (!found) {
        vols.push({ caption: v.name, id: v.id })
      }
    }
    await this.ui.selectValuesDialog({
      title: 'בחירת מתנדבים',
      values: vols,
      onSelect: async (v) => { await this.addVolunteer(v.id) },
      onAdd: async (v) => { await this.addNewVolunteer(v.caption) }
    })
  }

  async addVolunteer(id = '') {
    //console.log(JSON.stringify(id))
    let tv = await remult.repo(TenantVolunteer).findFirst(
      {
        tenant: { $id: this.tenant?.id },
        volunteer: { $id: id }
      })
    if (!tv) {
      tv = remult.repo(TenantVolunteer).create()
      tv.tenant = this.tenant
      tv.volunteer = await remult.repo(User).findId(id)
    }
    await remult.repo(TenantVolunteer).save(tv)
    await this.reloadId()
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

    let found = this.tenant.languages.includes('1')
    if (!found) {
      vols.push({ caption: 'עברית', id: '1' })
    }
    found = this.tenant.languages.includes('2')
    if (!found) {
      vols.push({ caption: 'רוסית', id: '2' })
    }
    found = this.tenant.languages.includes('3')
    if (!found) {
      vols.push({ caption: 'אנגלית', id: '3' })
    }

    await this.ui.selectValuesDialog({
      title: 'בחירת שפות',
      values: vols,
      onSelect: async (v) => { await this.addLanguage(v.id) }//,
      // onAdd: async (v) => { await this.addNewVolunteer(v.caption) }
    })
  }

  async addLanguage(id: string) {
    if (!this.tenant.languages) {
      this.tenant.languages = ''
    }
    if (this.tenant.languages?.trim().length) {
      this.tenant.languages += ','
    }
    this.tenant.languages += id
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
