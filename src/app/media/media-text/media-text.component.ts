import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { UIToolsService } from '../../common/UIToolsService';

@Component({
  selector: 'app-media-text',
  templateUrl: './media-text.component.html',
  styleUrls: ['./media-text.component.scss']
})
export class MediaTextComponent implements OnInit {

  maxLength = 100

  args: {
    text: string,
    ok: boolean
  } = { text: '', ok: false }
  
  constructor(
    private dialogRef: MatDialogRef<any>,
    private ui: UIToolsService) { }

  ngOnInit(): void {
    if (!this.args) {
      this.args = { text: '', ok: false }
    }
  }

  async close() {
    this.dialogRef.close()
  }


  async save() {
    if (!this.args.text.trim().length) {
      this.ui.error('לא הוזן טקסט')
      return
    }
    this.args.ok = true
    this.close()
  }

}
