import { Component, OnInit } from '@angular/core';
import { ChartOptions, ChartType } from 'chart.js';
import { Color, Label, SingleDataSet } from 'ng2-charts';
import { remult } from 'remult';
import { BranchGroup } from '../../branches/branchGroup';
import { openDialog, RouteHelperService } from '../../common-ui-elements';
import { firstDateOfWeek, lastDateOfWeek, resetDateTime } from '../../common/dateFunc';
import { JobController } from '../../jobs/jobController';
import { terms } from '../../terms';
import { UserMenuComponent } from '../../users/user-menu/user-menu.component';
import { VisitController } from '../visitController';
import { VisitsReadonlyComponent } from '../visits-readonly/visits-readonly.component';

@Component({
  selector: 'app-visits-chart',
  templateUrl: './visits-chart.component.html',
  styleUrls: ['./visits-chart.component.scss']
})
export class VisitsChartComponent implements OnInit {

  count = [] as { branch: string, name: string, tenants: number, delivers: number, visits: number, missings: number }[]

  query = new VisitController()
  jobs = new JobController()

  showAsList = false

  colors = [
    '#91D7D7',//green
    '#FAC090',//orange
    '#FDE098',//yello
    '#84C5F1',//blue
    '#FB9FB3',//red
    '36a2eb',//yellow2
    // 'cc65fe',//purple
    // '36a2eb',//blue2
    // 'ff6384'//red2
    // 'gray'
  ];
  barChartColors = [
    ...this.colors,
    'rgba(255, 99, 132, 0.6)',
    'rgba(54, 162, 235, 0.6)',
    'rgba(143, 103, 89, 0.6)',
    'rgba(68, 54, 122, 0.6)',
    'rgba(206, 188, 189, 0.6)',
    'rgba(100, 128, 0, 0.6)',
    'rgba(100, 55, 100, 0.6)',
    'rgba(55, 100, 55, 0.6)',
    'rgba(100, 54, 22, 0.6)',
    'rgba(100, 208, 100, 0.6)',
    'rgba(68, 54, 122, 0.6)',
    'rgba(100, 103, 55, 0.6)',
    'rgba(100, 128, 45, 0.6)',
    'rgba(255, 206, 86, 0.6)',
    'rgba(155, 103, 22, 0.6)',
    'rgba(240, 255, 0, 0.6)',
    'rgba(102, 34, 204, 0.6)',
    'rgba(155, 24, 22, 0.6)',
    'rgba(255, 55, 22, 0.6)',
    'rgba(55, 103, 55, 0.6)',
    'rgba(128, 54, 22, 0.6)'
  ]

  public pieChartColors: Color[] = [{ backgroundColor: this.barChartColors }];
  public pieChartType: ChartType = 'pie';
  public pieChartLabelsStatuses: Label[] = [];
  public pieChartDataStatuses: SingleDataSet = [];
  public pieChartPlugins = [];
  public pieChartLegend = true;
  public pieChartOptionsByStatuses: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    // onClick: (event: MouseEvent, legendItem: any) => {
    //   // this.openActivitiesByStatuses()
    //   return false;
    // },//type PositionType = 'left' | 'right' | 'top' | 'bottom' | 'chartArea';
    // title: { text: 'דיווחים', display: false },
    // maintainAspectRatio: false,
    // layout:ChartLayoutOptions
    // layout: { padding: { left: +28 } },
    legend: {
      // align: 'start',
      rtl: true,
      textDirection: 'rtl', align: 'center', fullWidth: true, display: true,
      position: 'bottom'
      // onClick: (event: MouseEvent, legendItem: any) => {
      //   // this.currentStatFilter = this.pieChartStatObjects[legendItem.index];

      //   return false;
      // }
    },
  };

  constructor(
    private routeHelper: RouteHelperService) {
    remult.user!.lastComponent = VisitsChartComponent.name
  }
  terms = terms;
  remult = remult;

  async ngOnInit(): Promise<void> {
    this.query.group = BranchGroup.fromId(remult.user!.group)
    await this.retrieve()
  }

  async groupChanged() {
    let group = BranchGroup.fromId(remult.user!.group)
    if (group) {
      if (group !== this.query.group) {
        console.log(`VisitsChartComponent.groupChanged to: ${group.id}`)
        this.query.group = group
        if (!this.showAsList) {
          await this.retrieve()
        }
      }
    }
  }

  async retrieve() {
    this.pieChartDataStatuses = [] as SingleDataSet;
    this.pieChartLabelsStatuses = [] as Label[];
    // await this.jobs.getLastWeeklyVisitsRun()
    // let date = this.jobs.lastJobRun
    let today = resetDateTime(new Date())
    this.query.fdate = firstDateOfWeek(today)
    this.query.tdate = lastDateOfWeek(today)
    // console.log(11)
    // console.log('CLIENT', this.query.fdate, this.query.tdate, this.query.detailed, this.query.type)
    this.count = await this.query.getWeeklyCounters()
    // console.log(22)
    this.pieChartColors = [{ backgroundColor: this.barChartColors }];
    if (remult.user?.isManager) {
      let countSum: { branch: string, name: string, tenants: number, delivers: number, visits: number, missings: number } =
        { branch: '', name: '', tenants: 0, delivers: 0, visits: 0, missings: 0 }
      if (this.count.length) {
        countSum = this.count[0]
      }
      this.pieChartDataStatuses.push(
        // countSum.delivers,
        countSum.visits,
        countSum.missings)
      // this.pieChartLabelsStatuses.slice(0)
      this.pieChartLabelsStatuses.push(
        // `מסרו: ${countSum.delivers}`,
        `נוכחו: ${countSum.visits}`,
        `חסרים: ${countSum.missings}`)
    }
    else {
      if (this.count.length) {
        for (const c of this.count) {
          this.pieChartDataStatuses.push(
            c.delivers + c.visits)
          this.pieChartLabelsStatuses.push(
            `${c.name}: ${c.delivers + c.visits}`)//.padEnd(20))
        }
      }
      else {
        this.pieChartDataStatuses.push(0)
        this.pieChartLabelsStatuses.push(`לא נמצאו כוללים עם דיווחים`)
      }
    }
  }

  async list() {
    // console.log('list clicked')
    this.showAsList = !this.showAsList
    if (!this.showAsList) {
      await this.retrieve()
    }
  }

  back() {
    this.routeHelper.navigateToComponent(UserMenuComponent)
  }

  async close() {
    this.routeHelper.navigateToComponent(UserMenuComponent)
  }

  public async chartClicked(e: any) {

    if (!remult.user?.isManager) {
      if (e.active && e.active.length > 0) {
        // console.log(e.active[0])
        let index = e.active[0]._index;
        let label = e.active[0]._model.label

        let branch = this.count[index] //.id
        // console.log(branch)

        // this.routeHelper.navigateToComponent(VisitsReadonlyComponent)
        openDialog(
          VisitsReadonlyComponent,
          self => self.args = { branch: branch.branch, name: branch.name })
        // , self => {
        //   let found = this.media.find(itm => branch.id === itm.branch.id)
        //   if (found) {
        //     let current = found.media.find(itm => m.id === itm.id)
        //     if (current) {
        //       self.args.media = found.media
        //       self.args.current = current
        //     }
        //   }
        // })
      }
    }
  }

  rootmenu() {
    this.routeHelper.navigateToComponent(UserMenuComponent)
  }

}
