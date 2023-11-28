import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { remult } from 'remult';
import { BusyService, RouteHelperService } from '../../common-ui-elements';
import { UIToolsService } from '../../common/UIToolsService';
import { firstDateOfWeek, lastDateOfWeek, resetDateTime } from '../../common/dateFunc';
import { uploader } from '../../common/uploader';
import { terms } from '../../terms';
import { User } from '../../users/user';
import { UserMenuComponent } from '../../users/user-menu/user-menu.component';
import { UserController } from '../../users/userController';
import { VolunteerComponent } from '../../users/volunteer/volunteer.component';
import { Visit } from '../visit';
import { VisitVolunteer } from '../visit-volunteer';
import { VisitController } from '../visitController';
import { VisitStatus } from '../visitStatus';
import { VisitVolunteerController } from '../visitVolunteerController';
import { VisitsComponent } from '../visits/visits.component';

@Component({
  selector: 'app-visit',
  templateUrl: './visit.component.html',
  styleUrls: ['./visit.component.scss']
})
export class VisitComponent implements OnInit {

  visits = [] as Visit[]
  visit!: Visit
  query = new VisitController()
  vQuery = new VisitVolunteerController()
  page = 1
  volunteers = [] as VisitVolunteer[]

  args!: {
    id: string//,
    // volId?: string
  }
  constructor(
    private routeHelper: RouteHelperService,
    private route: ActivatedRoute,
    private ui: UIToolsService,
    private busy: BusyService) {
    // ,
    // private uploader:uploader
  }
  terms = terms;
  remult = remult;
  curIndex = 0


  async ngOnInit(): Promise<void> {

    //console.log(`VisitComponent: { this.route.snapshot.paramMap: ${JSON.stringify(this.route.snapshot.paramMap)}}`)
    if (!this.args) {
      this.args = { id: '' }
    }
    this.args.id = this.route.snapshot.paramMap.get('id') ?? '';
    // this.args.volId = this.route.snapshot.paramMap.get('volId') ?? '';
    // this.args.fdate = resetDateTime(new Date(this.route.snapshot.paramMap.get('fdate') ?? ''));
    // this.args.tdate = resetDateTime(new Date(this.route.snapshot.paramMap.get('tdate') ?? ''));
    // this.args.page = parseInt(this.route.snapshot.paramMap.get('page') ?? '1');
    // this.args.limit = parseInt(this.route.snapshot.paramMap.get('limit') ?? '6');
    //console.log(`VisitComponent: {id: ${this.args.id}, fdate: ${this.args.fdate}, tdate: ${this.args.tdate}, page: ${this.args.page}, limit: ${this.args.limit}}`)
    await this.reload()
  }

  async reload() {
    let today = resetDateTime(new Date())
    this.query.fdate = firstDateOfWeek(today)
    this.query.tdate = lastDateOfWeek(today)
    this.visits = await this.query.getVisits()
    this.visit = undefined!
    if (this.args.id?.trim().length) {
      //console.log('this.visits', this.visits)
      let filter = this.visits.filter(v => v.id === this.args.id)
      if (filter.length) {
        this.curIndex = this.visits.indexOf(filter[0])
        // this.curIndex = this.visits.findIndex(v => () => {
        //   let result = v.id === this.args.id
        //   if(result) 
        //   return result
        // })
        //console.log(`reload return: ${this.visits.length} visits, this.curIndex: ${this.curIndex}, id: ${this.args.id}`)
        if (this.curIndex !== -1) {
          this.visit = this.visits[this.curIndex]
          // await this.reloadVolunteers()
          // this.volunteers.push(...this.volunteers)
          //console.log('reloadId.visit.id', 'this.curIndex', this.curIndex, this.visit.id, this.isVisited(), this.isDelivered(), this.visit.status, VisitStatus.visited)
        }
      }
    }
  }

  async save() {
    await remult.repo(Visit).save(this.visit)
    this.ui.info('נשמר')
  }

  async reloadVolunteers() {
    this.volunteers = await this.vQuery.getVolunteers(this.visit?.id)
  }

  isDelivered() {
    return this.visit?.status?.id === VisitStatus.delivered.id
  }

  async delivered() {
    if (this.visit) {
      if (this.isDelivered()) {
        this.visit.status = VisitStatus.none
      }
      else {
        this.visit.status = VisitStatus.delivered
      }
      await remult.repo(Visit).save(this.visit)
    }
  }

  isVisited() {
    return this.visit?.status?.id === VisitStatus.visited.id
  }

  async visited() {
    if (this.visit) {
      if (this.isVisited()) {
        this.visit.status = VisitStatus.none
        this.visit.statusModified = undefined!
      }
      else {
        this.visit.status = VisitStatus.visited
        this.visit.statusModified = new Date()
      }
      await remult.repo(Visit).save(this.visit)
    }
  }

  back() {
    this.routeHelper.navigateToComponent(VisitsComponent)
  }

