import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { remult } from 'remult';
import { BranchGroup } from '../branchGroup';

@Component({
  selector: 'app-branch-group',
  templateUrl: './branch-group.component.html',
  styleUrls: ['./branch-group.component.scss']
})
export class BranchGroupComponent implements OnInit {

  @Input() readonly = false

  @Output() groupChanged = new EventEmitter(true)
  selected = BranchGroup.fromId(remult.user!.group)

  constructor() { }
  remult = remult
  BranchGroup = BranchGroup

  ngOnInit(): void {
  }

  async onGroupChanged(group: BranchGroup) {
    remult.user!.group = group.id
    this.groupChanged.emit()
  }

}
