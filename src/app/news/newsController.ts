import { Allow, BackendMethod, Controller, ControllerBase, Field, Fields, remult } from "remult";
import { Branch } from "../branches/branch";
import { BranchGroup } from "../branches/branchGroup";
import { resetDateTime } from "../common/dateFunc";
import { Roles } from "../users/roles";
import { News } from "./news";
import { NewsUser } from "./newsUser";

@Controller('news')
export class NewsController extends ControllerBase {

    @Field<NewsController, BranchGroup>(() => BranchGroup, {
        caption: 'קבוצה'
    })
    group = BranchGroup.all

    @Fields.dateOnly<NewsController>({
        caption: 'מתאריך'
    })
    fdate!: Date

    @Fields.dateOnly<NewsController>({
        caption: 'עד תאריך'
    })
    tdate!: Date

    @BackendMethod<NewsController>({ allowed: Allow.authenticated })
    async getNews(id: string) {
        return await remult.repo(News).findFirst(
            {
                id: id //,
                // manager: { $id: remult.user?.id! }
            })
    }

    @BackendMethod<NewsController>({ allowed: Allow.authenticated })
    async getNewsUser(id: string) {
        return await remult.repo(NewsUser).findFirst(
            {
                news: { $id: id },
                manager: { $id: remult.user?.id! }
            })
    }

    @BackendMethod<NewsController>({ allowed: Allow.authenticated })
    async getWeeklyQuestion() {
        // console.log('SERVER 20',this.fdate, this.tdate)
        this.fdate = resetDateTime(this.fdate)
        this.tdate = resetDateTime(this.tdate)
        // console.log('SERVER 21',this.fdate, this.tdate)
        return await remult.repo(News).findFirst(
            {
                fdate: { "$lte": this.tdate },
                tdate: { "$gte": this.fdate },
                weeklyQuestion: true,
                active: true
                // manager: { $id: remult.user?.id! }
            })
    }

    @BackendMethod<NewsController>({ allowed: [Roles.admin, Roles.donor] })
    async getWeeklyQuestions() {
        return await remult.repo(News).findFirst(
            {
                // fdate: { "$lte": this.tdate },
                // tdate: { "$gte": this.fdate },
                weeklyQuestion: true,
                active: true
                // manager: { $id: remult.user?.id! }
            },
            {
                orderBy: { fdate: 'desc', tdate: 'desc' }
            })
    }

    @BackendMethod<NewsController>({ allowed: Roles.manager })
    async getWeeklyNews() {
        // console.log('SERVER 3',this.fdate, this.tdate)
        this.fdate = resetDateTime(this.fdate)
        this.tdate = resetDateTime(this.tdate)
        // console.log('SERVER 4',this.fdate, this.tdate)
        return await remult.repo(News).find({
            where: {
                fdate: { "$lte": this.tdate },
                tdate: { "$gte": this.fdate },
                active: true,
                weeklyQuestion: false,
                group: [
                    BranchGroup.all,
                    (await remult.repo(Branch).findFirst({
                        active: true,
                        id: remult.user?.branch
                    }))?.group]
            },
            orderBy: { fdate: 'desc', tdate: 'desc' }
        })
    }

    @BackendMethod<NewsController>({ allowed: [Roles.admin, Roles.donor] })
    async getNewses() {
        return await remult.repo(News).find({
            where: {
                // fdate: { "$lte": this.tdate },
                // tdate: { "$gte": this.fdate },
                active: true,
                weeklyQuestion: false,
                group: this.group === BranchGroup.all
                    ? undefined!
                    : [this.group, BranchGroup.all]
            },
            orderBy: { fdate: 'desc', tdate: 'desc' }
        })
    }

}
