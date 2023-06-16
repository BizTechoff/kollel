import { Allow, BackendMethod, Controller, ControllerBase, Field, remult } from "remult";
import { Branch } from "../branches/branch";
import { BranchGroup } from "../branches/branchGroup";
import { TenantVolunteer } from "../tenants/TenantVolunteer";
import { Tenant } from "../tenants/tenant";
import { Roles } from "./roles";
import { User } from "./user";
import { UserBranch } from "./userBranch";

@Controller('user')
export class UserController extends ControllerBase {


    @Field<UserController, BranchGroup>(() => BranchGroup, {
        caption: 'קבוצה'
    })
    group = BranchGroup.all

    @BackendMethod({ allowed: Allow.authenticated })
    async getVoulnteers(active = true) {
        let volunteers = await remult.repo(User).find({
            where: {
                active: active,
                volunteer: true,
                id: (await remult.repo(UserBranch).find({
                    where: {
                        branch: {
                            $id: (await remult.repo(Branch).find({
                                where: {
                                    active: true,
                                    id: remult.user!.branch
                                }
                            }))
                                .map(b => b.id)
                        }
                    }
                }))
                    .map(u => u.user.id)
            },
            orderBy: { name: 'asc' }
        })

        let tenants = await remult.repo(TenantVolunteer).find({
            where: {
                volunteer: volunteers,
                tenant: (await remult.repo(Tenant).find({ where: { branch: { $id: remult.user?.branch! } } }))
            }
        })

        for (const v of volunteers) {

            let found = tenants.filter(tv => tv.volunteer?.id === v.id)
            if (found) {
                v.tenantsNames =
                    found.sort((tv1, tv2) => tv1.tenant?.name.localeCompare(tv2.tenant?.name))
                        .map(tv => tv.tenant?.name)
            }
        }
        return volunteers
    }

    @BackendMethod({ allowed: [Roles.admin, Roles.donor] })
    async getManagers(active = true) {
        let managers = await remult.repo(User).find({
            where: {
                active: active,
                manager: true,
                id: (await remult.repo(UserBranch).find({
                    where: {
                        branch: {
                            $id: (await remult.repo(Branch).find({
                                where: {
                                    active: true,
                                    system: false,
                                    group: this.group === BranchGroup.all
                                        ? undefined!
                                        : this.group
                                }
                            })).map(b => b.id)
                        }
                    }
                })).map(u => u.user.id)
            },
            orderBy: { name: 'asc' }
        })

        let branches = await remult.repo(UserBranch).find({ where: { user: managers } })

        for (const m of managers) {
            let found = branches.filter(b => b?.user?.id === m.id)
            if (found) {
                m.branchesNames =
                    found.sort((ub1, ub2) => ub1.branch.name.localeCompare(ub2.branch.name)).map(tv => tv.branch.name)
            }
        }

        managers?.sort((m1, m2) => m1.branchesNames.join(',').localeCompare(m2.branchesNames.join(',')))

        return managers
    }

    @BackendMethod({ allowed: Allow.authenticated })
    async getUser(id: string) {
        let result!: User
        if (id?.trim().length) {
            result = await remult.repo(User).findId(id, { useCache: false })
        }
        return result
    }

}
