import { Allow, BackendMethod, Controller, ControllerBase, Fields, remult } from "remult";
import { Notification } from "./notification";

export interface notificationInfo {
    id: string
    fdate: Date,
    tdate: Date,
    date: Date,
    count: number,
    status: string
}

@Controller('notify')
export class notificationController extends ControllerBase {

}
