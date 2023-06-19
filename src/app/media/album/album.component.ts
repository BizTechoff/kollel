import { Component, OnInit } from '@angular/core';
import { remult } from 'remult';
import { Branch } from '../../branches/branch';
import { BranchGroup } from '../../branches/branchGroup';
import { RouteHelperService, openDialog } from '../../common-ui-elements';
import { UIToolsService } from '../../common/UIToolsService';
import { uploader } from '../../common/uploader';
import { terms } from '../../terms';
import { UserMenuComponent } from '../../users/user-menu/user-menu.component';
import { GalleryComponent } from '../gallery/gallery.component';
import { Media } from '../media';
import { MediaController } from '../mediaController';
import { MediaType } from '../mediaTypes';

@Component({
  selector: 'app-album',
  templateUrl: './album.component.html',
  styleUrls: ['./album.component.scss']
})
export class AlbumComponent implements OnInit {

  media = [] as { week: string, branches: { branch: Branch, last: Date, media: Media[] }[] }[]
  query = new MediaController()

  constructor(
    private routeHelper: RouteHelperService,
    private ui: UIToolsService) { }
  MediaType = MediaType
  terms = terms;
  remult = remult;

  async ngOnInit(): Promise<void> {
    remult.user!.lastComponent = AlbumComponent.name
    this.query.group = BranchGroup.fromId(remult.user!.group)
    await this.retrieve()
  }

  async retrieve() {
    this.media = await this.query.getPhotos()
    // console.log(this.media.length)
  }

  async groupChanged() {
    let group = BranchGroup.fromId(remult.user!.group)
    if (group) {
      console.log(`AlbumComponent.groupChanged: { this.query.group: ${this.query.group.id}, group: ${group.id}`)
      if (group !== this.query.group) {
        this.query.group = group
        await this.retrieve()
      }
    }
  }

  async mediaClicked(clicked: Media) {
    openDialog(GalleryComponent, self => {
        for (const w of this.media) {
      for (const b of w.branches) {
          for (const m of b.media) {
            if (m.id === clicked.id) {
              self.args.media = b.media
              self.args.current = m
              break;
            }
          }
        }
      }
      // let found = this.media.find(itm => branch.id === itm.branch.id)
      // if (found) {
      //   let current = found.media.find(itm => m.id === itm.id)
      //   if (current) {
      //     self.args.media = found.media
      //     self.args.current = current
      //   }
      // }
    })
  }

  // async gallery(branchId = '') {
  //   if (branchId?.trim().length) {
  //     this.routeHelper.navigateToComponent(GalleryComponent)
  //   }
  // }

  async onFileInput(e: any, target: string) {

    let s3 = new uploader(
      false,
      undefined!,
      undefined!,
      undefined!,
      undefined!)

    let files = await s3.loadFiles(e.target.files)
    if (files?.length) {
      await this.retrieve()
    }
  }

  async uploadText() {
    let result = await this.ui.selectText()
    if (result.ok) {
      let success = await this.query.imageFromText(
        result.text
      )
      if (success) {
        await this.retrieve()
      }
      // console.log(`'uploadText': ${success}`)
    }
  }

  back() {
    this.routeHelper.navigateToComponent(UserMenuComponent)
  }

  close() {
    this.routeHelper.navigateToComponent(UserMenuComponent)
  }

  rootmenu() {
    this.routeHelper.navigateToComponent(UserMenuComponent)
  }

}
