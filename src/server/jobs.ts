// import { remult } from "remult"
import { config } from "dotenv"
import { remult } from "remult"
import { Branch } from "../app/branches/branch"
import { DayOfWeek, firstDateOfWeek, lastDateOfWeek, resetDateTime } from "../app/common/dateFunc"
import { isValidMobile } from "../app/common/mobileFunc"
import { Job } from "../app/jobs/job"
import { JosStatus } from "../app/jobs/jobStatus"
import { Notification } from "../app/notifications/notification"
import { NotificationStatus } from "../app/notifications/notificationStatus"
import { Tenant } from "../app/tenants/tenant"
import { Visit } from "../app/visits/visit"
import { api } from "./api"
import { SmsService } from "./sms"

config()

/*
todo:
week-key: 'dd.MM.yyyy-dd.MM.yyyy'
group by weeks-keys
last-sent
*/

let isProduction = (process.env['NODE_ENV'] ?? '') === 'production'
console.log('isProduction: ', isProduction)

export const addWomen = async () => {
    console.log('addWomen called')
    // return
    const data = [] as { name: string, address: string, addressremark: string, phone: string, idnumber: string }[]

    const repo = remult.repo(Tenant)
    const branch = await remult.repo(Branch).findId('ec1731c7-9258-4d85-b543-197a062d1006')
    // return
    const newTenants = [] as Tenant[]
    for (const d of data) {
        const t = repo.create()
        t.branch = branch
        t.name = d.name
        t.address = d.address
        t.addressremark = d.addressremark
        t.phone = d.phone
        t.idNumber = d.idnumber
        try {
            await repo.save(t)
            console.log("OK")
            // break
        }
        catch (error) {
            console.log(JSON.stringify(d), error)
            break
        }
    }
}

export const runEveryFullHours = async () => {
    if (isProduction) {
        const Hour = 60 * 60 * 1000;
        const currentDate = new Date()
        const firstCall = Hour - (currentDate.getMinutes() * 60 + currentDate.getSeconds()) * 1000 - currentDate.getMilliseconds();
        console.log(`jobsRun will start in: ${('00' + new Date(firstCall).getMinutes()).slice(-2)}:${('00' + new Date(firstCall).getSeconds()).slice(-2)} min`)
        setTimeout(async () => {
            await api.withRemult(undefined!, undefined!, async () => await jobsRun());
            setInterval(async () => await api.withRemult(undefined!, undefined!, async () => await jobsRun()), Hour);
        }, firstCall);
    }
    else {
        // await api.withRemult(undefined!, undefined!, async () => await addWomen());
        // await api.withRemult(undefined!, undefined!, async () => await createWeeklyVisits());
    }
};

const jobsRun = async () => {


    console.info('isProduction', isProduction)
    let now = new Date()
    console.log(`jobsRun exec at: ${now}`)

    if (isProduction) {

        switch (now.getDay()) {

            case DayOfWeek.thursday.value: {
                let hour = now.getHours()
                if (hour >= 3 && hour <= 4)//3am
                {
                    await createWeeklyVisitsAll()
                }
                break
            }
        }
    }

    // await sendNotifications()
}

async function createWeeklyVisitsAll() { /// _BY_?????_BRANCH_
    for await (const branch of remult.repo(Branch).query({
        where: {
            system: false,
            active: true
        }
    })) {
        await createWeeklyVisits(branch)
    }
}

