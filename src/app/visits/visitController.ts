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
                            $id: (await remult.repo(Branch).find({ where: { active: true, system: false } }))
                                .map(b => b.id),
                            group: this.group === BranchGroup.all
                                ? undefined!
                                : this.group
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

    @BackendMethod({ allowed: Allow.authenticated })
    async exportVisits2() {
        this.fdate = resetDateTime(this.fdate)
        this.tdate = resetDateTime(this.tdate)
        console.log('exportVisits', this.fdate, this.tdate, this.detailed, this.type, this.group)
        // console.log('SERVER 10',this.fdate, this.tdate, this.detailed, this.onlyDone)
        let result = [] as exportDataRow[]
        let totalCounter = { tenants: 0, volunteers: 0, delivereds: 0, visiteds: 0 }
        let total: exportDataRow = {}
        let weekly = [] as { week: string, rows: exportDataRow[] }[]

        total[COLUMN_BRANCH] = 'סה"כ'
        if (this.detailed) {
            total[COLUMN_TENANT] = totalCounter.tenants
            total[COLUMN_VOLUNTEERS] = totalCounter.volunteers
        }
        total[COLUMN_DELIVERED] = totalCounter.delivereds
        total[COLUMN_VISITED] = totalCounter.visiteds
        if (remult.user?.isAdmin || remult.user?.isDonor) {
            result.push(total);
        }

        let v = this.type === ExportType.done
            ? { '$ne': VisitStatus.none }
            : this.type === ExportType.notDone
                ? VisitStatus.none
                : undefined!

        console.log('v', v)

        for await (const branch of remult.repo(Branch).query({
            where: {
                active: true,
                system: false
            },
            orderBy: { name: 'asc' }
        })) {
            if (remult.user?.isAdmin || remult.user?.isDonor) { }
            else if (remult.user?.isManager) {
                if (branch.id === remult.user?.branch) { }
                else { continue }
            }
            // if (branch.id !== '9d7cf4d2-0e9f-4aa0-887f-a436c1261ab2') continue
            console.log('branch:', branch.name)
            let blank: exportDataRow = {}
            blank[COLUMN_BRANCH] = ''
            if (this.detailed) {
                blank[COLUMN_TENANT] = ''
                blank[COLUMN_VOLUNTEERS] = ''
            }
            blank[COLUMN_DELIVERED] = ''
            blank[COLUMN_VISITED] = ''
            result.push(blank);
            let branchRow: exportDataRow = {}
            branchRow[COLUMN_BRANCH] = branch.name
            // result.push(branchRow);
            let tenantsCounter = 0
            let visitedCounter = 0
            let deliveredCounter = 0
            let volsIds = [] as string[]
            let tntIds = [] as string[]

            /*
                ExportType.notDone: count(branch-visit) === count(not-done)
                ExportType.done: count(branch-visit) === count(done)
                ExportType.doneAndNotDone: all
            */

            for await (const v of remult.repo(Visit).query({
                where: {
                    branch: branch,
                    // status: this.onlyDone ? { '$ne': VisitStatus.none } : undefined!,
                    status: this.type === ExportType.done
                        ? { '$ne': VisitStatus.none }
                        : this.type === ExportType.notDone
                            ? VisitStatus.none
                            : undefined!,
                    date: {
                        "$gte": this.fdate,
                        "$lte": this.tdate
                    }
                },
            })) {
                if (!result.includes(branchRow)) {
                    result.push(branchRow);
                }
                // set weekly array
                let first = firstDateOfWeek(v.date)
                let last = lastDateOfWeek(v.date)
                let week = `${first.getDate()}-${last.getDate()}.${last.getMonth() + 1}`
                let found = weekly.find(w => w.week === week)
                if (!found) {
                    found = { week: week, rows: [] as exportDataRow[] }
                    weekly.push(found)
                }

                tenantsCounter += 1
                totalCounter.tenants += 1
                visitedCounter += v.status === VisitStatus.visited ? 1 : 0
                totalCounter.visiteds += v.status === VisitStatus.visited ? 1 : 0
                deliveredCounter += v.status === VisitStatus.delivered ? 1 : 0
                totalCounter.delivereds += v.status === VisitStatus.delivered ? 1 : 0
                if (this.detailed) {
                    let vols = (await remult.repo(VisitVolunteer).find({
                        where: { visit: v }
                    }))
                    for (const vl of vols) {
                        if (!volsIds.includes(vl.volunteer?.id)) {
                            volsIds.push(vl.volunteer.id)
                        }
                    }
                    let volunteersNames = ''
                    if (vols.length) {
                        volunteersNames = vols.map(v => v.volunteer?.name).join(', ')
                    }
                    if (!tntIds.includes(v.tenant?.id)) {
                        tntIds.push(v.tenant?.id)
                    }
                    let row: exportDataRow = {}
                    row[COLUMN_TENANT] = v.tenant.name
                    row[COLUMN_VOLUNTEERS] = volunteersNames
                    row[COLUMN_DELIVERED] = (v.status === VisitStatus.delivered ? 'כן' : '')
                    row[COLUMN_VISITED] = (v.status === VisitStatus.visited ? 'כן' : '')
                    result.push(row);
                    found.rows.push(row)
                }
            }//foreach visit
            if (this.detailed) {
                branchRow[COLUMN_TENANT] = tenantsCounter
                branchRow[COLUMN_VOLUNTEERS] = volsIds.length
                totalCounter.volunteers += volsIds.length
            }
            branchRow[COLUMN_DELIVERED] = deliveredCounter
            branchRow[COLUMN_VISITED] = visitedCounter
        }//foreach branch

        if (this.detailed) {
            total[COLUMN_TENANT] = totalCounter.tenants
            total[COLUMN_VOLUNTEERS] = totalCounter.volunteers
        }
        total[COLUMN_DELIVERED] = totalCounter.delivereds
        total[COLUMN_VISITED] = totalCounter.visiteds

        // result.sort((a, b) => (a[COLUMN_TENANT] as string)?.localeCompare(b[COLUMN_TENANT] as string))

        return result
    }

    @BackendMethod({ allowed: Allow.authenticated })
    async exportVisits1() {

        let data = [] as {
            month: string,
            weeks: {
                week: string,
                branches: {
                    branch: string,
                    totalTenants: number,
                    totalVolunteers: number,
                    totalDelivered: number,
                    totalVisited: number,
                    visits: {
                        tenant: string,
                        volunteers: string[],
                        delivered: number,
                        visited: number
                    }[]
                }[]
            }[]
        }[]

        let visitVolunteers = [] as { visitId: string, volunteersNames: string[] }[]
        for await (const vv of remult.repo(VisitVolunteer).query({
            where: {
                visit: await remult.repo(Visit).find({
                    where: {
                        branch: await remult.repo(Branch).find({
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

        let counter = 0
        // build data
        for await (const v of remult.repo(Visit).query({
            where: {
                branch: await remult.repo(Branch).find({
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
            orderBy: { date: "asc" }
        })) {

            // console.log(++counter)
            let month = `חודש ${hebrewMonths[v.date.getMonth()]}`
            let foundMonth = data.find(d => d.month === month)
            if (!foundMonth) {
                foundMonth = {
                    month: month,
                    weeks: [] as {
                        week: string,
                        branches: {
                            branch: string,
                            totalTenants: number,
                            totalVolunteers: number,
                            totalDelivered: number,
                            totalVisited: number,
                            visits: {
                                tenant: string,
                                volunteers: string[],
                                delivered: number,
                                visited: number
                            }[]
                        }[]
                    }[]
                }
                data.push(foundMonth)
            }

            let first = firstDateOfWeek(v.date)
            let last = lastDateOfWeek(v.date)
            let week = `שבוע ${first.getDate()}-${last.getDate()}.${last.getMonth() + 1}`
            let foundWeek = foundMonth.weeks.find(w => w.week === week)
            if (!foundWeek) {
                foundWeek = {
                    week: week,
                    branches: [] as {
                        branch: string,
                        totalTenants: number,
                        totalVolunteers: number,
                        totalDelivered: number,
                        totalVisited: number,
                        visits: {
                            tenant: string,
                            volunteers: string[],
                            delivered: number,
                            visited: number
                        }[]
                    }[]
                }
                foundMonth.weeks.push(foundWeek)
            }

            let branch = v.branch!.name
            let foundBranch = foundWeek.branches.find(b => b.branch === branch)
            if (!foundBranch) {
                foundBranch = {
                    branch: branch,
                    totalTenants: 0,
                    totalVolunteers: 0,
                    totalDelivered: 0,
                    totalVisited: 0,
                    visits: [] as {
                        tenant: string,
                        volunteers: string[],
                        delivered: number,
                        visited: number
                    }[]
                }
                foundWeek.branches.push(foundBranch)
            }

            let f = visitVolunteers.find(vv => vv.visitId === v.id)

            foundBranch.totalTenants += 1
            foundBranch.totalDelivered += VisitStatus.delivered ? 1 : 0
            foundBranch.totalVisited += VisitStatus.visited ? 1 : 0
            foundBranch.visits.push({
                tenant: v.tenant.name,
                // volunteers: [],
                volunteers: f ? f.volunteersNames : [],
                delivered: v.status === VisitStatus.delivered ? 1 : 0,
                visited: v.status === VisitStatus.visited ? 1 : 0
            })



            if (counter === 10) {
                break;
            }
        }// for each visit

        // console.log('data', JSON.stringify(data))

        counter = 10000
        // build rows
        // let rows = [] as exportDataRow[]
        let aoa = [] as string[][]
        // let indexes = [] as number[][]
        // let indexes = [] as { branch: string, row: number, weeks: { week: string, col: number }[] }[]
        let indexes = [] as { week: string, col: number, branches: { branch: string, row: number }[] }[]
        let r = 0
        let c = 0
        if (r === aoa.length) {
            aoa[r] = [] as string[]
        }
        aoa[r][c] = 'בס"ד'
        r += 1
        if (r === aoa.length) {
            aoa[r] = [] as string[]
        }

        for (const m of data) {
            r += 1
            if (r === aoa.length) {
                aoa[r] = [] as string[]
            }
            let monthRow = r
            aoa[r][c] = m.month

            r += 1
            if (r === aoa.length) {
                aoa[r] = [] as string[]
            }
            aoa[r][c] = 'כולל'
            aoa[r][c + 2] = 'דייר'
            aoa[r][c + 3] = 'מתנדבים'
            aoa[r][c + 4] = 'מסרו'
            aoa[r][c + 5] = 'ביקרו'

            r += 1
            if (r === aoa.length) {
                aoa[r] = [] as string[]
            }
            aoa[r][c] = 'סה"כ'
            r += 1
            if (r === aoa.length) {
                aoa[r] = [] as string[]
            }

            console.log(++counter)
            let colIndex = 0

            // let monthRow = {} as exportDataRow
            // monthRow['כולל'] = m.month
            // rows.push(monthRow)

            let volunteersIds = [] as string[]
            let weekRow = {} as exportDataRow
            let weekCol = 0
            for (const w of m.weeks) {
                //let indexes = [] as { week: string, col: number, branches: { branch: string, row: number }[] }[]
                let fw = indexes.find(i => i.week === w.week)
                if (!fw) {
                    fw = {
                        week: w.week,
                        col: indexes.length * 4 + 2,
                        branches: [] as { branch: string, row: number }[]
                    }
                    indexes.push(fw)
                }

                if (weekCol === 0) {
                    c += 1
                }
                else {
                    c += 5
                }
                r = monthRow
                weekCol = c + 1
                aoa[monthRow][weekCol] = w.week

                // weekRow[colIndex] = w.week
                // rows.push(weekRow)

                for (const b of w.branches) {

                    let fb = fw.branches.find(b => b.branch === b.branch)
                    if (!fb) {
                        fb = {
                            branch: b.branch,
                            row: r
                        }
                        fw.branches.push(fb)
                    }

                    r += 1
                    if (r === aoa.length) {
                        aoa[r] = [] as string[]
                    }
                    // c = 0
                    aoa[r][0] = b.branch
                    aoa[r][c + 1] = b.totalTenants.toString()
                    aoa[r][c + 2] = b.totalVolunteers.toString()
                    aoa[r][c + 3] = b.totalDelivered.toString()
                    aoa[r][c + 4] = b.totalVisited.toString()

                    let sumVisits = 0
                    b.visits.forEach(v => sumVisits += v.delivered + v.visited)
                    // let sumTenants = await remult.repo(Tenant).count({active: true, branch: b.branch})

                    // console.log(b.branch)
                    // let branchRow = {} as exportDataRow
                    // branchRow[colIndex] = b.branch
                    // rows.push(branchRow)

                    // c += 1
                    for (const v of b.visits) {

                        r += 1
                        if (r === aoa.length) {
                            aoa[r] = [] as string[]
                        }
                        aoa[r][c + 1] = v.tenant
                        aoa[r][c + 2] = v.volunteers.join(', ')
                        aoa[r][c + 3] = v.delivered.toString()
                        aoa[r][c + 4] = v.visited.toString()

                        // let visitRow = {} as exportDataRow
                        // visitRow[colIndex + 1] = v.tenant
                        // visitRow[colIndex + 2] = v.volunteers
                        // visitRow[colIndex + 3] = v.delivered
                        // visitRow[colIndex + 4] = v.visited
                        // rows.push(visitRow)

                    }
                }
            }
        }

        // console.log(JSON.stringify(rows))

        return aoa
    }

    @BackendMethod({ allowed: Allow.authenticated })
    async exportVisits3() {

        let data = [] as {
            month: string,
            weeks: {
                week: string,
                branches: {
                    branch: string,
                    totalTenants: number,
                    totalVolunteers: number,
                    totalDelivered: number,
                    totalVisited: number,
                    visits: {
                        tenant: string,
                        volunteers: string[],
                        delivered: number,
                        visited: number
                    }[]
                }[]
            }[]
        }[]

        let visitVolunteers = [] as { visitId: string, volunteersNames: string[] }[]
        for await (const vv of remult.repo(VisitVolunteer).query({
            where: {
                visit: await remult.repo(Visit).find({
                    where: {
                        branch: await remult.repo(Branch).find({
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

        // build data
        for await (const v of remult.repo(Visit).query({
            where: {
                branch: await remult.repo(Branch).find({
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

            // console.log(++counter)
            let month = `חודש ${hebrewMonths[v.date.getMonth()]}`
            let foundMonth = data.find(d => d.month === month)
            if (!foundMonth) {
                foundMonth = {
                    month: month,
                    weeks: [] as {
                        week: string,
                        branches: {
                            branch: string,
                            totalTenants: number,
                            totalVolunteers: number,
                            totalDelivered: number,
                            totalVisited: number,
                            visits: {
                                tenant: string,
                                volunteers: string[],
                                delivered: number,
                                visited: number
                            }[]
                        }[]
                    }[]
                }
                data.push(foundMonth)
            }

            let first = firstDateOfWeek(v.date)
            let last = lastDateOfWeek(v.date)
            let week = `שבוע ${first.getDate()}-${last.getDate()}.${last.getMonth() + 1}`
            let foundWeek = foundMonth.weeks.find(w => w.week === week)
            if (!foundWeek) {
                foundWeek = {
                    week: week,
                    branches: [] as {
                        branch: string,
                        totalTenants: number,
                        totalVolunteers: number,
                        totalDelivered: number,
                        totalVisited: number,
                        visits: {
                            tenant: string,
                            volunteers: string[],
                            delivered: number,
                            visited: number
                        }[]
                    }[]
                }
                foundMonth.weeks.push(foundWeek)
            }

            let branch = v.branch!.name
            let foundBranch = foundWeek.branches.find(b => b.branch === branch)
            if (!foundBranch) {
                foundBranch = {
                    branch: branch,
                    totalTenants: 0,
                    totalVolunteers: 0,
                    totalDelivered: 0,
                    totalVisited: 0,
                    visits: [] as {
                        tenant: string,
                        volunteers: string[],
                        delivered: number,
                        visited: number
                    }[]
                }
                foundWeek.branches.push(foundBranch)
            }

            let f = visitVolunteers.find(vv => vv.visitId === v.id)

            foundBranch.totalTenants += 1
            foundBranch.totalDelivered += VisitStatus.delivered ? 1 : 0
            foundBranch.totalVisited += VisitStatus.visited ? 1 : 0
            foundBranch.visits.push({
                tenant: v.tenant.name,
                // volunteers: [],
                volunteers: f ? f.volunteersNames : [],
                delivered: v.status === VisitStatus.delivered ? 1 : 0,
                visited: v.status === VisitStatus.visited ? 1 : 0
            })
        }// for each visit

        let indexes = [] as { month: string, row: number, weeks: { week: string, col: number, branches: { branch: string, row: number }[] }[] }[]
        let r = 0

        for (const m of data) {
            r += 2
            let fm = indexes.find(mm => mm.month === m.month)
            if (!fm) {
                fm = {
                    month: m.month,
                    row: r,
                    weeks: [] as { week: string, col: number, branches: { branch: string, row: number }[] }[]
                }
                indexes.push(fm)
            }
            for (const w of m.weeks) {
                let fw = fm.weeks.find(ww => ww.week === w.week)
                if (!fw) {
                    fw = {
                        week: w.week,
                        col: fm.weeks.length * 4 + 2,
                        branches: [] as { branch: string, row: number }[]
                    }
                    fm.weeks.push(fw)
                }
                r = fw.branches.length ? 1 : 4
                for (const b of w.branches) {
                    r += 2
                    let fb = fw.branches.find(bb => bb.branch === b.branch)
                    if (!fb) {
                        fb = {
                            branch: b.branch,
                            row: r
                        }
                        fw.branches.push(fb)
                    }
                    r += b.visits.length + 2
                }
            }
        }

        console.log(JSON.stringify(indexes))

        let aoa = [] as string[][]
        aoa[0] = [] as string[]
        aoa[0][0] = 'בס"ד'

        let c = 0
        for (const m of data) {
            let fm = indexes.find(mm => mm.month === m.month)!
            if (aoa.length <= fm.row) {
                aoa[fm.row] = [] as string[]
                aoa[fm.row][0] = m.month
                aoa[fm.row + 1] = [] as string[]
                aoa[fm.row + 1][0] = 'כולל'
                aoa[fm.row + 2] = [] as string[]
                aoa[fm.row + 2][0] = 'סה"כ'
            }
            // r=fm.row + 2
            for (const w of m.weeks) {
                let fw = fm.weeks.find(ww => ww.week === w.week)!
                aoa[fm.row][fw.col] = w.week
                for (const b of w.branches) {
                    let fb = fw.branches.find(bb => bb.branch === b.branch)!
                    if (aoa.length <= fb.row) {
                        aoa[fb.row] = [] as string[]
                        aoa[fb.row][0] = b.branch
                    }
                    let rr = fb.row
                    for (const v of b.visits) {
                        rr += 1
                        if (aoa.length <= rr) {
                            aoa[rr] = [] as string[]
                        }
                        console.log('w.week', w.week, 'b.branch', b.branch, 'v.tenant', v.tenant, 'rr', rr, 'fw.col', fw.col, 'aoa.length', aoa.length)
                        aoa[rr][fw.col] = v.tenant
                    }
                }
            }
        }





        // if (r === aoa.length) {
        //     aoa[r] = [] as string[]
        // }
        // aoa[r][c] = 'בס"ד'
        // r += 1
        // if (r === aoa.length) {
        //     aoa[r] = [] as string[]
        // }

        // for (const m of data) {
        //     r += 1
        //     if (r === aoa.length) {
        //         aoa[r] = [] as string[]
        //     }

        //     let fm = indexes.find(i => i.month === m.month)
        //     if (!fm) {
        //         fm = {
        //             month: m.month,
        //             row: r,
        //             weeks: [] as { week: string, col: number, branches: { branch: string, row: number }[] }[]
        //         }
        //         indexes.push(fm)
        //     }

        //     aoa[fm.row][c] = m.month

        //     r = fm.row + 1
        //     if (r === aoa.length) {
        //         aoa[r] = [] as string[]
        //     }

        //     r += 1
        //     if (r === aoa.length) {
        //         aoa[r] = [] as string[]
        //     }
        //     aoa[r][c] = 'סה"כ'
        //     r += 1
        //     if (r === aoa.length) {
        //         aoa[r] = [] as string[]
        //     }

        //     for (const w of m.weeks) {
        //         //let indexes = [] as { week: string, col: number, branches: { branch: string, row: number }[] }[]
        //         let fw = fm.weeks.find(i => i.week === w.week)
        //         if (!fw) {
        //             fw = {
        //                 week: w.week,
        //                 col: fm.weeks.length * 4 + 2,
        //                 branches: [] as { branch: string, row: number }[]
        //             }
        //             fm.weeks.push(fw)
        //         }

        //         r = fm.row + 1
        //         if (r === aoa.length) {
        //             aoa[r] = [] as string[]
        //         }

        //         aoa[r][fw.col] = w.week
        //         r += 1
        //         if (r === aoa.length) {
        //             aoa[r] = [] as string[]
        //         }
        //         aoa[r][fw.col + 2] = 'דייר'
        //         aoa[r][fw.col + 3] = 'מתנדבים'
        //         aoa[r][fw.col + 4] = 'מסרו'
        //         aoa[r][fw.col + 5] = 'ביקרו'

        //         // weekRow[colIndex] = w.week
        //         // rows.push(weekRow)

        //         for (const b of w.branches) {

        //             let fb = fw.branches.find(b => b.branch === b.branch)
        //             if (!fb) {
        //                 fb = {
        //                     branch: b.branch,
        //                     row: r
        //                 }
        //                 fw.branches.push(fb)
        //             }

        //             r += 1
        //             if (r === aoa.length) {
        //                 aoa[r] = [] as string[]
        //             }
        //             // c = 0
        //             aoa[r][0] = b.branch
        //             aoa[r][c + 1] = b.totalTenants.toString()
        //             aoa[r][c + 2] = b.totalVolunteers.toString()
        //             aoa[r][c + 3] = b.totalDelivered.toString()
        //             aoa[r][c + 4] = b.totalVisited.toString()

        //             let sumVisits = 0
        //             b.visits.forEach(v => sumVisits += v.delivered + v.visited)
        //             // let sumTenants = await remult.repo(Tenant).count({active: true, branch: b.branch})

        //             // console.log(b.branch)
        //             // let branchRow = {} as exportDataRow
        //             // branchRow[colIndex] = b.branch
        //             // rows.push(branchRow)

        //             // c += 1
        //             for (const v of b.visits) {

        //                 r += 1
        //                 if (r === aoa.length) {
        //                     aoa[r] = [] as string[]
        //                 }
        //                 aoa[r][c + 1] = v.tenant
        //                 aoa[r][c + 2] = v.volunteers.join(', ')
        //                 aoa[r][c + 3] = v.delivered.toString()
        //                 aoa[r][c + 4] = v.visited.toString()

        //                 // let visitRow = {} as exportDataRow
        //                 // visitRow[colIndex + 1] = v.tenant
        //                 // visitRow[colIndex + 2] = v.volunteers
        //                 // visitRow[colIndex + 3] = v.delivered
        //                 // visitRow[colIndex + 4] = v.visited
        //                 // rows.push(visitRow)

        //             }
        //         }
        //     }
        // }

        // console.log(JSON.stringify(rows))

        return aoa
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

        let branchWeek = [] as { key: string, volunteers: string[] }[]
        let totalWeek = [] as { week: string, tt: number, tvol: number, td: number, tv: number }[]

        // build data
        for await (const v of remult.repo(Visit).query({
            where: {
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
            let foundWeek = foundBranch.weeks.find(w => w.week === week)
            if (!foundWeek) {
                foundWeek = {
                    week: week,
                    visits: [] as {
                        tenant: string,
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

                    let fw = fb.weeks.find(ww => ww.week === w.week)
                    if (!fw) {
                        fw = {
                            week: w.week,
                            col: www * 5 + 2,
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
                    // aoa[fm.row + 1][fw.col + 1] = 'מתנדב'
                    // aoa[fm.row + 1][fw.col + 2] = 'מסרו'
                    aoa[fm.row + 1][fw.col + 3] = 'נוכחו'

                    let tw = totalWeek.find(tw => tw.week === w.week)
                    if (tw) {
                        if (!remult.user?.isManager) {
                            aoa[fm.row + 2][fw.col] = tw.tt.toString()
                            // aoa[fm.row + 2][fw.col + 1] = tw.tvol.toString()
                            // aoa[fm.row + 2][fw.col + 2] = tw.td.toString()
                            aoa[fm.row + 2][fw.col + 3] = tw.tv.toString()
                        }
                    }

                    aoa[fb.row][fw.col] = w.totalTenants.toString()
                    // aoa[fb.row][fw.col + 1] = w.totalVolunteers.toString()
                    // aoa[fb.row][fw.col + 2] = w.totalDelivered.toString()
                    aoa[fb.row][fw.col + 3] = w.totalVisited.toString()
                    let rr = fb.row
                    for (const v of w.visits) {
                        rr += 1
                        if (!aoa[rr]) {
                            aoa[rr] = [] as string[]
                        }
                        v.volunteers.sort((a, b) => a.localeCompare(b))
                        aoa[rr][fw.col] = v.tenant
                        // aoa[rr][fw.col + 1] = v.volunteers.join(', ')
                        // aoa[rr][fw.col + 2] = v.delivered
                        aoa[rr][fw.col + 3] = v.visited
                        // console.log('w.branch', b.branch, 'b.week', w.week, 'v.tenant', v.tenant, 'rr', rr, 'fw.row', fb.row, 'aoa.length', aoa.length)
                    }
                }
            }
        }

        return aoa
    }

    @BackendMethod({ allowed: Allow.authenticated })
    async exportVisits4() {

        let data = [] as {
            month: string,
            branches: {
                branch: string,
                visible: boolean,
                totalTenants: number,
                totalVolunteers: number,
                totalDelivered: number,
                totalVisited: number,
                weeks: {
                    week: string,
                    visits: {
                        tenant: string,
                        volunteers: string[],
                        delivered: string,
                        visited: string
                    }[],
                    totalTenants: number,
                    totalVolunteers: number,
                    totalDelivered: number,
                    totalVisited: number,
                    visible: boolean
                }[]
            }[]
        }[]

        // build visits-volunteers
        let visitVolunteers = [] as { visitId: string, volunteersNames: string[] }[]
        for await (const vv of remult.repo(VisitVolunteer).query({
            where: {
                visit: await remult.repo(Visit).find({
                    where: {
                        branch: await remult.repo(Branch).find({
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

        let once = false
        let branchWeek = [] as { key: string, volunteers: string[] }[]
        let totalWeek = [] as { week: string, tt: number, tvol: number, td: number, tv: number }[]
        //['רחובות נוער'],//['רחובות נוער','יהוד'],// ['קריית גת'],//,'רחובות'],
        // build data
        for await (const v of remult.repo(Visit).query({
            where: {
                branch: await remult.repo(Branch).find({
                    where:
                    {
                        // name:['רחובות נוער'],
                        // name:['יהוד'],
                        // name: ['רחובות נוער', 'יהוד'],
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
            let foundMonth = data.find(d => d.month === month)
            if (!foundMonth) {
                foundMonth = {
                    month: month,
                    branches: [] as {
                        branch: string,
                        visible: boolean,
                        totalTenants: number,
                        totalVolunteers: number,
                        totalDelivered: number,
                        totalVisited: number,
                        weeks: {
                            week: string,
                            visits: {
                                tenant: string,
                                volunteers: string[],
                                delivered: string,
                                visited: string
                            }[],
                            totalTenants: number,
                            totalVolunteers: number,
                            totalDelivered: number,
                            totalVisited: number,
                            visible: boolean
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
                    visible: true,
                    totalTenants: 0,
                    totalVolunteers: 0,
                    totalDelivered: 0,
                    totalVisited: 0,
                    weeks: [] as {
                        week: string,
                        visits: {
                            tenant: string,
                            volunteers: string[],
                            delivered: string,
                            visited: string
                        }[],
                        totalTenants: number,
                        totalVolunteers: number,
                        totalDelivered: number,
                        totalVisited: number,
                        visible: boolean
                    }[]
                }
                foundMonth.branches.push(foundBranch)
            }

            let first = firstDateOfWeek(v.date)
            let last = lastDateOfWeek(v.date)
            let week = `שבוע ${first.getDate()}-${last.getDate()}.${last.getMonth() + 1}`
            let foundWeek = foundBranch.weeks.find(w => w.week === week)
            if (!foundWeek) {
                foundWeek = {
                    week: week,
                    visits: [] as {
                        tenant: string,
                        volunteers: string[],
                        delivered: string,
                        visited: string
                    }[],
                    totalTenants: 0,
                    totalVolunteers: 0,
                    totalDelivered: 0,
                    totalVisited: 0,
                    visible: true
                }
                foundBranch.weeks.push(foundWeek)
            }

            let f = visitVolunteers.find(vv => vv.visitId === v.id)

            let volunteers = f ? f.volunteersNames : []
            foundBranch.totalTenants += 1
            foundBranch.totalDelivered += v.status === VisitStatus.delivered ? 1 : 0
            foundBranch.totalVisited += v.status === VisitStatus.visited ? 1 : 0

            if (this.detailed) {
                foundWeek.visits.push({
                    tenant: v.tenant.name,
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

        // this.type = ExportType.done
        // console.log('this.type', this.type)

        for (let mi = data.length - 1; mi >= 0; --mi) {
            const m = data[mi];
            for (let bi = m.branches.length - 1; bi >= 0; --bi) {
                const b = m.branches[bi];
                for (let wi = b.weeks.length - 1; wi >= 0; --wi) {
                    const w = b.weeks[wi];

                    switch (this.type) {

                        case ExportType.done: {
                            if (w.totalDelivered + w.totalVisited === w.totalTenants) {
                                // console.log(b.branch + ' stay')
                            }
                            else {
                                // w.visible = false
                                // let bVisible = false
                                // for (const wk of b.weeks) {
                                //     if (wk.visible) {
                                //         bVisible = true
                                //         break
                                //     }
                                // }
                                // b.visible = bVisible
                                // console.log(b.branch + ' removed')
                                let i = b.weeks.indexOf(w)
                                // console.log(i, 1, b.weeks.length)
                                // b.weeks.splice(i, 1)
                                // b.weeks = b.weeks.splice(i, 1)
                                // console.log(i, 1, b.weeks.length)
                                if (!b.weeks.length) {
                                    i = m.branches.indexOf(b)
                                    // console.log(i, 2, m.branches.length)
                                    m.branches.splice(i, 1)
                                    // console.log(i, 2, m.branches.length)
                                    // m.branches = m.branches.splice(i, 1)
                                }
                            }
                            break;
                        }

                        case ExportType.doneAndNotDone: {
                            if (w.totalDelivered + w.totalVisited) { }
                            else {

                                // w.visible = false
                                // let bVisible = false
                                // for (const wk of b.weeks) {
                                //     if (wk.visible) {
                                //         bVisible = true
                                //         break
                                //     }
                                // }
                                // b.visible = bVisible
                                let i = b.weeks.indexOf(w)
                                b.weeks.splice(i, 1)
                                // b.weeks = b.weeks.splice(i, 1)
                                if (!b.weeks.length) {
                                    i = m.branches.indexOf(b)
                                    m.branches.splice(i, 1)
                                    // m.branches = m.branches.splice(i, 1)
                                }
                            }
                            break;
                        }

                        case ExportType.notDone: {
                            if (w.totalDelivered + w.totalVisited === 0) { }
                            else {
                                // w.visible = false
                                // let bVisible = false
                                // for (const wk of b.weeks) {
                                //     if (wk.visible) {
                                //         bVisible = true
                                //         break
                                //     }
                                // }
                                // b.visible = bVisible
                                let i = b.weeks.indexOf(w)
                                b.weeks.splice(i, 1)
                                // b.weeks = b.weeks.splice(i, 1)
                                if (!b.weeks.length) {
                                    i = m.branches.indexOf(b)
                                    m.branches.splice(i, 1)
                                    // m.branches = m.branches.splice(i, 1)
                                }
                            }
                            break;

                        }
                    }
                }

            }
        }

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

                // r = fb.weeks.length ? 1 : 4
                let maxVisits = 0
                for (const w of b.weeks) {


                    // r += 2
                    let fw = fb.weeks.find(ww => ww.week === w.week)
                    if (!fw) {
                        fw = {
                            week: w.week,
                            col: fb.weeks.length * 5 + 2,
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
            if (!aoa[fm.row + 2]) {
                aoa[fm.row + 2] = [] as string[]
            }

            aoa[fm.row + 2][0] = 'סה"כ' + ' ' + '(' + m.branches.length + ')'
            r = fm.row + 2

            m.branches.sort((a, b) => a.branch.localeCompare(b.branch))

            for (const b of m.branches) {

                // if(!b.visible) continue//#####

                let fb = fm.branches.find(ww => ww.branch === b.branch)!
                if (!aoa[fb.row]) {
                    aoa[fb.row] = [] as string[]
                }
                aoa[fb.row][0] = b.branch

                for (const w of b.weeks) {

                    // if(!w.visible) continue//#####

                    let fw = fb.weeks.find(ww => ww.week === w.week)!
                    aoa[fm.row][fw.col] = w.week
                    aoa[fm.row + 1][fw.col] = 'דייר'
                    aoa[fm.row + 1][fw.col + 1] = 'מתנדב'
                    aoa[fm.row + 1][fw.col + 2] = 'מסרו'
                    aoa[fm.row + 1][fw.col + 3] = 'ביקרו'

                    let tw = totalWeek.find(tw => tw.week === w.week)
                    if (tw) {
                        aoa[fm.row + 2][fw.col] = tw.tt.toString()
                        aoa[fm.row + 2][fw.col + 1] = tw.tvol.toString()
                        aoa[fm.row + 2][fw.col + 2] = tw.td.toString()
                        aoa[fm.row + 2][fw.col + 3] = tw.tv.toString()
                    }

                    // b.weeks.forEach(w => aoa[fm.row + 2][fw.col] = (aoa[fm.row + 2][fw.col] ?? 0) + w.totalTenants)
                    // b.weeks.forEach(w => aoa[fm.row + 2][fw.col + 1] = (aoa[fm.row + 2][fw.col + 1] ?? 0) + w.totalVolunteers)
                    // b.weeks.forEach(w => aoa[fm.row + 2][fw.col + 2] = (aoa[fm.row + 2][fw.col + 2] ?? 0) + w.totalDelivered)
                    // b.weeks.forEach(w => aoa[fm.row + 2][fw.col + 3] = (aoa[fm.row + 2][fw.col + 3] ?? 0) + w.totalVisited)
                    // aoa[fm.row + 2][fw.col+1] = 'סה"כ'
                    // aoa[fm.row + 2][fw.col+2] = 'סה"כ'
                    // aoa[fm.row + 2][fw.col+3] = 'סה"כ'

                    aoa[fb.row][fw.col] = w.totalTenants.toString()
                    aoa[fb.row][fw.col + 1] = w.totalVolunteers.toString()
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
                        aoa[rr][fw.col + 1] = v.volunteers.join(', ')
                        aoa[rr][fw.col + 2] = v.delivered
                        aoa[rr][fw.col + 3] = v.visited
                        // console.log('w.branch', b.branch, 'b.week', w.week, 'v.tenant', v.tenant, 'rr', rr, 'fw.row', fb.row, 'aoa.length', aoa.length)
                    }
                }
            }
        }

        return aoa
    }
}
