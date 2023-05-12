import { Allow, BackendMethod, Controller, ControllerBase, remult } from "remult";
import { TenantVolunteer } from "./TenantVolunteer";

@Controller('tenant')
export class TenantVolunteerController extends ControllerBase {

    @BackendMethod({ allowed: Allow.authenticated })
    async getVolunteers(id: string) {
        return await remult.repo(TenantVolunteer).find({
            where: {
                tenant: { $id: id }
            }
        })
    }

}
