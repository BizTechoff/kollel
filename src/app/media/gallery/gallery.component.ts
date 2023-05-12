import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { remult } from 'remult';
import { UIToolsService } from '../../common/UIToolsService';
import { Media } from '../media';
import { MediaController } from '../mediaController';

@Component({
  selector: 'app-gallery',
  // template: '<gallery [items]="images"></gallery>',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.scss']
})
export class GalleryComponent implements OnInit {

  args: {
    media: Media[],
    current?: Media
  } = {
      media: [] as Media[]
    }
  query = new MediaController()

  constructor(
    private dialogRef: MatDialogRef<any>,
    private ui: UIToolsService) { }
    remult=remult

  async ngOnInit() {

    if (!this.args) {
      this.args = { media: [] as Media[] }
    }
    if (!this.args.current) {
      if (this.args.media.length)
        this.args.current = this.args.media[0]
    }
  }

  async next() {
    if (this.args.current) {
      let i = this.args.media.indexOf(this.args.current)
      if (i >= 0) {
        ++i
        if (i >= this.args.media.length) {
          i = 0
        }
        this.args.current = this.args.media[i]
      }
    }
  }

  async prev() {
    if (this.args.current) {
      let i = this.args.media.indexOf(this.args.current)
      if (i >= 0) {
        --i
        if (i < 0) {
          i = this.args.media.length - 1
        }
        this.args.current = this.args.media[i]
      }
    }
  }

  close() {
    this.dialogRef.close()
  }

  async copy() {
    if (this.args.current) {
      navigator.clipboard.writeText(this.args.current.link)
      // this.clipboard.writeText(this.args.current.link);
      this.ui.info('לינק הועתק לזיכרון')
    }
  }

  async download() {
    if (this.args.current) {
      window.open(this.args.current.link, '_blank')
      // window.URL.revokeObjectURL(this.args.current.link)
      // let success = await this.query.download(this.args.current.link)
      // if (!success) {
      //   this.ui.info('ההורדה נכשלה')
      // }
    }
  }

}
