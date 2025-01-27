import { Allow, BackendMethod, Controller, ControllerBase, Field, Fields, remult } from "remult";
import { Branch } from "../branches/branch";
import { BranchGroup } from "../branches/branchGroup";
import { DataControl } from "../common-ui-elements/interfaces";
import { firstDateOfWeek, lastDateOfWeek, resetDateTime } from "../common/dateFunc";
import { Tenant } from "../tenants/tenant";
import { Roles } from "../users/roles";
import { Visit } from "./visit";
import { VisitVolunteer } from "./visit-volunteer";
import { VisitStatus } from "./visitStatus";
import { ExportType } from "./visits-export/exportType";

export interface exportDataRow {
    // "excelLine": number;
    // "import-status": string;
    // "error"?: string;
    [caption: string]: any;
}

let hebrewMonths = [
    'ינואר',
    'פברואר',
    'מרץ',
    'אפריל',
    'מאי',
    'יוני',
    'יולי',
    'אוגוסט',
    'ספטמבר',
    'אוקטובר',
    'נובמבר',
    'דצמבר'
]

const COLUMN_BRANCH = 'כולל'
const COLUMN_TENANT = 'דייר'
const COLUMN_VOLUNTEERS = 'מתנדבים'
const COLUMN_DELIVERED = 'מסרו'
const COLUMN_VISITED = 'ביקרו'

@Controller('visit')
export class VisitController extends ControllerBase {

    // @DataControl<VisitController,Branch>({readonly: true})
    @Field<VisitController, Branch>(() => Branch, {
        caption: 'כולל', displayValue: (row, col) => col?.name
    })
    branch!: Branch

    @DataControl({ clickIcon: 'edit' })
    @Fields.dateOnly<VisitController>({
        caption: 'מתאריך'
    })
    fdate!: Date

    @Fields.dateOnly<VisitController>({
        caption: 'עד תאריך'
    })
    tdate!: Date

    @Fields.boolean<VisitController>({
        caption: 'מפורט'
    })
    detailed = false

    @Field<VisitController, ExportType>(() => ExportType, {
        caption: 'סוג ייצוא'
    })
    type = ExportType.done

    @Field<VisitController, BranchGroup>(() => BranchGroup, {
        caption: 'קבוצה'
    })
    group = BranchGroup.fromId(remult.user!.group)

    @Fields.boolean<VisitController>({
        caption: 'בפועל'
    })
    actual = false


