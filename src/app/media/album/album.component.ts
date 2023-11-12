import { Component, OnInit } from '@angular/core';
// import exifr from 'exifr';
import { remult } from 'remult';
import { Branch } from '../../branches/branch';
import { BranchGroup } from '../../branches/branchGroup';
import { BusyService, RouteHelperService, openDialog } from '../../common-ui-elements';
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
    private busy: BusyService,
    private ui: UIToolsService /*,private upload:uploader*/) { }
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

  async onFileInput2(e: any, target: string) {
    // await this.uploader.run(e.target.files)

    // const files = await this.aws.run(e.target.files)
    // await this.db.run(files)
  }

  uploading = false
  async onFileInput(e: any, target: string) {

    // var exifr = require( 'exifr')
    // console.log('11')
    // let files3 = Array.from(e.target.files)
    // console.log('22')
    // let exifs = await Promise.all<any>(files3.map(exifr.parse))
    // console.log('33')
    // let dates = exifs.map(exif => exif.DateTimeOriginal.toGMTString())
    // console.log('44')
    // console.log(`${files3.length} photos taken on:`, dates)

    // var rec = remult.repo(Media).create()
    // rec.id = '7575'
    // rec.link = 'aws.7575'
    // await remult.repo(Media).save(rec)
    // await remult.repo(Media).insert({
    //   id: '7575',
    //   link: 'aws.7575'
    // })

    // let files1 = Array.from(e.target.files)
    // var f = e.target.files[0]
    // console.log('f', f)
    // console.log('f', JSON.stringify(f))
    // var exifr = require('exifr')
    // let ex = exifr.parse(f, true)
    // console.log('ex', ex)
    // return

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
            await this.retrieve()
          }
        }
      )
    } finally {
      this.uploading = false
      // console.log('busy - 6')
    }

    // console.log('busy - end')
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