export async function createWeeklyVisits(branch: Branch) {
    let result = 0
    let today = resetDateTime(new Date())
    let fdate = firstDateOfWeek(today)
    let tdate = lastDateOfWeek(today)

    let enableAllJobs = !!(process.env['JOBS_ENABLE_ALL'] === 'true')

    if (enableAllJobs) {

        let job = await remult.repo(Job).findFirst({
            name: 'createWeeklyVisits',
            date: { "$gte": fdate, "$lte": tdate },
            status: [JosStatus.done, JosStatus.processing],
            branch: branch
        })
        if (job) {
            if (job.status === JosStatus.done) {
                console.log(`Job 'createWeeklyVisits' already done for branch ${branch.name}`)
            } else if (job.status === JosStatus.processing) {
                console.log(`Job 'createWeeklyVisits' still running for branch ${branch.name}`)
            }
            return
        }

        await logJob(branch, today, 'createWeeklyVisits', JosStatus.processing, '')
        console.log(`createWeeklyVisits..`)
        try {
            for await (const tenant of remult.repo(Tenant).query({ where: { active: true, branch: branch }, orderBy: { name: 'asc' } })) {
                console.log('tenant', tenant.name)
                let visit = await remult.repo(Visit).findFirst(
                    {
                        branch: branch,
                        tenant: tenant,
                        date: today
                    },
                    { createIfNotFound: true })
                if (visit.isNew()) {
                    await remult.repo(Visit).save(visit)
                    ++result
                }
            }
            await logJob(branch, today, 'createWeeklyVisits', JosStatus.done, `added ${result} records`)
        }
        catch (error) {
            await logJob(branch, today, 'createWeeklyVisits', JosStatus.error, error)
        }
    }
    else {
        console.error(`enableAllJobs = FALSE, can NOT run 'createWeeklyVisits' job.`)
    }
    return result
}

async function logJob(branch: Branch, date: Date, job: string, status: JosStatus, error: any) {
    let log = await remult.repo(Job).findFirst(
        { name: job, date: date, branch: branch },
        { createIfNotFound: true })
    log.status = status
    log.remark = error?.toString() ?? 'UnKnown'
    // log.date = new Date()
    await log.save()
}

async function addNotification(data: { date: Date, time: string, mobile?: string, email?: string, message?: string, subject?: string, user?: string }) {
    if (data) {
        let notification = remult.repo(Notification).create()
        notification.date = data.date
        notification.time = data.time
        notification.mobile = data.mobile ?? ''
        notification.email = data.email ?? ''
        notification.message = data.message ?? ''
        notification.subject = data.subject ?? ''
        notification.status = NotificationStatus.none
        notification.sender = data.user ?? ''
        await notification.save()
    }
    else {
        console.error('addNotification.data is NULL')
    }
}

async function sendNotifications() {
    let today = new Date()
    let time = ('00' + today.getHours()).slice(-2) + ":" + ('00' + today.getMinutes()).slice(-2)
    let tenMinBack = ('00' + (today.getHours() - 1)).slice(-2) + ":" + '45'
    let tenMinNext = ('00' + (today.getHours())).slice(-2) + ":" + '15'
    // console.log('sendNotifications', today, time, tenMinBack, tenMinNext)
    let sms = new SmsService()
    for await (const notification of remult.repo(Notification).query({
        where: {
            date: today,
            $or: [
                { time: { "$gte": tenMinBack, "$lte": tenMinNext } },
                { time: '' /*immediate*/ }
            ],
            status: NotificationStatus.none
        }
    })) {
        if (isValidMobile(notification.mobile)) {
            let res = await sms.sendSmsMulti({
                international: notification.mobile.startsWith('1'),
                message: notification.message,
                mobiles: [notification.mobile],
                senderid: notification.sender
            })
            if (res.success) {
                notification.status = NotificationStatus.sent
                notification.sent = new Date()
                await notification.save()
            }
            else {
                console.error(`sendNotifications(id: ${notification.id}, mobile: ${notification.mobile})`, JSON.stringify(res))
                notification.status = NotificationStatus.error
                notification.error = res.message
                // notification.sent = new Date()
                await notification.save()
            }
        }
        else {
            console.error(`sendNotifications(id: ${notification.id}, mobile: ${notification.mobile})`, 'INVALID mobile')
            notification.status = NotificationStatus.error
            notification.error = 'סלולרי שגוי'
            // notification.sent = new Date()
            await notification.save()
        }
    }
}
