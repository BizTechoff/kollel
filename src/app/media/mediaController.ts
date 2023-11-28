import { Allow, BackendMethod, Controller, ControllerBase, Field, remult } from "remult";
import { downloadByLink, upload } from "../../server/aws-s3";
// import { upload } from "../../server/aws-s3";
import { Branch } from "../branches/branch";
import { BranchGroup } from "../branches/branchGroup";
import { firstDateOfWeek, lastDateOfWeek } from "../common/dateFunc";
import { Roles } from "../users/roles";
import { Media } from "./media";
import { MediaType } from "./mediaTypes";

@Controller('media')
export class MediaController extends ControllerBase {

    @Field<MediaController, BranchGroup>(() => BranchGroup, { caption: 'קבוצה' })
    group = BranchGroup.all

    @BackendMethod({ allowed: Allow.authenticated })
    async getTenantPhotoLink(id: string) {
        let photo = await remult.repo(Media).findFirst({
            tenant: { $id: id },
            visit: undefined!,
            active: true
        })
        return photo?.link ?? ''
    }

    @BackendMethod({ allowed: Allow.authenticated })
    async getVolunteerPhotoLink(id: string) {
        let photo = await remult.repo(Media).findFirst({
            volunteer: { $id: id },
            visit: undefined!,
            active: true
        })
        return photo?.link ?? ''
    }

    @BackendMethod({ allowed: Allow.authenticated })
    async getPhotos2() {
        let result = [] as { branch: Branch, last: Date, media: Media[] }[]
        if (remult.user!.isAdmin || remult.user!.isDonor) {
            // console.log(1111)
            for await (const m of remult.repo(Media).query({
                where: {
                    active: true,
                    // type: MediaType.photo,
                    branch: await remult.repo(Branch).find({
                        where: {
                            group: this.group === BranchGroup.all
                                ? undefined!
                                : this.group
                        }
                    })
                },
                orderBy: { created: 'desc' }
            })) {
                // console.log(m.branch.id)
                let found = result.find(b => b.branch.id === m.branch.id)
                if (!found) {
                    found = { branch: m.branch, last: undefined!, media: [] as Media[] }
                    result.push(found)
                }
                if (!found.last || m.created > found.last) {
                    found.last = m.created
                }
                found.media.push(m)
            }
            // result.push(...
            //     await remult.repo(Media).find({
            //         where: {
            //             active: true
            //         },
            //         orderBy: { created: 'desc' }
            //     }))
        }
        else if (remult.user!.isManager) {
            for await (const m of remult.repo(Media).query({
                where: {
                    branch: { $id: remult.user?.branch! },
                    active: true
                },
                orderBy: { created: 'desc' }
            })) {
                // console.log(m.branch.id)
                let found = result.find(b => b.branch.id === m.branch.id)
                if (!found) {
                    found = { branch: m.branch, last: undefined!, media: [] as Media[] }
                    result.push(found)
                }
                if (!found.last || m.created > found.last) {
                    found.last = m.created
                }
                found.media.push(m)
            }


            // result.push(...
            //     await remult.repo(Media).find({
            //         where: {
            //             branch: { $id: remult.user?.branch! },
            //             active: true
            //         },
            //         orderBy: { created: 'desc' }
            //     }))
        }

        // result.sort((b1, b2) => b1.branch.name.localeCompare(b2.branch.name))

        return result
    }

    @BackendMethod({ allowed: Allow.authenticated })
    async getPhotos() {
        let result = [] as { week: string, branches: { branch: Branch, last: Date, media: Media[] }[] }[]
        let today = new Date()
        for await (const m of remult.repo(Media).query({
            where: {
                active: true,
                branch: (remult.user!.isAdmin || remult.user!.isDonor)
                    ? await remult.repo(Branch).find({
                        where: {
                            system: false,
                            active: true,
                            group: this.group === BranchGroup.all
                                ? undefined!
                                : this.group
                        }
                    })
                    : { $id: remult.user?.branch! }
            },
            orderBy: { branch: "asc", created: 'desc' }
        })) {
            
            let first = firstDateOfWeek(m.created)
            let last = lastDateOfWeek(m.created)
            let week = `שבוע ${first.getDate()}-${last.getDate()}.${last.getMonth() + 1}`

            let found = result.find(w => w.week === week)
            if (!found) {
                found = { week: week, branches: [] as { branch: Branch, last: Date, media: Media[] }[] }
                result.push(found)
            }
            let foundMonth = found.branches.find(b => b.branch.id === m.branch.id)
            if (!foundMonth) {
                foundMonth = { branch: m.branch, last: undefined!, media: [] as Media[] }
                found.branches.push(foundMonth)
            }
            if (!foundMonth.last || m.created > foundMonth.last) {
                foundMonth.last = m.created
            }
            foundMonth.media.push(m)
        }
        
        return result
    }