    @BackendMethod({ allowed: [Roles.admin, Roles.donor] })
    async getVisitsByBranch() {
        // console.log('SERVER 3',this.fdate, this.tdate, this.detailed, this.type.id, this.group.id)
        this.fdate = resetDateTime(this.fdate)
        this.tdate = resetDateTime(this.tdate)
        // console.log('SERVER 4',this.fdate, this.tdate, this.detailed, this.onlyDone)
        let result = [] as { branch: string, /*rows: Visit[],*/ summary: { count: number, delivered: number, visited: number } }[]
        for await (const v of remult.repo(Visit).query(
            {
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
                    },
                    date: {
                        "$gte": this.fdate,
                        "$lte": this.tdate
                    }
                }
            })) {

            let found = result.find(b => b.branch === v.branch.name)
            if (!found) {
                found = {
                    branch: v.branch.name,
                    summary: { count: 0, delivered: 0, visited: 0 }
                }
                result.push(found)
            }
            found.summary.delivered += v.status === VisitStatus.delivered ? 1 : 0
            found.summary.visited += v.status === VisitStatus.visited ? 1 : 0
            found.summary.count += 1
        }
        for (const b of result) {
            b.summary.count = b.summary.count - (b.summary.delivered + b.summary.visited)
        }
        // for (const b of result) {
        //     console.log('b.summary.count',b.summary.count)
        // }
        // console.log('125')
        // result = result.filter(c => (c.delivers + c.visits) > 0)
        result.sort((c1, c2) => c1.branch.localeCompare(c2.branch))
        return result
    }

    @BackendMethod({ allowed: Allow.authenticated })
    async getVisit(id: string) {
        let result!: Visit
        if (id?.trim().length) {
            result = await remult.repo(Visit).findId(id)
        }
        return result
    }

    @BackendMethod({ allowed: Allow.authenticated })
    async getVisits() {
        // console.log('SERVER 5',this.fdate, this.tdate, this.detailed, this.onlyDone)
        this.fdate = resetDateTime(this.fdate)
        this.tdate = resetDateTime(this.tdate)
        // console.log('SERVER 6',this.fdate, this.tdate, this.detailed, this.onlyDone)
        let rows = await remult.repo(Visit).find({
            where: {
                branch: {
                    $id: (await remult.repo(Branch).find({ where: { active: true, id: remult.user!.branch } }))
                        .map(b => b.id)
                },
                date: {
                    "$gte": this.fdate,
                    "$lte": this.tdate
                }//,
                // tenant: search?.trim().length ? await remult.repo(Tenant).find({ where: { name: { $contains: search } } }) : undefined!
            },
            orderBy: { status: 'asc', created: 'asc' }//,
            // limit: limit,
            // page: page
        })

        // for (const r of rows) {
        //     r.volunteersNames =
        //         (await remult.repo(VisitVolunteer).find({
        //             where: { visit: { $id: r.id } }
        //         }))
        //             .map(v => v.volunteer?.name).join(', ')
        // }

        return rows
    }

    @BackendMethod({ allowed: Allow.authenticated })
    async getVisitsReadOnly(branch = '',) {
        // console.log('SERVER 5',this.fdate, this.tdate, this.detailed, this.onlyDone)
        this.fdate = resetDateTime(this.fdate)
        this.tdate = resetDateTime(this.tdate)
        // console.log('SERVER 6',this.fdate, this.tdate, this.detailed, this.onlyDone)
        let rows = await remult.repo(Visit).find({
            where: {
                branch: {
                    $id: (await remult.repo(Branch).find({ where: { active: true, id: branch } }))
                        .map(b => b.id),
                    group: this.group === BranchGroup.all
                        ? undefined!
                        : this.group
                },
                status: this.type === ExportType.done
                    ? { '$ne': VisitStatus.none }
                    : this.type === ExportType.notDone
                        ? VisitStatus.none
                        : undefined!,
                date: {
                    "$gte": this.fdate,
                    "$lte": this.tdate
                }//,
                // tenant: search?.trim().length ? await remult.repo(Tenant).find({ where: { name: { $contains: search } } }) : undefined!
            },
            orderBy: { status: 'asc', created: 'asc' }//,
            // limit: limit,
            // page: page
        })

        for (const r of rows) {
            r.volunteersNames =
                (await remult.repo(VisitVolunteer).find({
                    where: { visit: { $id: r.id } }
                }))
                    .map(v => v.volunteer?.name).join(', ')
        }

        return rows
    }

    @BackendMethod({ allowed: Allow.authenticated })
    async getOpenVisitsCount() {
        // console.log('SERVER 7',this.fdate, this.tdate, this.detailed, this.onlyDone)
        this.fdate = resetDateTime(this.fdate)
        this.tdate = resetDateTime(this.tdate)
        // console.log('SERVER 8',this.fdate, this.tdate, this.detailed, this.onlyDone)
        return await remult.repo(Visit).count(
            {
                branch: { $id: remult.user!.branch },
                date: {
                    "$gte": this.fdate,
                    "$lte": this.tdate
                },
                status: VisitStatus.none
            }
        )
    }

    @BackendMethod({ allowed: Allow.authenticated })
    async getWeeklyCounters() {
        // console.log('SERVER',this.fdate, this.tdate, this.detailed, this.onlyDone)
        this.fdate = resetDateTime(this.fdate)
        this.tdate = resetDateTime(this.tdate)
        // console.log('SERVER 2',this.fdate, this.tdate, this.detailed, this.onlyDone)
        let count = [] as { branch: string, name: string, tenants: number, delivers: number, visits: number, missings: number }[]
        if (remult.user!.isAdmin || remult.user!.isDonor) {
            // console.log('123')
            for await (const v of remult.repo(Visit).query(
                {
                    where: {
                        branch: {
                            $id: (await remult.repo(Branch).find({
                                where: {
                                    active: true, system: false,
                                    group: this.group === BranchGroup.all
                                        ? undefined!
                                        : this.group
                                }
                            })).map(b => b.id)
                        },
                        date: {
                            "$gte": this.fdate,
                            "$lte": this.tdate
                        }
                    }
                })) {
                // v.date = resetDateTime(v.date)
                // console.log('visit',v.date)
                let found = count.find(b => b.name === v.branch.name)
                if (!found) {
                    // console.log('124')
                    found = {
                        branch: v.branch.id,
                        name: v.branch.name,
                        tenants: await remult.repo(Tenant).count({ active: true, branch: v.branch }),
                        delivers: 0,
                        visits: 0,
                        missings: 0
                    }
                    count.push(found)
                }
                found.delivers += v.status === VisitStatus.delivered ? 1 : 0
                found.visits += v.status === VisitStatus.visited ? 1 : 0
                found.missings += v.status === VisitStatus.none ? 1 : 0
            }
            // console.log('125')
            count = count.filter(c => (c.delivers + c.visits) > 0)
            count.sort((c1, c2) => c1.name.localeCompare(c2.name))
        }
        else if (remult.user!.isManager) {
            let rec: { branch: string, name: string, tenants: number, delivers: number, visits: number, missings: number } =
            {
                branch: remult.user!.branch,
                name: remult.user!.branchName,
                tenants: await remult.repo(Tenant).count({
                    branch: { $id: remult.user!.branch },
                    active: true
                }),
                delivers: 0,
                visits: 0,
                missings: 0
            }
            for await (const v of remult.repo(Visit).query(
                {
                    where: {
                        branch: {
                            $id: (await remult.repo(Branch).find({ where: { active: true, id: remult.user!.branch } }))
                                .map(b => b.id)
                        },
                        date: {
                            "$gte": this.fdate,
                            "$lte": this.tdate
                        }
                    }
                })) {
                rec.delivers += v.status === VisitStatus.delivered ? 1 : 0
                rec.visits += v.status === VisitStatus.visited ? 1 : 0
                rec.missings += v.status === VisitStatus.none ? 1 : 0
            }
            count.push(rec)
        }

        return count
    }

    createRow = () => [] as string[]

    async buildData() {
        var result: {
            month: string,
            weeks: string[],
            branches: {
                branch: string,
                totalPresented: number,
                totalPayed: number,
                tenants: {
                    tenant: string,
                    guide: boolean,
                    weeks: { name: string, presented: boolean, payed: number, remark: string, total: number }[],
                    totalPresented: number,
                    payed: number
                }[],
                weeks: { name: string, totalPresented: number, totalPayed: number }[]
            }[]
        }[] = [] as {
            month: string,
            weeks: string[],
            branches: {
                branch: string,
                totalPresented: number,
                totalPayed: number,
                tenants: {
                    tenant: string,
                    guide: boolean,
                    payed: number,
                    weeks: { name: string, presented: boolean, payed: number, remark: string, total: number }[],
                    totalPresented: number
                }[],
                weeks: { name: string, totalPresented: number, totalPayed: number }[]
            }[]
        }[]

        // this.fdate = resetDateTime(new Date(this.year, this.month, 1))
        // this.tdate = lastDateOfMonth(this.fdate)
        // var vMonthlyDates = [] as string[]

        for await (const v of remult.repo(Visit).query({
            where: {
                $and: [
                    this.actual
                        ? {
                            $or: [
                                { status: VisitStatus.delivered },
                                { status: VisitStatus.visited }
                            ]
                        }
                        : {}
                ],
                branch: remult.user?.isManager
                    ? { $id: remult.user.branch }
                    : this.branch ?
                        this.branch :
                        await remult.repo(Branch).find({
                            where:
                            {
                                active: true,
                                system: false,
                                group: this.group === BranchGroup.all
                                    ? undefined!
                                    : this.group
                            }
                        }),
                date: {
                    "$gte": this.fdate,
                    "$lte": this.tdate
                }
            },
            orderBy: { branch: 'asc', date: "asc" }
        })) {

            let month = `חודש ${hebrewMonths[v.date.getMonth()]}`

            var m = result.find(itm => itm.month === month)
            if (!m) {
                m = {
                    month: month,
                    weeks: [] as string[],
                    branches: [] as {
                        branch: string,
                        totalPresented: number,
                        totalPayed: number,
                        tenants: {
                            tenant: string,
                            guide: boolean,
                            payed: number,
                            weeks: { name: string, presented: boolean, payed: number, remark: string, total: number }[],
                            totalPresented: number
                        }[],
                        weeks: { name: string, totalPresented: number, totalPayed: number }[]
                    }[]
                }
                result.push(m)

                // let fdm = firstDateOfMonth(v.date)
                // let fdw = firstDateOfWeek(fdm)
            }

            let branch = v.branch?.name

            var b = m.branches.find(itm => itm.branch === branch)
            if (!b) {
                b = {
                    branch: branch,
                    totalPresented: 0,
                    totalPayed: 0,
                    tenants: [] as {
                        tenant: string,
                        guide: boolean,
                        payed: number,
                        weeks: { name: string, presented: boolean, payed: number, remark: string, total: number }[],
                        totalPresented: number
                    }[],
                    weeks: [] as { name: string, totalPresented: number, totalPayed: number }[]
                }
                m.branches.push(b)
            }

            let tenant = v.tenant?.name

            var t = b.tenants.find(itm => itm.tenant === tenant)
            if (!t) {
                t = {
                    tenant: tenant,
                    guide: false,
                    weeks: [] as { name: string, presented: boolean, payed: number, remark: string, total: number }[],
                    totalPresented: 0,
                    payed: 0
                }
                b.tenants.push(t)
            }

            let first = firstDateOfWeek(v.date)
            let last = lastDateOfWeek(v.date)

            let week = `שבוע ${('00' + (first.getDate())).slice(-2)}-${('00' + (last.getDate())).slice(-2)}.${('00' + (last.getMonth() + 1)).slice(-2)}`

            var w = t.weeks.find(itm => itm.name === week)
            if (!w) {
                w = {
                    name: week,
                    presented: v.status === VisitStatus.visited,
                    payed:
                        v.status === VisitStatus.visited
                            ? v.branch.payment
                            : v.status === VisitStatus.delivered
                                ? v.branch.payment / 2
                                : 0,
                    remark: v.remark,
                    total: 0
                }
                t.weeks.push(w)

                if (!m.weeks.includes(week)) {
                    m.weeks.push(week)
                }

                var bw = b.weeks.find(itm => itm.name === week)
                if (!bw) {
                    bw = { name: week, totalPresented: 0, totalPayed: 0 }
                    b.weeks.push(bw)
                }

                let add = w.presented ? 1 : 0
                let addPayed = w.payed
                // w.presented ? w.payed : 0

                bw.totalPresented += add
                b.totalPresented += add
                t.totalPresented += add
                w.total += add

                bw.totalPayed += addPayed
                b.totalPayed += addPayed
                t.payed += addPayed
                // w.payed += addPayed

            }
        }

        return result
    }


    @BackendMethod({ allowed: Allow.authenticated })
    async exportVisits3() {

        const isManager = remult.user?.isManager ?? false

        var data = await this.buildData()
        // console.log(JSON.stringify(data))
        // console.table(data[0].branches[0])
        var row = 0, col = 0
        var report = [] as string[][]

        report[row] = [] as string[]
        report[row][col] = 'בס"ד'
        for (const m of data) {
            col = 0
            row += 2
            report[row] = [] as string[]

            report[row][col] = m.month
            // headers
            col = 3
            // console.log('m.weeks 1',m.weeks)
            // m.weeks.sort((w1, w2) => w1.localeCompare(w2))
            // console.log('m.weeks 2',m.weeks)
            for (const w of m.weeks) {
                let s1 = w.replace('שבוע', '').trim().split('-')
                let s2 = s1[1].split('.')
                // console.log('s123',s1[0],s2[0],s2[1])
                let ww = parseInt(s1[0]) + '-' + parseInt(s2[0]) + '.' + parseInt(s2[1])

                report[row][col] = 'שבוע ' + ww
                col += 3
            }
            if (m.weeks.length > 1) {
                report[row][col] = 'סיכום '
            }

            col = 0
            row += 1
            report[row] = [] as string[]

            report[row][col] = 'כולל'
            // report[row][col + 1] = 'אחראי'
            report[row][col + 2] = this.group.single

            col = 3
            for (const w of m.weeks) {
                report[row][col] = 'נוכח'
                report[row][col + 1] = 'תשלום'
                report[row][col + 2] = 'הערה'
                col += 3
            }
            if (m.weeks.length > 1) {
                report[row][col] = 'נוכחים'
                report[row][col + 1] = 'תשלומים'
            }

            m.branches.sort((b1, b2) => b1.branch.localeCompare(b2.branch))
            let sumTotal = 0
            // values
            for (const b of m.branches) {

                col = 0
                row += 1
                report[row] = [] as string[]
                report[row][col] = b.branch
                report[row][col + 2] = b.tenants.length + ''
                // report[row][col + 3] = b.totalPayed + ''

                let sum = 0
                let sumPayed = 0
                col = 3

                b.weeks.sort((w1, w2) => w1.name.localeCompare(w2.name))
                for (const w of m.weeks) {
                    let ww = b.weeks.find(itm => itm.name === w)
                    if (ww) {
                        sum += ww.totalPresented
                        report[row][col] = ww.totalPresented + ''
                        sumPayed += ww.totalPayed
                        report[row][col + 1] = ww.totalPayed + ''
                    }
                    col += 3
                }

                if (m.weeks.length > 1) {
                    report[row][col] = sum + ''
                    report[row][col + 1] = sumPayed + ''
                }

                if (this.detailed) {
                    b.tenants.sort((t1, t2) => t1.tenant.localeCompare(t2.tenant))
                    for (const t of b.tenants) {
                        col = 0
                        row += 1
                        report[row] = [] as string[]
                        // report[row][col + 1] = t.guide ? 'אחראי' : ''
                        report[row][col + 2] = t.tenant
                        // report[row][col + 3] = 15 + t.payed + ''

                        col = 3
                        t.weeks.sort((w1, w2) => w1.name.localeCompare(w2.name))
                        for (const w of m.weeks) {
                            let ww = t.weeks.find(itm => itm.name === w)
                            if (ww) {

                                report[row][col] = ww.presented ? 'כן' : ''
                                report[row][col + 2] = ww.remark
                                report[row][col + 1] = ww.payed + ''
                            }
                            // report[brow /****/][col] = 1000000 + '' // w.total + ''
                            // report[brow /****/][col] = w.total + ''

                            col += 3
                        }
                        if (m.weeks.length > 1) {
                            report[row][col] = t.totalPresented + ''
                            report[row][col + 1] = t.payed + ''
                        }
                    }
                }
            }

            if (m.weeks.length > 1) {
                // report[row][col] = sumTotal + ''
                // console.log('sumTotal', sumTotal)
            }
        }
        // console.table(report)
        return report
    }

    @BackendMethod({ allowed: Allow.authenticated })
    async exportVisits2() {

        let report: {
            wgodh: string,
            months: {
                month: {
                    name: string, col: number,
                    weeks: { week: { caption: string, day: number, month: number, col: number } }[],
                    presentedCount: number,
                    branch: { name: string, tenantsCount: number, presentedCount: number, guidesCount: number },
                    tenants: { name: string, presented: boolean, remark: string, guide: boolean }
                }
            }[]
        } = {
            wgodh: 'בס"ד', months: [] as {
                month: {
                    name: string, col: number,
                    weeks: { week: { caption: string, day: number, month: number, col: number } }[],
                    presentedCount: number,
                    branch: { name: string, tenantsCount: number, presentedCount: number, guidesCount: number },
                    tenants: { name: string, presented: boolean, remark: string, guide: boolean }
                }
            }[]
        }//, sum: number

        var data = [] as string[][]
        var row = { index: 0, add: () => [] as string[] }
        var colInterval = 2

        data[row.index] = row.add()
        data[row.index][0] = report.wgodh

        for (const m of report.months) {
            row.index += 1
            data[row.index] = row.add()

            var col = 0
            data[row.index][col] = m.month.name
            for (const w of m.month.weeks) {
                col += colInterval
                data[row.index][col] = w.week.caption
            }
            data[row.index][col + colInterval] = 'סיכום חודשי'

            row.index += 1
            data[row.index] = row.add()

            col = 0
            data[row.index][col] = 'כולל'
            data[row.index][col + 2] = 'אברך'
            col += 1
            for (const w of m.month.weeks) {
                col += colInterval
                data[row.index][col] = 'נוכחו'
                data[row.index][col] = 'הערות'
            }
            data[row.index][col + colInterval] = 'b-name'

            // for (const b of m.month.branches) {
            //     row.index += 1
            //     data[row.index] = row.add()

            //     data[row.index][0] = b.name

            //     row.index += 1
            //     data[row.index] = row.add()

            //     for (const t of b.tenants) {
            //         data[row.index][col + 2] = t.name
            //         data[row.index][col + 3] = t.presented ? 'כן' : ''
            //         data[row.index][col + 4] = t.remark
            //     }
            // }

        }

        for await (const v of remult.repo(Visit).query({
            where: {
                $and: [
                    this.actual
                        ? {
                            $or: [
                                { status: VisitStatus.delivered },
                                { status: VisitStatus.visited }
                            ]
                        }
                        : {}
                ],
                branch: remult.user?.isManager
                    ? { $id: remult.user.branch }
                    : await remult.repo(Branch).find({
                        where:
                        {
                            active: true,
                            system: false,
                            group: this.group === BranchGroup.all
                                ? undefined!
                                : this.group
                        }
                    }),
                date: {
                    "$gte": this.fdate,
                    "$lte": this.tdate
                }
            },
            orderBy: { branch: 'asc', date: "asc" }
        })) {

            let monthCaption = `חודש ${hebrewMonths[v.date.getMonth()]}`
            // var item = report.find(itm => itm.month.caption === monthCaption)
            // if (!item) {
            //     item = { month: { caption: monthCaption, sum: 0 } }
            // }


            /*
                let d = [] as {
                    months: {
                    month: { caption: string, sum: number },
                    branch: { name: string, tenantsCount: number, presentedCount: number, guidesCount: number },
                    tenants: { name: string, presented: boolean, remark: string, guide: boolean },
                    weeks: { week: { caption: string, day: number, month: number } }[]
                }}[]
            */
        }

        return report
    }

    @BackendMethod({ allowed: Allow.authenticated })
    async exportVisits() {

        let data = [] as {
            month: string,
            branches: {
                branch: string,
                totalTenants: number,
                totalVolunteers: number,
                totalDelivered: number,
                totalVisited: number,
                weeksCounter: string[],
                // deletedWeeks: [],//???????????????????????????????????????????????????
                weeks: {
                    week: string,
                    visits: {
                        tenant: string,
                        tenantIdNumber: string,
                        tenantRemark: string,
                        volunteers: string[],
                        delivered: string,
                        visited: string
                    }[],
                    totalTenants: number,
                    totalVolunteers: number,
                    totalDelivered: number,
                    totalVisited: number
                }[]
            }[]
        }[]

        // build visits-volunteers
        // let visitVolunteers = [] as { visitId: string, volunteersNames: string[] }[]
        // for await (const vv of remult.repo(VisitVolunteer).query({
        //     where: {
        //         visit: await remult.repo(Visit).find({
        //             where: {
        //                 $and: [
        //                     this.actual
        //                         ? {
        //                             $or: [
        //                                 { status: VisitStatus.delivered },
        //                                 { status: VisitStatus.visited }
        //                             ]
        //                         }
        //                         : {}
        //                 ],
        //                 branch: remult.user?.isManager
        //                     ? { $id: remult.user.branch }
        //                     : await remult.repo(Branch).find({
        //                         where:
        //                         {
        //                             active: true,
        //                             system: false,
        //                             group: this.group === BranchGroup.all
        //                                 ? undefined!
        //                                 : this.group
        //                         }
        //                     }),
        //                 date: {
        //                     "$gte": this.fdate,
        //                     "$lte": this.tdate
        //                 }
        //             }
        //         })
        //     }
        // })) {
        //     let found = visitVolunteers.find(v => v.visitId === vv.visit.id)
        //     if (!found) {
        //         found = { visitId: vv.visit.id, volunteersNames: [] as string[] }
        //         visitVolunteers.push(found)
        //     }
        //     if (!found.volunteersNames.includes(vv.volunteer.name)) {
        //         found.volunteersNames.push(vv.volunteer.name)
        //     }
        // }

        let weeksOrder = [] as { monthKey: string, month: string, weeks: { key: string, week: string }[] }[]

        let branchWeek = [] as { key: string, volunteers: string[] }[]
        let totalWeek = [] as { week: string, tt: number, tvol: number, td: number, tv: number }[]

        // build data
        for await (const v of remult.repo(Visit).query({
            where: {
                $and: [
                    this.actual
                        ? {
                            $or: [
                                { status: VisitStatus.delivered },
                                { status: VisitStatus.visited }
                            ]
                        }
                        : {}
                ],
                branch: remult.user?.isManager
                    ? { $id: remult.user.branch }
                    : await remult.repo(Branch).find({
                        where:
                        {
                            active: true,
                            system: false,
                            group: this.group === BranchGroup.all
                                ? undefined!
                                : this.group
                        }
                    }),
                date: {
                    "$gte": this.fdate,
                    "$lte": this.tdate
                }
            },
            orderBy: { branch: 'asc', date: "asc" }
        })) {

            let month = `חודש ${hebrewMonths[v.date.getMonth()]}`

            // set monthsWeeks
            let motiw = weeksOrder.find(itm => itm.month === month)
            if (!motiw) {
                motiw = {
                    monthKey: `${v.date.getFullYear()}-${('0' + (v.date.getMonth() + 1)).slice(-2)}`,
                    month: month,
                    weeks: [] as { key: string, week: string }[]
                }
                weeksOrder.push(motiw)
            }

            let foundMonth = data.find(d => d.month === month)
            if (!foundMonth) {
                foundMonth = {
                    month: month,
                    branches: [] as {
                        branch: string,
                        totalTenants: number,
                        totalVolunteers: number,
                        totalDelivered: number,
                        totalVisited: number,
                        weeksCounter: string[],
                        weeks: {
                            week: string,
                            visits: {
                                tenant: string,
                                tenantIdNumber: string,
                                tenantRemark: string,
                                volunteers: string[],
                                delivered: string,
                                visited: string
                            }[],
                            totalTenants: number,
                            totalVolunteers: number,
                            totalDelivered: number,
                            totalVisited: number
                        }[]
                    }[]
                }
                data.push(foundMonth)
            }

            let branch = v.branch!.name
            let foundBranch = foundMonth.branches.find(b => b.branch === branch)
            if (!foundBranch) {
                foundBranch = {
                    branch: branch,
                    totalTenants: 0,
                    totalVolunteers: 0,
                    totalDelivered: 0,
                    totalVisited: 0,
                    weeksCounter: [] as string[],
                    weeks: [] as {
                        week: string,
                        visits: {
                            tenant: string,
                            tenantIdNumber: string,
                            tenantRemark: string,
                            volunteers: string[],
                            delivered: string,
                            visited: string
                        }[],
                        totalTenants: number,
                        totalVolunteers: number,
                        totalDelivered: number,
                        totalVisited: number
                    }[]
                }
                foundMonth.branches.push(foundBranch)
            }

            let first = firstDateOfWeek(v.date)
            let last = lastDateOfWeek(v.date)
            let week = `שבוע ${first.getDate()}-${last.getDate()}.${last.getMonth() + 1}`

            let motib = motiw.weeks.find(itm => itm.week === week)
            if (!motib) {
                motib = {
                    key: `${first.getFullYear()}-${('0' + (first.getMonth() + 1)).slice(-2)}-${('0' + (first.getDate())).slice(-2)}`,
                    week: week
                }
                motiw.weeks.push(motib)
            }

            let foundWeek = foundBranch.weeks.find(w => w.week === week)
            if (!foundWeek) {
                foundWeek = {
                    week: week,
                    visits: [] as {
                        tenant: string,
                        tenantIdNumber: string,
                        tenantRemark: string,
                        volunteers: string[],
                        delivered: string,
                        visited: string
                    }[],
                    totalTenants: 0,
                    totalVolunteers: 0,
                    totalDelivered: 0,
                    totalVisited: 0
                }
                foundBranch.weeks.push(foundWeek)
                foundBranch.weeksCounter.push(foundWeek.week)
            }

            // let f = visitVolunteers.find(vv => vv.visitId === v.id)

            // let volunteers = f ? f.volunteersNames : []
            foundBranch.totalTenants += 1
            foundBranch.totalDelivered += v.status === VisitStatus.delivered ? 1 : 0
            foundBranch.totalVisited += v.status === VisitStatus.visited ? 1 : 0

            if (this.detailed) {
                foundWeek.visits.push({
                    tenant: v.tenant.name,
                    tenantIdNumber: v.tenant.idNumber,
                    tenantRemark: v.remark,
                    volunteers: [] as string[],
                    delivered: v.status === VisitStatus.delivered ? 'כן' : '',
                    visited: v.status === VisitStatus.visited ? 'כן' : ''
                })
            }
            foundWeek.totalTenants += 1
            foundWeek.totalDelivered += v.status === VisitStatus.delivered ? 1 : 0
            foundWeek.totalVisited += v.status === VisitStatus.visited ? 1 : 0

            let key = foundBranch.branch + '-' + foundWeek.week
            let fbw = branchWeek.find(bw => bw.key === key)
            if (!fbw) {
                fbw = { key: key, volunteers: [] as string[] }
                branchWeek.push(fbw)
            }
            // for (const vol of volunteers) {
            //     if (!fbw.volunteers.includes(vol)) {
            //         fbw.volunteers.push(vol)
            //         foundWeek.totalVolunteers += 1
            //     }
            // }
        }// for each visit

        for (let mi = data.length - 1; mi >= 0; --mi) {
            const m = data[mi];
            for (let bi = m.branches.length - 1; bi >= 0; --bi) {
                const b = m.branches[bi];
                for (let wi = b.weeks.length - 1; wi >= 0; --wi) {
                    const w = b.weeks[wi];

                    switch (this.type) {

                        case ExportType.done: {
                            if (w.totalDelivered + w.totalVisited === w.totalTenants) {
                            }
                            else {
                                let i = b.weeks.indexOf(w)
                                b.weeks.splice(i, 1)
                                if (!b.weeks.length) {
                                    i = m.branches.indexOf(b)
                                    m.branches.splice(i, 1)
                                }
                            }
                            break;
                        }

                        case ExportType.doneAndNotDone: {
                            if (w.totalDelivered + w.totalVisited) { }
                            else {
                                let i = b.weeks.indexOf(w)
                                b.weeks.splice(i, 1)
                                if (!b.weeks.length) {
                                    i = m.branches.indexOf(b)
                                    m.branches.splice(i, 1)
                                }
                            }
                            break;
                        }

                        case ExportType.notDone: {
                            if (w.totalDelivered + w.totalVisited === 0) { }
                            else {
                                let i = b.weeks.indexOf(w)
                                b.weeks.splice(i, 1)
                                if (!b.weeks.length) {
                                    i = m.branches.indexOf(b)
                                    m.branches.splice(i, 1)
                                }
                            }
                            break;

                        }
                    }
                }

            }
        }

        weeksOrder.sort((a, b) => a.monthKey.localeCompare(b.monthKey))
        for (const motic of weeksOrder) {
            motic.weeks.sort((a, b) => a.key.localeCompare(b.key))
        }

        // build totals
        for (const m of data) {
            for (const b of m.branches) {
                for (const w of b.weeks) {
                    let tw = totalWeek.find(ww => ww.week === w.week)
                    if (!tw) {
                        tw = { week: w.week, tt: 0, tvol: 0, td: 0, tv: 0 }
                        totalWeek.push(tw)
                    }
                    tw.tt += w.totalTenants
                    tw.td += w.totalDelivered
                    tw.tv += w.totalVisited
                    tw.tvol += w.totalVolunteers
                }
            }
        }

        // build indexes
        let indexes = [] as { month: string, row: number, branches: { branch: string, row: number, weeks: { week: string, col: number, visits: number }[] }[] }[]
        let r = 0

        for (const m of data) {
            r += 2
            let fm = indexes.find(mm => mm.month === m.month)
            if (!fm) {
                fm = {
                    month: m.month,
                    row: r,
                    branches: [] as { branch: string, row: number, weeks: { week: string, col: number, visits: number }[] }[]
                }
                indexes.push(fm)
            }
            r += 2
            for (const b of m.branches) {
                r += 2
                let fb = fm.branches.find(bb => bb.branch === b.branch)
                if (!fb) {
                    fb = {
                        branch: b.branch,
                        row: r,
                        weeks: [] as { week: string, col: number, visits: number }[]
                    }
                    fm.branches.push(fb)
                }

                let maxVisits = 0
                let weeks = 0
                for (const w of b.weeks) {
                    let www = b.weeksCounter.indexOf(w.week)

                    let wwwww = weeksOrder.find(itm => itm.month === m.month)
                    let motiwwww = wwwww?.weeks.find(itm => itm.week === w.week)!
                    let motiindex = wwwww?.weeks.indexOf(motiwwww)!

                    let fw = fb.weeks.find(ww => ww.week === w.week)
                    if (!fw) {
                        fw = {
                            week: w.week,
                            col: motiindex * 6 + 2,
                            visits: w.visits.length
                        }
                        fb.weeks.push(fw)
                    }

                    if (maxVisits < fw.visits) {
                        maxVisits = fw.visits
                    }

                }
                r += maxVisits
            }
        }

        for (const m of data) {
            m.branches.sort((a, b) => a.branch.localeCompare(b.branch))
            for (const b of m.branches) {
                for (const w of b.weeks) {
                    w.visits.sort((a, b) => a.tenant.localeCompare(b.tenant))
                }
            }
        }

        let aoa = [] as string[][]
        aoa[0] = [] as string[]
        aoa[0][0] = 'בס"ד'
        if (this.type !== ExportType.all) {
            aoa[0][2] = this.type.caption
        }

        // build table data+indexes
        let c = 0
        for (const m of data) {
            let fm = indexes.find(mm => mm.month === m.month)!
            if (!aoa[fm.row]) {
                aoa[fm.row] = [] as string[]
            }
            aoa[fm.row][0] = m.month
            if (!aoa[fm.row + 1]) {
                aoa[fm.row + 1] = [] as string[]
            }
            aoa[fm.row + 1][0] = 'כולל'
            if (!remult.user?.isManager) {
                if (!aoa[fm.row + 2]) {
                    aoa[fm.row + 2] = [] as string[]
                }

                aoa[fm.row + 2][0] = 'סה"כ' + ' ' + '(' + m.branches.length + ')'
                r = fm.row + 2
            }

            m.branches.sort((a, b) => a.branch.localeCompare(b.branch))

            for (const b of m.branches) {
                let fb = fm.branches.find(ww => ww.branch === b.branch)!
                if (!aoa[fb.row]) {
                    aoa[fb.row] = [] as string[]
                }
                aoa[fb.row][0] = b.branch

                for (const w of b.weeks) {
                    let fw = fb.weeks.find(ww => ww.week === w.week)!
                    aoa[fm.row][fw.col] = w.week
                    aoa[fm.row + 1][fw.col] = this.group.single
                    aoa[fm.row + 1][fw.col + 1] = 'ת.ז'
                    aoa[fm.row + 1][fw.col + 2] = 'איחרו'
                    aoa[fm.row + 1][fw.col + 3] = 'נוכחו'
                    aoa[fm.row + 1][fw.col + 4] = 'הערות'

                    let tw = totalWeek.find(tw => tw.week === w.week)
                    if (tw) {
                        if (!remult.user?.isManager) {
                            aoa[fm.row + 2][fw.col] = tw.tt.toString()
                            // aoa[fm.row + 2][fw.col + 1] = tw.tvol.toString()
                            aoa[fm.row + 2][fw.col + 2] = tw.td.toString()
                            aoa[fm.row + 2][fw.col + 3] = tw.tv.toString()
                        }
                    }

                    aoa[fb.row][fw.col] = w.totalTenants.toString()
                    // aoa[fb.row][fw.col + 1] = w.totalVolunteers.toString()
                    aoa[fb.row][fw.col + 2] = w.totalDelivered.toString()
                    aoa[fb.row][fw.col + 3] = w.totalVisited.toString()
                    let rr = fb.row
                    for (const v of w.visits) {
                        rr += 1
                        if (!aoa[rr]) {
                            aoa[rr] = [] as string[]
                        }
                        v.volunteers.sort((a, b) => a.localeCompare(b))
                        aoa[rr][fw.col] = v.tenant
                        aoa[rr][fw.col + 1] = v.tenantIdNumber
                        // aoa[rr][fw.col + 1] = v.volunteers.join(', ')
                        aoa[rr][fw.col + 2] = v.delivered
                        aoa[rr][fw.col + 3] = v.visited
                        aoa[rr][fw.col + 4] = v.tenantRemark
                        // console.log('w.branch', b.branch, 'b.week', w.week, 'v.tenant', v.tenant, 'rr', rr, 'fw.row', fb.row, 'aoa.length', aoa.length)
                    }
                }
            }
        }

        return aoa
    }

    @BackendMethod({ allowed: Allow.authenticated })
    async exportVisitsOrigin() {

        let data = [] as {
            month: string,
            branches: {
                branch: string,
                totalTenants: number,
                totalVolunteers: number,
                totalDelivered: number,
                totalVisited: number,
                weeksCounter: string[],
                // deletedWeeks: [],//???????????????????????????????????????????????????
                weeks: {
                    week: string,
                    visits: {
                        tenant: string,
                        tenantIdNumber: string,
                        tenantRemark: string,
                        volunteers: string[],
                        delivered: string,
                        visited: string
                    }[],
                    totalTenants: number,
                    totalVolunteers: number,
                    totalDelivered: number,
                    totalVisited: number
                }[]
            }[]
        }[]

        // build visits-volunteers
        let visitVolunteers = [] as { visitId: string, volunteersNames: string[] }[]
        for await (const vv of remult.repo(VisitVolunteer).query({
            where: {
                visit: await remult.repo(Visit).find({
                    where: {
                        $and: [
                            this.actual
                                ? {
                                    $or: [
                                        { status: VisitStatus.delivered },
                                        { status: VisitStatus.visited }
                                    ]
                                }
                                : {}
                        ],
                        branch: remult.user?.isManager
                            ? { $id: remult.user.branch }
                            : await remult.repo(Branch).find({
                                where:
                                {
                                    active: true,
                                    system: false,
                                    group: this.group === BranchGroup.all
                                        ? undefined!
                                        : this.group
                                }
                            }),
                        date: {
                            "$gte": this.fdate,
                            "$lte": this.tdate
                        }
                    }
                })
            }
        })) {
            let found = visitVolunteers.find(v => v.visitId === vv.visit.id)
            if (!found) {
                found = { visitId: vv.visit.id, volunteersNames: [] as string[] }
                visitVolunteers.push(found)
            }
            if (!found.volunteersNames.includes(vv.volunteer.name)) {
                found.volunteersNames.push(vv.volunteer.name)
            }
        }

        let weeksOrder = [] as { monthKey: string, month: string, weeks: { key: string, week: string }[] }[]

        let branchWeek = [] as { key: string, volunteers: string[] }[]
        let totalWeek = [] as { week: string, tt: number, tvol: number, td: number, tv: number }[]

        // build data
        for await (const v of remult.repo(Visit).query({
            where: {
                $and: [
                    this.actual
                        ? {
                            $or: [
                                { status: VisitStatus.delivered },
                                { status: VisitStatus.visited }
                            ]
                        }
                        : {}
                ],
                branch: remult.user?.isManager
                    ? { $id: remult.user.branch }
                    : await remult.repo(Branch).find({
                        where:
                        {
                            active: true,
                            system: false,
                            group: this.group === BranchGroup.all
                                ? undefined!
                                : this.group
                        }
                    }),
                date: {
                    "$gte": this.fdate,
                    "$lte": this.tdate
                }
            },
            orderBy: { branch: 'asc', date: "asc" }
        })) {

            let month = `חודש ${hebrewMonths[v.date.getMonth()]}`

            // set monthsWeeks
            let motiw = weeksOrder.find(itm => itm.month === month)
            if (!motiw) {
                motiw = {
                    monthKey: `${v.date.getFullYear()}-${('0' + (v.date.getMonth() + 1)).slice(-2)}`,
                    month: month,
                    weeks: [] as { key: string, week: string }[]
                }
                weeksOrder.push(motiw)
            }

            let foundMonth = data.find(d => d.month === month)
            if (!foundMonth) {
                foundMonth = {
                    month: month,
                    branches: [] as {
                        branch: string,
                        totalTenants: number,
                        totalVolunteers: number,
                        totalDelivered: number,
                        totalVisited: number,
                        weeksCounter: string[],
                        weeks: {
                            week: string,
                            visits: {
                                tenant: string,
                                tenantIdNumber: string,
                                tenantRemark: string,
                                volunteers: string[],
                                delivered: string,
                                visited: string
                            }[],
                            totalTenants: number,
                            totalVolunteers: number,
                            totalDelivered: number,
                            totalVisited: number
                        }[]
                    }[]
                }
                data.push(foundMonth)
            }

            let branch = v.branch!.name
            let foundBranch = foundMonth.branches.find(b => b.branch === branch)
            if (!foundBranch) {
                foundBranch = {
                    branch: branch,
                    totalTenants: 0,
                    totalVolunteers: 0,
                    totalDelivered: 0,
                    totalVisited: 0,
                    weeksCounter: [] as string[],
                    weeks: [] as {
                        week: string,
                        visits: {
                            tenant: string,
                            tenantIdNumber: string,
                            tenantRemark: string,
                            volunteers: string[],
                            delivered: string,
                            visited: string
                        }[],
                        totalTenants: number,
                        totalVolunteers: number,
                        totalDelivered: number,
                        totalVisited: number
                    }[]
                }
                foundMonth.branches.push(foundBranch)
            }

            let first = firstDateOfWeek(v.date)
            let last = lastDateOfWeek(v.date)
            let week = `שבוע ${first.getDate()}-${last.getDate()}.${last.getMonth() + 1}`

            let motib = motiw.weeks.find(itm => itm.week === week)
            if (!motib) {
                motib = {
                    key: `${first.getFullYear()}-${('0' + (first.getMonth() + 1)).slice(-2)}-${('0' + (first.getDate())).slice(-2)}`,
                    week: week
                }
                motiw.weeks.push(motib)
            }

            let foundWeek = foundBranch.weeks.find(w => w.week === week)
            if (!foundWeek) {
                foundWeek = {
                    week: week,
                    visits: [] as {
                        tenant: string,
                        tenantIdNumber: string,
                        tenantRemark: string,
                        volunteers: string[],
                        delivered: string,
                        visited: string
                    }[],
                    totalTenants: 0,
                    totalVolunteers: 0,
                    totalDelivered: 0,
                    totalVisited: 0
                }
                foundBranch.weeks.push(foundWeek)
                foundBranch.weeksCounter.push(foundWeek.week)
            }

            let f = visitVolunteers.find(vv => vv.visitId === v.id)

            let volunteers = f ? f.volunteersNames : []
            foundBranch.totalTenants += 1
            foundBranch.totalDelivered += v.status === VisitStatus.delivered ? 1 : 0
            foundBranch.totalVisited += v.status === VisitStatus.visited ? 1 : 0

            if (this.detailed) {
                foundWeek.visits.push({
                    tenant: v.tenant.name,
                    tenantIdNumber: v.tenant.idNumber,
                    tenantRemark: v.remark,
                    volunteers: volunteers,
                    delivered: v.status === VisitStatus.delivered ? 'כן' : '',
                    visited: v.status === VisitStatus.visited ? 'כן' : ''
                })
            }
            foundWeek.totalTenants += 1
            foundWeek.totalDelivered += v.status === VisitStatus.delivered ? 1 : 0
            foundWeek.totalVisited += v.status === VisitStatus.visited ? 1 : 0

            let key = foundBranch.branch + '-' + foundWeek.week
            let fbw = branchWeek.find(bw => bw.key === key)
            if (!fbw) {
                fbw = { key: key, volunteers: [] as string[] }
                branchWeek.push(fbw)
            }
            for (const vol of volunteers) {
                if (!fbw.volunteers.includes(vol)) {
                    fbw.volunteers.push(vol)
                    foundWeek.totalVolunteers += 1
                }
            }
        }// for each visit

        for (let mi = data.length - 1; mi >= 0; --mi) {
            const m = data[mi];
            for (let bi = m.branches.length - 1; bi >= 0; --bi) {
                const b = m.branches[bi];
                for (let wi = b.weeks.length - 1; wi >= 0; --wi) {
                    const w = b.weeks[wi];

                    switch (this.type) {

                        case ExportType.done: {
                            if (w.totalDelivered + w.totalVisited === w.totalTenants) {
                            }
                            else {
                                let i = b.weeks.indexOf(w)
                                b.weeks.splice(i, 1)
                                if (!b.weeks.length) {
                                    i = m.branches.indexOf(b)
                                    m.branches.splice(i, 1)
                                }
                            }
                            break;
                        }

                        case ExportType.doneAndNotDone: {
                            if (w.totalDelivered + w.totalVisited) { }
                            else {
                                let i = b.weeks.indexOf(w)
                                b.weeks.splice(i, 1)
                                if (!b.weeks.length) {
                                    i = m.branches.indexOf(b)
                                    m.branches.splice(i, 1)
                                }
                            }
                            break;
                        }

                        case ExportType.notDone: {
                            if (w.totalDelivered + w.totalVisited === 0) { }
                            else {
                                let i = b.weeks.indexOf(w)
                                b.weeks.splice(i, 1)
                                if (!b.weeks.length) {
                                    i = m.branches.indexOf(b)
                                    m.branches.splice(i, 1)
                                }
                            }
                            break;

                        }
                    }
                }

            }
        }

        weeksOrder.sort((a, b) => a.monthKey.localeCompare(b.monthKey))
        for (const motic of weeksOrder) {
            motic.weeks.sort((a, b) => a.key.localeCompare(b.key))
        }

        // build totals
        for (const m of data) {
            for (const b of m.branches) {
                for (const w of b.weeks) {
                    let tw = totalWeek.find(ww => ww.week === w.week)
                    if (!tw) {
                        tw = { week: w.week, tt: 0, tvol: 0, td: 0, tv: 0 }
                        totalWeek.push(tw)
                    }
                    tw.tt += w.totalTenants
                    tw.td += w.totalDelivered
                    tw.tv += w.totalVisited
                    tw.tvol += w.totalVolunteers
                }
            }
        }

        // build indexes
        let indexes = [] as { month: string, row: number, branches: { branch: string, row: number, weeks: { week: string, col: number, visits: number }[] }[] }[]
        let r = 0

        for (const m of data) {
            r += 2
            let fm = indexes.find(mm => mm.month === m.month)
            if (!fm) {
                fm = {
                    month: m.month,
                    row: r,
                    branches: [] as { branch: string, row: number, weeks: { week: string, col: number, visits: number }[] }[]
                }
                indexes.push(fm)
            }
            r += 2
            for (const b of m.branches) {
                r += 2
                let fb = fm.branches.find(bb => bb.branch === b.branch)
                if (!fb) {
                    fb = {
                        branch: b.branch,
                        row: r,
                        weeks: [] as { week: string, col: number, visits: number }[]
                    }
                    fm.branches.push(fb)
                }

                let maxVisits = 0
                let weeks = 0
                for (const w of b.weeks) {
                    let www = b.weeksCounter.indexOf(w.week)

                    let wwwww = weeksOrder.find(itm => itm.month === m.month)
                    let motiwwww = wwwww?.weeks.find(itm => itm.week === w.week)!
                    let motiindex = wwwww?.weeks.indexOf(motiwwww)!

                    let fw = fb.weeks.find(ww => ww.week === w.week)
                    if (!fw) {
                        fw = {
                            week: w.week,
                            col: motiindex * 6 + 2,
                            visits: w.visits.length
                        }
                        fb.weeks.push(fw)
                    }

                    if (maxVisits < fw.visits) {
                        maxVisits = fw.visits
                    }

                }
                r += maxVisits
            }
        }

        for (const m of data) {
            m.branches.sort((a, b) => a.branch.localeCompare(b.branch))
            for (const b of m.branches) {
                for (const w of b.weeks) {
                    w.visits.sort((a, b) => a.tenant.localeCompare(b.tenant))
                }
            }
        }

        let aoa = [] as string[][]
        aoa[0] = [] as string[]
        aoa[0][0] = 'בס"ד'
        if (this.type !== ExportType.all) {
            aoa[0][2] = this.type.caption
        }

        // build table data+indexes
        let c = 0
        for (const m of data) {
            let fm = indexes.find(mm => mm.month === m.month)!
            if (!aoa[fm.row]) {
                aoa[fm.row] = [] as string[]
            }
            aoa[fm.row][0] = m.month
            if (!aoa[fm.row + 1]) {
                aoa[fm.row + 1] = [] as string[]
            }
            aoa[fm.row + 1][0] = 'כולל'
            if (!remult.user?.isManager) {
                if (!aoa[fm.row + 2]) {
                    aoa[fm.row + 2] = [] as string[]
                }

                aoa[fm.row + 2][0] = 'סה"כ' + ' ' + '(' + m.branches.length + ')'
                r = fm.row + 2
            }

            m.branches.sort((a, b) => a.branch.localeCompare(b.branch))

            for (const b of m.branches) {
                let fb = fm.branches.find(ww => ww.branch === b.branch)!
                if (!aoa[fb.row]) {
                    aoa[fb.row] = [] as string[]
                }
                aoa[fb.row][0] = b.branch

                for (const w of b.weeks) {
                    let fw = fb.weeks.find(ww => ww.week === w.week)!
                    aoa[fm.row][fw.col] = w.week
                    aoa[fm.row + 1][fw.col] = this.group.single
                    aoa[fm.row + 1][fw.col + 1] = 'ת.ז'
                    aoa[fm.row + 1][fw.col + 2] = 'איחרו'
                    aoa[fm.row + 1][fw.col + 3] = 'נוכחו'
                    aoa[fm.row + 1][fw.col + 4] = 'הערות'

                    let tw = totalWeek.find(tw => tw.week === w.week)
                    if (tw) {
                        if (!remult.user?.isManager) {
                            aoa[fm.row + 2][fw.col] = tw.tt.toString()
                            // aoa[fm.row + 2][fw.col + 1] = tw.tvol.toString()
                            aoa[fm.row + 2][fw.col + 2] = tw.td.toString()
                            aoa[fm.row + 2][fw.col + 3] = tw.tv.toString()
                        }
                    }

                    aoa[fb.row][fw.col] = w.totalTenants.toString()
                    // aoa[fb.row][fw.col + 1] = w.totalVolunteers.toString()
                    aoa[fb.row][fw.col + 2] = w.totalDelivered.toString()
                    aoa[fb.row][fw.col + 3] = w.totalVisited.toString()
                    let rr = fb.row
                    for (const v of w.visits) {
                        rr += 1
                        if (!aoa[rr]) {
                            aoa[rr] = [] as string[]
                        }
                        v.volunteers.sort((a, b) => a.localeCompare(b))
                        aoa[rr][fw.col] = v.tenant
                        aoa[rr][fw.col + 1] = v.tenantIdNumber
                        // aoa[rr][fw.col + 1] = v.volunteers.join(', ')
                        aoa[rr][fw.col + 2] = v.delivered
                        aoa[rr][fw.col + 3] = v.visited
                        aoa[rr][fw.col + 4] = v.tenantRemark
                        // console.log('w.branch', b.branch, 'b.week', w.week, 'v.tenant', v.tenant, 'rr', rr, 'fw.row', fb.row, 'aoa.length', aoa.length)
                    }
                }
            }
        }

        return aoa
    }

}
