import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { remult } from 'remult';
import { Branch } from '../../branches/branch';
import { BranchController } from '../../branches/branchController';
import { BranchGroup } from '../../branches/branchGroup';
import { RouteHelperService } from '../../common-ui-elements';
import { UIToolsService } from '../../common/UIToolsService';
import { uploader } from '../../common/uploader';
import { MediaController } from '../../media/mediaController';
import { terms } from '../../terms';
import { ManagersComponent } from '../managers/managers.component';
import { User } from '../user';
import { UserMenuComponent } from '../user-menu/user-menu.component';
import { UserBranch } from '../userBranch';
import { UserController } from '../userController';

@Component({
  selector: 'app-manager',
  templateUrl: './manager.component.html',
  styleUrls: ['./manager.component.scss']
})
export class ManagerComponent implements OnInit {

  manager!: User
  languages = [] as { caption: string, id: string }[]
  query = new UserController()
  page = 1
  tenantPhotoLink = ''
  selectedBranch!: Branch
  title= 'הוספת ראש כולל חדש'

  args!: {
    id: string,
    ub: string,
    bid: string
  }
  constructor(
    private routeHelper: RouteHelperService,
    private route: ActivatedRoute,
    private ui: UIToolsService) {
  }
  terms = terms;
  remult = remult;

  async ngOnInit(): Promise<void> {
    remult.user!.lastComponent = ManagerComponent.name
    this.query.group = BranchGroup.fromId(remult.user!.group)
    //console.log(`VisitComponent: { this.route.snapshot.paramMap: ${JSON.stringify(this.route.snapshot.paramMap)}}`)
    if (!this.args) {
      this.args = { id: '', ub: '', bid: '' }
    }
    this.args.id = this.route.snapshot.paramMap.get('id') ?? '';
    //console.log(`VisitComponent: {id: ${this.args.id}}`)
    if (this.args.id?.trim().length) {
      this.title= 'עדכון ראש כולל'
      // console.log(this.title)
      await this.reloadId()
      // await this.addBranch('', this.manager.id)
    }
    else {
      this.title= 'הוספת ראש כולל חדש'
      //console.log('new tenant')
      this.manager = remult.repo(User).create()
      // this.volunteer.address = this.remult.user?.branchName!
      this.manager.manager = true
      // this.volunteer.branch = await remult.repo(Branch).findId(remult.user!.branch)
      // this.volunteer.address = this.volunteer.branch?.name
    }
  }

  async save() {
    if (!this.selectedBranch) {
      this.ui.error('חובה לשייך כולל')
    }
    else {
      let isNew = this.args.id?.trim().length === 0
      // console.log('this.volunteer:', JSON.stringify(this.manager))
      await remult.repo(User).save(this.manager)
      if (isNew) {
        await remult.repo(UserBranch).insert({
          user: this.manager,
          branch: this.selectedBranch
        })
      }
      else {
        // console.log('selectedBranch',this.selectedBranch?.id,this.args.bid)
        if (this.selectedBranch?.id !== this.args.bid) {
          let ub = await remult.repo(UserBranch).findId(this.args.ub)
          if (ub) {
            ub.branch = this.selectedBranch
            await remult.repo(UserBranch).save(ub)
          }
        }
      }
      this.back()
    }
  }

  onSelect(e: any) {
    //console.log('TenantComponent.onSelect.e', e, 'this.tenant.birthday', this.tenant?.birthday)
  }

  birthday() {
    //console.log('TenantComponent.birthday', this.tenant?.birthday)
  }

  async tenantPhoto() {
    if (this.manager?.id?.trim().length) {
      let media = new MediaController()
      this.tenantPhotoLink = await media.getVolunteerPhotoLink(this.manager.id)

      //console.log(`tenantPhoto: ${this.tenantPhotoLink}`)
    }
  }

  async reloadId() {
    this.manager = undefined!
    if (this.args.id?.trim().length) {
      this.manager = await this.query.getUser(this.args.id)
      await this.reloadVolunteers()
      await this.setLanguages()
      //console.log('reloadId.volunteersNames', this.tenant.volunteers)
      await this.tenantPhoto()
      await this.addBranch('', this.manager.id)
      // console.log('this.selectedBranch', this.selectedBranch?.name)
      // //console.log('reloadId.visit.id', this.visit.id, this.isVisited(), this.isDelivered(), this.visit.status, VisitStatus.visited)
    }
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
      this.manager,
      undefined!)

    let res = await s3.loadFiles(e.target.files)
    if (res?.length) {
      await this.reloadId()
    }
  }

  async rv(volunteer: User) {
    let yes = await this.ui.yesNoQuestion(`?להסיר את ${volunteer.name}`)
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

  // @BackendMethod({ allowed: remult.authenticated() })
  // async uploadToS3(files: any, branch: any) {
  //   await upload(files, branch)
  //   // e.target.files
  // }

  back() {
    this.routeHelper.navigateToComponent(ManagersComponent)
  }

  async close() {
    this.routeHelper.navigateToComponent(ManagersComponent)
  }

  async selectBranch() {
    // console.log('selectBranch..')
    let vols: { caption: string, id: string }[] = [] as { caption: string, id: string }[]
    let uc = new BranchController()
    uc.group = this.query.group
    for (const v of await uc.getBranches()) {
      vols.push({ caption: v.name, id: v.id })
    }
    await this.ui.selectValuesDialog({
      title: 'בחירת כולל',
      values: vols,
      onSelect: async (v) => { await this.addBranch(v.id, '') },
      onAdd: async (v) => { await this.addNewVolunteer(v.caption) }
    })
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

  async addBranch(bid = '', uid = '') {
    // console.log('addBranch', bid, uid)
    if (bid?.trim().length) {
      this.selectedBranch = await remult.repo(Branch).findId(bid)
    }
    else if (uid?.trim().length) {
      let ub = await remult.repo(UserBranch).findFirst({ user: { $id: uid } })
      if (ub) {
        this.selectedBranch = ub.branch
        this.args.ub = ub.id
        this.args.bid = ub.branch?.id
      }
    }
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
