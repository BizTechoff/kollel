import { Allow, BackendMethod, Controller, ControllerBase, remult } from "remult";
import { Branch } from "../branches/branch";
import { UserBranch } from "../users/userBranch";
import { Tenant } from "./tenant";
import { TenantVolunteer } from "./TenantVolunteer";

@Controller('tenant')
export class TenantController extends ControllerBase {

    @BackendMethod({ allowed: Allow.authenticated })
    async getTenants(active = true) {
        let tenants = await remult.repo(Tenant).find({
            where: {
                active: active,
                branch: {
                    $id: (await remult.repo(Branch).find({ where: { active: true, id: remult.user!.branch } }))
                        .map(b => b.id)
                }
            },
            orderBy: { name: 'asc', address: 'asc' }
        })

        let volunteers = await remult.repo(TenantVolunteer).find({
            where: {
                tenant: tenants//,
                // volunteer: (await remult.repo(UserBranch).find({ where: { branch: { $id: remult.user?.branch! } } }))
                //     .map(ub => ub.user)
            }
        })

        for (const t of tenants) {
            let found = volunteers.filter(tv => tv.tenant?.id === t.id)// && tv.volunteer.active === active)
            if (found) {
                t.volunteersNames =
                    found.sort((tv1, tv2) => tv1.volunteer?.name.localeCompare(tv2.volunteer?.name))
                        .map(tv => `${tv.volunteer?.name} - ${tv.volunteer?.mobile}`)
            }
        }
        return tenants
    }

    @BackendMethod({ allowed: Allow.authenticated })
    async getTenant(id: string) {
        let result!: Tenant
        if (id?.trim().length) {
            result = await remult.repo(Tenant).findId(id, {})
            if (result) {
                result.volunteers = (await remult.repo(TenantVolunteer).find({ where: { tenant: result } }))
                    .map(r => r.volunteer)
            }
        }
        return result
    }

}
