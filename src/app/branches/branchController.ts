import { Allow, BackendMethod, Controller, ControllerBase, Field, remult } from "remult";
import { Tenant } from "../tenants/tenant";
import { User } from "../users/user";
import { UserBranch } from "../users/userBranch";
import { Branch } from "./branch";
import { BranchGroup } from "./branchGroup";

@Controller('branch')
export class BranchController extends ControllerBase {

    @Field<BranchController, BranchGroup>(() => BranchGroup, {
        caption: 'קבוצה'
    })
    group = BranchGroup.all

    @BackendMethod({ allowed: Allow.authenticated })
    async getBranches(counter = false) {
        // console.log('g',this.group)
        let result = await remult.repo(Branch).find({
            where: {
                system: false,
                active: true,
                group: this.group === BranchGroup.all
                    ? undefined!
                    : this.group
            },
            orderBy: { name: 'asc' }
        })

        if (counter) {
            for (const b of result) {
                b.tenantsCount = await remult.repo(Tenant).count({
                    branch: b,
                    active: true
                })
                // b.volunteersCount = await remult.repo(User).count({
                //     active: true,
                //     volunteer: true,
                //     id: (await remult.repo(UserBranch).find({ where: { branch: b } })).map(ub => ub.user?.id)
                // })
            }
        }

        return result
    }

    @BackendMethod({ allowed: Allow.authenticated })
    async getBranch(id: string) {
        return await remult.repo(Branch).findFirst(
            {
                id: id
            })
    }

}
