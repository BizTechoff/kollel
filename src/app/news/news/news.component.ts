import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { remult } from 'remult';
import { BranchGroup } from '../../branches/branchGroup';
import { RouteHelperService } from '../../common-ui-elements';
import { UIToolsService } from '../../common/UIToolsService';
import { uploader } from '../../common/uploader';
import { terms } from '../../terms';
import { UserMenuComponent } from '../../users/user-menu/user-menu.component';
import { News } from '../news';
import { NewsController } from '../newsController';
import { NewsesComponent } from '../newses/newses.component';

@Component({
  selector: 'app-news',
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.scss']
})
export class NewsComponent implements OnInit {

  news!: News
  languages = [] as { caption: string, id: string }[]
  query = new NewsController()
  page = 1
  tenantPhotoLink = ''
  groups = BranchGroup.getOptions()

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
  BranchGroup = BranchGroup

  async ngOnInit(): Promise<void> {
    if (!this.args) {
      this.args = { id: '' }
    }
    this.args.id = this.route.snapshot.paramMap.get('id') ?? '';
    if (this.args.id?.trim().length) {
      this.news = await this.query.getNews(this.args.id)
      // this.news = this.news
    }
    else {
      this.news = remult.repo(News).create()
      this.news.active = true
    }
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
    }
  }

  async save() {
    await remult.repo(News).save(this.news)
    this.back()
  }

  back() {
    this.routeHelper.navigateToComponent(NewsesComponent)
  }

  async close() {
    this.routeHelper.navigateToComponent(NewsesComponent)
  }

  rootmenu() {
    this.routeHelper.navigateToComponent(UserMenuComponent)
  }

}
