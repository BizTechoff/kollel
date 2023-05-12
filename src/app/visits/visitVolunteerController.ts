import { Allow, BackendMethod, Controller, ControllerBase, remult } from "remult";
import { VisitVolunteer } from "./visit-volunteer";

@Controller('visitVol')
export class VisitVolunteerController extends ControllerBase {

    @BackendMethod({ allowed: Allow.authenticated })
    async getVolunteers(visitId: string) {
        return await remult.repo(VisitVolunteer).find({
            where: {
                visit: { $id: visitId }
            }
        })
    }

}
