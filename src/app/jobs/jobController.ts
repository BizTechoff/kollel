import { Allow, BackendMethod, Controller, ControllerBase, Fields, remult } from "remult";
import { resetDateTime } from "../common/dateFunc";
import { Job } from "./job";
import { JosStatus } from "./jobStatus";

@Controller('job')
export class JobController extends ControllerBase {


    @Fields.dateOnly<JobController>({
        caption: 'ריצה אחרונה'
    })
    lastJobRun!: Date


    @BackendMethod({ allowed: Allow.authenticated })
    async getLastWeeklyVisitsRun() {
        this.lastJobRun = resetDateTime(new Date())
        let lastJob = await remult.repo(Job).findFirst(
            {
                name: 'createWeeklyVisits',
                status: JosStatus.done
            },
            {
                orderBy: { date: 'desc' }
            })
        if (lastJob) {
            this.lastJobRun = lastJob.date
        }
    }

}
