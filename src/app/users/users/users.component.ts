import { Component, OnInit } from "@angular/core";
import { remult } from "remult";
import { BusyService } from "../../common-ui-elements";
import { GridSettings } from "../../common-ui-elements/interfaces";
import { saveToExcel } from "../../common-ui-elements/interfaces/src/saveGridToExcel";
import { UIToolsService } from "../../common/UIToolsService";
import { Roles } from "../roles";
import { User } from "../user";


@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  constructor(private ui: UIToolsService, private busyService: BusyService) {
  }
  isAdmin() {
    return remult.isAllowed(Roles.admin);
  }

  users: GridSettings<User> = new GridSettings<User>(remult.repo(User), {
    allowDelete: true,
    allowInsert: true,
    allowUpdate: true,
    columnOrderStateKey: "users",

    orderBy: { name: "asc" },
    rowsInPage: 100,

    columnSettings: users => [
      users.name,
      users.admin
    ],
    gridButtons: [{
      name: "Excel",
      click: () => saveToExcel(this.users, "users", this.busyService)
    }],
    // rowButtons: [{
    //   name: terms.resetPassword,
    //   click: async () => {

    //     if (await this.ui.yesNoQuestion(terms.passwordDeleteConfirmOf + " " + this.users.currentRow.name)) {
    //       await this.users.currentRow.resetPassword();
    //       this.ui.info(terms.passwordDeletedSuccessful);
    //     };
    //   }
    // }
    // ],
    confirmDelete: async (h) => {
      return await this.ui.confirmDelete(h.name)
    },
  });

  ngOnInit() {
  }
}