  async next() {
    if (this.visits?.length) {
      ++this.curIndex
      if (this.curIndex === this.visits.length) {
        this.curIndex = 0
      }
      this.visit = this.visits[this.curIndex]
      // await this.reloadVolunteers()
    }
    // if (this.curIndex >= this.visits.length - 1) {
    //   if (this.visits.length > 0) {
    //     ++this.args.page
    //     this.reload()
    //   }
    // }
    // else {
    //   ++this.curIndex
    //   this.visit = this.visits[this.curIndex]
    //   await this.reloadVolunteers()
    // }
    // //console.log('next', 'curIndex', this.curIndex, 'visits.length', this.visits.length)
  }

  async prev() {
    if (this.visits?.length) {
      --this.curIndex
      if (this.curIndex === -1) {
        this.curIndex = this.visits.length - 1
      }
      this.visit = this.visits[this.curIndex]
      // await this.reloadVolunteers()
    }
    // if (this.curIndex <= 0) {
    //   if (this.args.page > 1) {
    //     --this.args.page
    //     this.reload()
    //   }
    // }
    // else {
    //   --this.curIndex
    //   this.visit = this.visits[this.curIndex]
    // }
    // //console.log('prev', 'curIndex', this.curIndex, 'visits.length', this.visits.length)
  }

  // async next() {
  //   if (this.curIndex >= this.visits.length - 1) {
  //     if (this.visits.length > 0) {
  //       ++this.args.page
  //       this.reload()
  //     }
  //   }
  //   else {
  //     ++this.curIndex
  //     this.visit = this.visits[this.curIndex]
  //     await this.reloadVolunteers()
  //   }
  //   //console.log('next', 'curIndex', this.curIndex, 'visits.length', this.visits.length)
  // }

  // async prev() {
  //   if (this.curIndex <= 0) {
  //     if (this.args.page > 1) {
  //       --this.args.page
  //       this.reload()
  //     }
  //   }
  //   else {
  //     --this.curIndex
  //     this.visit = this.visits[this.curIndex]
  //   }
  //   //console.log('prev', 'curIndex', this.curIndex, 'visits.length', this.visits.length)
  // }

  uploading = false
  async onFileInput(e: any, target: string) {

    try {
      // console.log('busy - 1')
      this.uploading = true

      await this.busy.doWhileShowingBusy(
        async () => {
          // console.log('busy - 2')
          let s3 = new uploader(
            false,
            undefined!,
            undefined!,
            undefined!,
            undefined!)

          // console.log('busy - 3')
          var files = [] as string[]
          files.push(... await s3.handleFiles/*loadFiles*/(e.target.files))
          // console.log('busy - 4')
          if (files?.length) {
            // console.log('busy - 5')
            // await this.retrieve()
          }
        }
      )
    } finally {
      this.uploading = false
      // console.log('busy - 6')
    }

    // let s3 = new uploader(
    //   false,
    //   this.visit,
    //   undefined!,
    //   undefined!,
    //   undefined!)

    // await s3.loadFiles(e.target.files) //, target)
  }

  async uploadToBranch() {

  }

  async close() {
    this.routeHelper.navigateToComponent(VisitsComponent)
  }

  async addVisit() {
    this.routeHelper.navigateToComponent(VisitComponent)
  }

  async details(id = '') {
    this.routeHelper.navigateToComponent(VisitComponent)
  }

  async selectVolunteers() {
    let vols: { caption: string, id: string }[] = [] as { caption: string, id: string }[]
    let uc = new UserController()
    for (const v of await uc.getVoulnteers()) {
      let found = this.volunteers.find(u => u.volunteer?.id === v.id)
      if (!found) {
        vols.push({ caption: v.name, id: v.id })
      }
    }

    await this.ui.selectValuesDialog({
      allowAdd: true,
      title: 'בחירת מתנדבים',
      values: vols,
      onSelect: async (v) => { await this.addVolunteer(v.id) },
      onAdd: async (v) => { await this.addNewVolunteer(v.caption) }
    })
  }

  async addVolunteer(id = '') {
    //console.log(JSON.stringify(id))
    let tv = await remult.repo(VisitVolunteer).findFirst(
      {
        visit: { $id: this.visit?.id },
        volunteer: { $id: id }
      })
    if (!tv) {
      tv = remult.repo(VisitVolunteer).create()
      tv.visit = this.visit
      tv.volunteer = await remult.repo(User).findId(id)
    }
    await remult.repo(VisitVolunteer).save(tv)
    await this.reloadVolunteers()
  }

  async addNewVolunteer(name = '') {
    this.routeHelper.navigateToComponent(
      VolunteerComponent,
      {
        name: name,
        callback: 'visits',
        visitId: this.visit?.id
      })
  }

  async removeVolunteer(id = '', name = '') {

    let yes = await this.ui.yesNoQuestion(`?להסיר את ${name}`)
    if (yes) {
      let tv = await remult.repo(VisitVolunteer).findFirst({
        visit: { $id: this.visit?.id },
        volunteer: { $id: id }
      })
      if (tv) {
        await remult.repo(VisitVolunteer).delete(tv)
        await this.reloadVolunteers()
      }
    }
  }

  rootmenu() {
    this.routeHelper.navigateToComponent(UserMenuComponent)
  }

}