    @BackendMethod({ allowed: Allow.authenticated })
    async getPhotos3() {
        let result = [] as { branch: Branch, weeks: { week: string, last: Date, media: Media[] }[] }[]
        if (remult.user!.isAdmin || remult.user!.isDonor) {
            for await (const m of remult.repo(Media).query({
                where: {
                    active: true,
                    // type: MediaType.photo,
                    branch: await remult.repo(Branch).find({
                        where: {
                            system: false,
                            active: true,
                            group: this.group === BranchGroup.all
                                ? undefined!
                                : this.group
                        }
                    })
                },
                orderBy: { branch: "asc", created: 'desc' }
            })) {
                let found = result.find(b => b.branch.id === m.branch.id)
                if (!found) {
                    found = { branch: m.branch, weeks: [] as { week: string, last: Date, media: Media[] }[] }
                    result.push(found)
                }
                let first = firstDateOfWeek(m.created)
                let last = lastDateOfWeek(m.created)
                let week = `שבוע ${first.getDate()}-${last.getDate()}.${last.getMonth() + 1}`

                let founsWeek = found.weeks.find(w => w.week === week)
                if (!founsWeek) {
                    founsWeek = { week: week, last: undefined!, media: [] as Media[] }
                    found.weeks.push(founsWeek)
                }
                if (!founsWeek.last || m.created > founsWeek.last) {
                    founsWeek.last = m.created
                }
                founsWeek.media.push(m)
            }
            // result.push(...
            //     await remult.repo(Media).find({
            //         where: {
            //             active: true
            //         },
            //         orderBy: { created: 'desc' }
            //     }))
        }
        else if (remult.user!.isManager) {
            for await (const m of remult.repo(Media).query({
                where: {
                    branch: { $id: remult.user?.branch! },
                    active: true
                },
                orderBy: { created: 'desc' }
            })) {
                // console.log(22ack22)
                let found = result.find(b => b.branch.id === m.branch.id)
                if (!found) {
                    found = { branch: m.branch, weeks: [] as { week: string, last: Date, media: Media[] }[] }
                    result.push(found)
                }
                let first = firstDateOfWeek(m.created)
                let last = lastDateOfWeek(m.created)
                let week = `שבוע ${first.getDate()}-${last.getDate()}.${last.getMonth() + 1}`

                let founsWeek = found.weeks.find(w => w.week === week)
                if (!founsWeek) {
                    founsWeek = { week: week, last: undefined!, media: [] as Media[] }
                    found.weeks.push(founsWeek)
                }
                if (!founsWeek.last || m.created > founsWeek.last) {
                    founsWeek.last = m.created
                }
                founsWeek.media.push(m)
            }


            // result.push(...
            //     await remult.repo(Media).find({
            //         where: {
            //             branch: { $id: remult.user?.branch! },
            //             active: true
            //         },
            //         orderBy: { created: 'desc' }
            //     }))
        }

        // result.sort((b1, b2) => b1.branch.name.localeCompare(b2.branch.name))

        return result
    }

    @BackendMethod({ allowed: Allow.authenticated })
    async add(id: string, link: string): Promise<boolean> {
        let row = remult.repo(Media).create()
        row.branch = await remult.repo(Branch).findId(remult.user?.branch!)
        row.type = MediaType.photo
        row.link = link
        row.id = id
        await row.save()
        return true
    }

    @BackendMethod({ allowed: Allow.authenticated })
    async imageFromText(text: string): Promise<boolean> {
        let b = await remult.repo(Branch).findId(remult.user!.branch)
        if (b) {
            let email = b.email
            if (email?.trim().length) {
                let branchEngName = email.trim().split('@')[0]
                let file = await upload(text!, branchEngName)
                if (file.link?.trim().length) {
                    return this.add(file.id, file.link)
                }
            }
        }
        return false
    }

    @BackendMethod({ allowed: [Roles.admin, Roles.donor] })
    async download(link = '') {
        return await downloadByLink(link)
    }
}
