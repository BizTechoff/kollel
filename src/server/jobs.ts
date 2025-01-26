// import { remult } from "remult"
import { config } from "dotenv"
import { remult } from "remult"
import { Branch } from "../app/branches/branch"
import { dateEquals, dateFormat, dayOfCreatingVisits, dayOfMonth, DayOfWeek, firstDateOfMonth, firstDateOfWeek, firstDateOfWeekByHomeVisit, lastDateOfMonth, lastDateOfWeek, monthOfYear, resetDateTime } from "../app/common/dateFunc"
import { isValidMobile } from "../app/common/mobileFunc"
import { Job } from "../app/jobs/job"
import { JosStatus } from "../app/jobs/jobStatus"
import { Notification } from "../app/notifications/notification"
import { NotificationStatus } from "../app/notifications/notificationStatus"
import { Tenant } from "../app/tenants/tenant"
import { User } from "../app/users/user"
import { UserBranch } from "../app/users/userBranch"
import { Visit } from "../app/visits/visit"
import { VisitVolunteer } from "../app/visits/visit-volunteer"
import { VisitStatus } from "../app/visits/visitStatus"
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
    // const Hour = 60 * 60 * 1000;
    // const currentDate = new Date()
    // const firstCall = Hour - (currentDate.getMinutes() * 60 + currentDate.getSeconds()) * 1000 - currentDate.getMilliseconds();
    // console.log(`jobsRun will start in: ${('00' + new Date(firstCall).getMinutes()).slice(-2)}:${('00' + new Date(firstCall).getSeconds()).slice(-2)} min`)
    // setTimeout(() => {
    //     api.withRemult(undefined!, undefined!, () => jobsRun());
    //     setInterval(() => api.withRemult(undefined!, undefined!, () => jobsRun()), Hour);
    // }, firstCall);
    // api.withRemult(undefined!, undefined!, async () => await jobsRun())
};

const jobsRun = async () => {


    console.info('isProduction', isProduction)
    let now = new Date()
    console.log(`jobsRun exec at: ${now}`)

    if (!isProduction) {

        // now.setDate(now.getDate() + 2)
        // now.setHours(3)
        // await createWeeklyVisits()
        // console.log('process.env.TZ',process.env['TZ'])
        // await createVolunteerFourWeeksDelivered()
        // await createTenantTwoWeeksMissing()
        // await createVolunteerTwoWeeksMissing()
        // await sendNotifications()
    }

    if (isProduction) {

        // await createVolunteerThreeWeeksMissing()
        let enableAllJobs = (process.env['JOBS_ENABLE_ALL'] ?? 'false') === 'true'

        // if (now.getDate() === 1) {
        //     // now is the last month + 1 
        //     console.log(`jobsRun today is: lastDateOfMonth + 1`)

        //     if (enableAllJobs) {
        //         let hour = now.getHours()
        //         if (hour >= 3 && hour <= 4)//3am
        //         {
        //             await createMonthlyReport()
        //         }
        //     }
        // }

        switch (now.getDay()) {

            // case DayOfWeek.sunday.value: {
            //     console.log(`jobsRun today is: ${DayOfWeek.sunday.caption}`)
            //     if (enableAllJobs) {
            //         let hour = now.getHours()
            //         if (hour >= 3 && hour <= 4)//3am
            //         {
            //             await createTenantThisWeekBirthday()// to manager
            //         }
            //     }
            //     else {
            //         console.log(`jobsRun enableAllJobs = '${enableAllJobs}'`)
            //     }
            //     break;
            // }

            case DayOfWeek.thursday.value: {
                let hour = now.getHours()
                if (hour >= 3 && hour <= 4)//3am
                {
                    await createWeeklyVisits()
                    // if (enableAllJobs) {
                    //     await createTenantTwoWeeksMissing()// to manager
                    //     await createVolunteerTwoWeeksMissing()// to volunteer
                    //     await createVolunteerThreeWeeksMissing()// to manager
                    //     await createVolunteerFourWeeksDelivered()// to volunteer
                    // }
                    // else {
                    //     console.log(`jobsRun enableAllJobs = '${enableAllJobs}'`)
                    // }
                }
                break
            }

            // case DayOfWeek.thursday.value: {
            //     console.log(`jobsRun today is: ${DayOfWeek.thursday.caption}`)
            //     let hour = now.getHours()
            //     if (hour >= 3 && hour <= 4)//3am
            //     {
            //         await createManagerTodayIsThursday()
            //     }
            //     if (hour >= 21 && hour <= 22)//pm
            //     {
            //         await createManagerThursdayMissingFeedback()
            //     }
            //     break;
            // }

            // case DayOfWeek.saturday.value: {
            //     console.log(`jobsRun today is: ${DayOfWeek.saturday.caption}`)
            //     let hour = now.getHours()
            //     if (hour >= 21 && hour <= 22)//pm
            //     {
            //         await createManagerSaturdayMissingReport()
            //     }
            // }

        }

        // await sendNotifications()
    }
}

async function createManagerTodayIsThursday() {

    let today = resetDateTime(new Date())
    let fdate = firstDateOfWeek(today)
    let tdate = lastDateOfWeek(today)

    let job = await remult.repo(Job).findFirst({
        name: 'createManagerTodayIsThursday',
        date: { "$gte": fdate, "$lte": tdate },
        status: JosStatus.done
    })
    if (job) {
        console.log(`Job 'createManagerTodayIsThursday' already done`)
        return
    }

    try {
        for await (const branch of remult.repo(Branch).query({
            where: { system: false, active: true } //, name: 'בדיקות' }
        })) {
            for await (const user of remult.repo(User).query({
                where: {
                    manager: true,
                    active: true,
                    id: ((await remult.repo(UserBranch).find({
                        where: { branch: branch }
                    })).map(ub => ub.user.id))
                }
            })) {
                let message = `בוקר אור! היום יום חמישי!
בהצלחה בדווח 🙂
פרויקט ההתנדבות גט חסד`
                await addNotification({
                    date: today,
                    time: '10:00',
                    user: user.id,
                    mobile: user.mobile,
                    message: message
                })
            }
        }
        await logJob(today, 'createManagerTodayIsThursday', JosStatus.done, '')
    }
    catch (error) {
        await logJob(today, 'createManagerTodayIsThursday', JosStatus.error, JSON.stringify(error))
    }

}

async function createManagerThursdayMissingFeedback() {

    let today = resetDateTime(new Date())
    let fdate = firstDateOfWeek(today)
    let tdate = lastDateOfWeek(today)

    let job = await remult.repo(Job).findFirst({
        name: 'createManagerThursdayMissingReport',
        date: { "$gte": fdate, "$lte": tdate },
        status: JosStatus.done
    })
    if (job) {
        console.log(`Job 'createManagerThursdayMissingReport' already done`)
        return
    }

    try {
        let message = ''
        for await (const branch of remult.repo(Branch).query({
            where: { system: false, active: true } //, name: 'בדיקות' }
        })) {
            let counter = await remult.repo(Visit).count({
                branch: branch,
                date: { // 3w-ago
                    "$gte": fdate,
                    "$lte": tdate
                },
                volunteerWeeklyAnswer: ''
                // status: { '$ne': VisitStatus.none }
            })
            if (counter > 0) {
                for await (const user of remult.repo(User).query({
                    where: {
                        manager: true, active: true,
                        id: ((await remult.repo(UserBranch).find(
                            { where: { branch: branch } }))
                            .map(ub => ub.user.id))
                    }
                })) {
                    message =
                        `המערכת מחכה לתגובתך
פרוייקט ההתנדבות גט חסד`
                    await addNotification({
                        date: today,
                        time: '',//immediate
                        user: user.id,
                        mobile: user.mobile,
                        message: message
                    })
                }
            }
        }
        await logJob(today, 'createManagerThursdayMissingReport', JosStatus.done, '')
    }
    catch (error) {
        await logJob(today, 'createManagerThursdayMissingReport', JosStatus.error, JSON.stringify(error))
    }
}

async function createManagerSaturdayMissingReport() {

    let today = resetDateTime(new Date())
    let fdate = firstDateOfWeek(today)
    let tdate = lastDateOfWeek(today)

    let job = await remult.repo(Job).findFirst({
        name: 'createManagerSaturdayMissingReport',
        date: { "$gte": fdate, "$lte": tdate },
        status: JosStatus.done
    })
    if (job) {
        console.log(`Job 'createManagerSaturdayMissingReport' already done`)
        return
    }

    try {
        let message = ''
        for await (const branch of remult.repo(Branch).query({
            where: { system: false, active: true }// , name: 'בדיקות' }
        })) {
            let counter = await remult.repo(Visit).count({
                branch: branch,
                date: {
                    "$gte": fdate,
                    "$lte": tdate
                },
                status: VisitStatus.none
            })
            if (counter > 0) {
                for await (const user of remult.repo(User).query({
                    where: {
                        manager: true, active: true,
                        id: ((await remult.repo(UserBranch).find(
                            { where: { branch: branch } }))
                            .map(ub => ub.user.id))
                    }
                })) {
                    message =
                        `שבוע טוב ${user?.firstName},
טרם סיימת לדווח במערכת
פרוייקט ההתנדבות גט חסד`
                    await addNotification({
                        date: today,
                        time: '',//immediate
                        user: user.id,
                        mobile: user.mobile,
                        message: message
                    })
                    // console.log(user.mobile )//, message)
                }
            }
        }
        await logJob(today, 'createManagerSaturdayMissingReport', JosStatus.done, '')
    }
    catch (error) {
        await logJob(today, 'createManagerSaturdayMissingReport', JosStatus.error, JSON.stringify(error))
    }
}

async function createTenantThisWeekBirthday() {

    let today = resetDateTime(new Date())
    let fdate = firstDateOfWeek(today)
    let tdate = lastDateOfWeek(today)

    let job = await remult.repo(Job).findFirst({
        name: 'createTenantThisWeekBirthday',
        date: { "$gte": fdate, "$lte": tdate },
        status: JosStatus.done
    })
    if (job) {
        console.log(`Job 'createTenantThisWeekBirthday' already done`)
        return
    }

    await logJob(today, 'createTenantThisWeekBirthday', JosStatus.processing, '')
    console.log(`createTenantThisWeekBirthday..`)

    let message = ''
    try {
        for await (const branch of remult.repo(Branch).query({ where: { system: false, active: true } })) {
            message = ''
            let counter = 0
            for await (const tenant of remult.repo(Tenant).query({
                where: {
                    branch: branch,
                    monthBirthday: monthOfYear(today),
                    dayBirthday: {
                        '$gte': dayOfMonth(fdate),
                        '$lte': dayOfMonth(tdate)
                    }
                },
                orderBy: { branch: "asc", birthday: "desc", name: 'asc' }
            })) {
                if (message.length) {
                    message += ', '
                }
                message += `${tenant.name} בתאריך ${dateFormat(tenant.birthday)}`
                ++counter
            }

            if (counter > 0) {
                for await (const user of remult.repo(User).query({
                    where: {
                        manager: true, active: true,
                        id: ((await remult.repo(UserBranch).find(
                            { where: { branch: branch } }))
                            .map(ub => ub.user.id))
                    }
                })) {
                    message =
                        `לידיעתך! השבוע חל יום ${counter > 1 ? 'הולדתם' : 'הולדתו'} של
${message}
אנא תאמ/י חגיגה עם המתנדבים.
פרוייקט ההתנדבות גט חסד`

                    await addNotification({
                        date: today,
                        time: '10:00',
                        user: user.id,
                        mobile: user.mobile,
                        message: message
                    })
                    // console.log(branch.name, branch.id, user.id, user.name, user.mobile)//, message)
                }
            }
        }
        await logJob(today, 'createTenantThisWeekBirthday', JosStatus.done, '')
    }
    catch (error) {
        await logJob(today, 'createTenantThisWeekBirthday', JosStatus.error, JSON.stringify(error))
    }
}

async function createVolunteerThreeWeeksMissing() {
    let today = resetDateTime(new Date())//s2023, 0, 30)
    let fdate = firstDateOfWeek(today)
    let tdate = lastDateOfWeek(today)

    let job = await remult.repo(Job).findFirst({
        name: 'createVolunteerThreeWeeksMissing',
        date: { "$gte": fdate, "$lte": tdate },
        status: JosStatus.done
    })
    if (job) {
        console.log(`Job 'createVolunteerThreeWeeksMissing' already done`)
        return
    }

    await logJob(today, 'createVolunteerThreeWeeksMissing', JosStatus.processing, '')
    console.log(`createVolunteerThreeWeeksMissing..`)

    let numOfWeeks = 3
    let threeWeeksAgo = firstDateOfWeekByHomeVisit(today)
    let last = lastDateOfWeek(threeWeeksAgo)
    threeWeeksAgo = resetDateTime(last, -(numOfWeeks * 7 - dayOfCreatingVisits.value + 1))
    console.log(threeWeeksAgo, '<-> ', last)

    try {
        let sent = [] as string[]
        let counter = 0
        for await (const branch of remult.repo(Branch).query({ where: { system: false, active: true }, orderBy: { name: 'asc' } })) {
            let message = ''
            let bCounter = 0
            for await (const volunteer of remult.repo(User).query({
                where: {
                    volunteer: true,
                    active: true,
                    id: (await remult.repo(UserBranch).find({
                        where: {
                            branch: branch,
                            user: {
                                $id: {
                                    $ne: (await remult.repo(VisitVolunteer).find({
                                        where: {//all done visits
                                            visit: {
                                                $id: (await remult.repo(Visit).find({
                                                    where: {
                                                        branch: branch,
                                                        date: { // 3w-ago
                                                            "$gte": threeWeeksAgo,
                                                            "$lte": last
                                                        },
                                                        status: { $ne: VisitStatus.none }//done
                                                    }
                                                })).map(v => v.id)
                                            }
                                        }
                                    })).map(ub => ub.volunteer.id)
                                }
                            }
                        }
                    })).map(ub => ub.user.id)
                }
            })) {
                // send only once for volunteer on more then one branch
                if (!sent.includes(volunteer.id)) {
                    sent.push(volunteer.id)
                    if (message.length) {
                        message += '\n'
                    }
                    message += `${volunteer.name}-${volunteer.mobile}`
                    ++bCounter
                }
            }
            if (bCounter > 0) {
                for await (const manager of remult.repo(User).query({
                    where: {
                        manager: true, active: true,
                        id: ((await remult.repo(UserBranch).find(
                            { where: { branch: branch } }))
                            .map(ub => ub.user.id))
                    }
                })) {
                    message = `${message}
${bCounter > 1 ? 'נעדרו' : 'נעדר'} מההתנדבות כבר 3 פעמים
אנא צור ${bCounter > 1 ? 'איתם' : 'איתו'} קשר
פרוייקט ההתנדבות גט חסד`

                    console.log(message.length, '::', message)
                    // await addNotification({
                    //     date: today,
                    //     time: '10:00', 
                    //     user: manager.id,
                    //     mobile: manager.mobile,
                    //     message: message
                    // })
                    ++counter
                }
            }
        }
        await logJob(today, 'createVolunteerThreeWeeksMissing', JosStatus.done, '')
        console.log(`createVolunteerThreeWeeksMissing created ${counter} notificaions.`)
    }
    catch (error) {
        await logJob(today, 'createVolunteerThreeWeeksMissing', JosStatus.error, JSON.stringify(error))
    }
}

async function createTenantTwoWeeksMissing() {

    let today = resetDateTime(new Date())//s2023, 0, 30)
    let fdate = firstDateOfWeek(today)
    let tdate = lastDateOfWeek(today)

    let job = await remult.repo(Job).findFirst({
        name: 'createTenantTwoWeeksMissing',
        date: { "$gte": fdate, "$lte": tdate },
        status: JosStatus.done
    })
    if (job) {
        console.log(`Job 'createTenantTwoWeeksMissing' already done`)
        return
    }

    await logJob(today, 'createTenantTwoWeeksMissing', JosStatus.processing, '')
    console.log(`createTenantTwoWeeksMissing..`)

    let numOfWeeks = 2
    let twoWeeksAgo = firstDateOfWeekByHomeVisit(today)
    let last = lastDateOfWeek(twoWeeksAgo)
    twoWeeksAgo = resetDateTime(last, -(numOfWeeks * 7 - dayOfCreatingVisits.value + 1))
    console.log(twoWeeksAgo, '<-> ', last)

    try {
        let sent = 0
        for await (const branch of remult.repo(Branch).query({ where: { system: false, active: true }, orderBy: { name: 'asc' } })) {
            let message = ''
            let counter = 0
            for await (const tenant of remult.repo(Tenant).query({
                where: {
                    branch: branch,
                    active: true,
                    id: {
                        $ne: (await remult.repo(Visit).find({
                            where: {
                                branch: branch,
                                date: { // 3w-ago
                                    "$gte": twoWeeksAgo,
                                    "$lte": last
                                },
                                status: { $ne: VisitStatus.none }//done
                            }
                        })).map(v => v.tenant.id)
                    }
                }
            })) {
                if (message.length) {
                    message += '\n'
                }
                message += `${tenant.name}`
                ++counter
            }
            if (counter > 0) {
                for await (const manager of remult.repo(User).query({
                    where: {
                        manager: true,
                        active: true,
                        id: ((await remult.repo(UserBranch).find(
                            { where: { branch: branch } }))
                            .map(ub => ub.user.id))
                    }
                })) {
                    message =
                        `${message}
כבר שבועיים ${counter > 1 ? 'שהם' : 'שהוא'} לבד ${counter > 1 ? 'ומחכים' : 'ומחכה'} לביקור,
אנא בדוק עם המתנדבים!
 גט חסד של חבד לנוער`
                    // await addNotification({
                    //     date: today,
                    //     time: '10:00',
                    //     user: user.id,
                    //     mobile: user.mobile,
                    //     message: message
                    // })
                    ++sent
                    console.log(branch.name, '::', message)
                    //  branch.id, manager.id, manager.name, manager.mobile)//, message)
                }
            }
        }
        await logJob(today, 'createTenantTwoWeeksMissing', JosStatus.done, '')
        console.log(`createTenantTwoWeeksMissing created ${sent} notificaions.`)
    }
    catch (error) {
        await logJob(today, 'createTenantTwoWeeksMissing', JosStatus.error, JSON.stringify(error))
    }
}

async function createVolunteerTwoWeeksMissing() {

    let today = resetDateTime(new Date())//s2023, 0, 30)
    let fdate = firstDateOfWeek(today)
    let tdate = lastDateOfWeek(today)

    let job = await remult.repo(Job).findFirst({
        name: 'createVolunteerTwoWeeksMissing',
        date: { "$gte": fdate, "$lte": tdate },
        status: JosStatus.done
    })
    if (job) {
        console.log(`Job 'createVolunteerTwoWeeksMissing' already done`)
        return
    }

    await logJob(today, 'createVolunteerTwoWeeksMissing', JosStatus.processing, '')
    console.log(`createVolunteerTwoWeeksMissing..`)

    let numOfWeeks = 2
    let twoWeeksAgo = firstDateOfWeekByHomeVisit(today)
    let last = lastDateOfWeek(twoWeeksAgo)
    twoWeeksAgo = resetDateTime(last, -(numOfWeeks * 7 - dayOfCreatingVisits.value + 1))
    console.log(twoWeeksAgo, '<-> ', last)

    try {
        let sent = [] as string[]
        let counter = 0
        for await (const branch of remult.repo(Branch).query({ where: { system: false, active: true }, orderBy: { name: 'asc' } })) {
            for await (const volunteer of remult.repo(User).query({
                where: {
                    volunteer: true,
                    active: true,
                    id: (await remult.repo(UserBranch).find({
                        where: {
                            branch: branch,
                            user: {
                                $id: {
                                    $ne: (await remult.repo(VisitVolunteer).find({
                                        where: {//all done visits
                                            visit: {
                                                $id: (await remult.repo(Visit).find({
                                                    where: {
                                                        branch: branch,
                                                        date: { // 3w-ago
                                                            "$gte": twoWeeksAgo,
                                                            "$lte": last
                                                        },
                                                        status: { $ne: VisitStatus.none }//done
                                                    }
                                                })).map(v => v.id)
                                            }
                                        }
                                    })).map(ub => ub.volunteer.id)
                                }
                            }
                        }
                    })).map(ub => ub.user.id)
                }
            })) {
                let message = `${volunteer.name.split(' ')[0].trim()} כשבועיים שלא הגעת
נשמח לשמוע ממך :)
גט חסד של חבד לנוער`
                //                 let message = `${volunteer.name} כבר שבועיים שלא הגעת להתנדבות חבד לנוער
                // נשמח לשמוע ממך :)
                // פרוייקט ההתנדבות גט חסד`

                // send only once for volunteer on more then one branch
                if (!sent.includes(volunteer.id)) {
                    sent.push(volunteer.id)

                    await addNotification({
                        date: today,
                        time: '10:00',
                        user: volunteer.id,
                        mobile: volunteer.mobile,
                        message: message
                    })
                    ++counter
                }
            }
        }
        await logJob(today, 'createVolunteerTwoWeeksMissing', JosStatus.done, '')
        console.log(`createVolunteerTwoWeeksMissing created ${counter} notificaions.`)
    }
    catch (error) {
        await logJob(today, 'createVolunteerTwoWeeksMissing', JosStatus.error, JSON.stringify(error))
    }
}

async function createVolunteerFourWeeksDelivered() {

    let numOfWeeks = 4
    let today = resetDateTime(new Date())
    let fourWeeksAgo = firstDateOfWeekByHomeVisit(today)
    let last = lastDateOfWeek(fourWeeksAgo)
    fourWeeksAgo = resetDateTime(last, -(numOfWeeks * 7 - dayOfCreatingVisits.value + 1))
    console.log(fourWeeksAgo, '<-> ', last)

    let fdate = firstDateOfWeek(today)
    let tdate = lastDateOfWeek(today)
    console.log(fdate, '<-> ', tdate)

    let job = await remult.repo(Job).findFirst({
        name: 'createVolunteerFourWeeksDelivered',
        date: { "$gte": fdate, "$lte": tdate },
        status: JosStatus.done
    })
    if (job) {
        console.log(`Job 'createVolunteerFourWeeksDelivered' already done`)
        return
    }

    await logJob(today, 'createVolunteerFourWeeksDelivered', JosStatus.processing, '')
    console.log(`createVolunteerFourWeeksDelivered..`)

    try {
        let sent = 0
        for await (const branch of remult.repo(Branch).query({ where: { system: false, active: true } })) {
            console.log('branch', branch.name)
            let visits = [] as { volunteer: string, rows: { week: string, counter: number }[] }[]
            for await (const visit of remult.repo(Visit).query({
                where: { // get the volunteers that do did 3 weeks visits
                    branch: branch,
                    date: { // 3w-ago
                        "$gte": fourWeeksAgo,
                        "$lte": last
                    },
                    status: { '$ne': VisitStatus.none }// done
                },
                orderBy: { branch: "asc", date: "desc" }
            })) {

                let vDate = resetDateTime(visit.date)
                let first = firstDateOfWeek(vDate)
                let last = lastDateOfWeek(vDate)
                let weekKey = `${dateFormat(first)}-${dateFormat(last)}`

                let vVolunteers = await remult.repo(VisitVolunteer).find({
                    where: { visit: visit }
                })
                if (vVolunteers?.length) {
                    for (const vv of vVolunteers) {
                        if (vv.volunteer?.active) {
                            let found = visits.find(v => v.volunteer === vv.volunteer.id)
                            if (!found) {
                                found = { volunteer: vv.volunteer.id, rows: [] as { week: string, counter: number }[] }
                                visits.push(found)
                            }
                            let foundWeek = found.rows.find(r => r.week === weekKey)
                            if (!foundWeek) {
                                foundWeek = { week: weekKey, counter: 0 }
                                found.rows.push(foundWeek)
                            }
                            ++foundWeek.counter
                        }
                    }
                }
            }//for

            let volIds = visits.filter(v => v.rows.length >= numOfWeeks).map(v => v.volunteer)// '>=' include extra days
            if (volIds?.length) {
                // console.log(`result ${volIds.length} rows: ${volIds.join(',')}`)
                let message = ''
                for await (const u of remult.repo(User).query({ where: { id: volIds } })) {

                    message += ` ${u.name} יקר יישר כח שאתה נותן מזמנך ומאיר יותר את העולם, 
                    המשך כך!
                    פרוייקט ההתנדבות גט חסד`

                    // await addNotification({
                    //     date: today,
                    //     time: '10:00',
                    //     user: u.id,
                    //     mobile: u.mobile,
                    //     message: message
                    // })

                    ++sent
                }
            }

        }//for
        await logJob(today, 'createVolunteerFourWeeksDelivered', JosStatus.done, '')
        console.log(`createVolunteerTwoWeeksMissing created ${sent} notificaions.`)
    }
    catch (error) {
        await logJob(today, 'createVolunteerFourWeeksDelivered', JosStatus.error, JSON.stringify(error))
    }
}

async function createMonthlyReport() {

    // today if first (1) of the next month
    let today = resetDateTime(new Date())
    let fdate = firstDateOfWeek(today)
    let tdate = lastDateOfWeek(today)

    let job = await remult.repo(Job).findFirst({
        name: 'createMonthlyReport',
        date: { "$gte": fdate, "$lte": tdate },
        status: JosStatus.done
    })
    if (job) {
        console.log(`Job 'createMonthlyReport' already done`)
        return
    }

    await logJob(today, 'createMonthlyReport', JosStatus.processing, '')
    console.log(`createMonthlyReport..`)
    let numOfWeeks = 4

    let dateLastMonth = resetDateTime(new Date(
        today.getFullYear(),
        today.getMonth() - 1,// job run at 1 of the next month, so do -1 to get last month
        1))
    let firstDOM = firstDateOfMonth(dateLastMonth)
    let lastDOM = lastDateOfMonth(firstDOM)

    try {
        for await (const branch of remult.repo(Branch).query({ where: { system: false, active: true } })) {
            console.log('branch', branch.name)
            let visitsTenants = [] as { tenant: string, rows: { date: Date, counter: number }[] }[]
            let visitsVolunteers = [] as { volunteer: string, rows: { date: Date, counter: number }[] }[]
            for await (const visit of remult.repo(Visit).query({
                where: {
                    branch: branch,
                    date: { // month-ago
                        "$gte": firstDOM,
                        "$lte": lastDOM
                    },
                    status: { '$ne': VisitStatus.none }
                },
                orderBy: { branch: "asc", date: "desc" }
            })) {

                let volunteers = await remult.repo(VisitVolunteer).find({ where: { visit: visit } })
                if (volunteers?.length) {
                    for (const vv of volunteers) {

                        let found = visitsVolunteers.find(v => v.volunteer === vv.volunteer.id)
                        if (!found) {
                            found = { volunteer: vv.volunteer.id, rows: [] as { date: Date, counter: number }[] }
                            visitsVolunteers.push(found)
                        }
                        let foundDate = found.rows.find(v => dateEquals(v.date, visit.date))
                        if (!foundDate) {
                            foundDate = { date: visit.date, counter: 0 }
                            found.rows.push(foundDate)
                        }
                        ++foundDate.counter

                    }
                }

                let found = visitsTenants.find(v => v.tenant === visit.tenant.id)
                if (!found) {
                    found = { tenant: visit.tenant.id, rows: [] as { date: Date, counter: number }[] }
                    visitsTenants.push(found)
                }
                let foundDate = found.rows.find(v => dateEquals(v.date, visit.date))
                if (!foundDate) {
                    foundDate = { date: visit.date, counter: 0 }
                    found.rows.push(foundDate)
                }
                ++foundDate.counter

            }//for
            console.log('visitsVolunteers', JSON.stringify(visitsVolunteers))
            console.log('visitsTenants', JSON.stringify(visitsTenants))

            let vCount = await remult.repo(User).count({
                volunteer: true,
                id: (await remult.repo(UserBranch).find({
                    where: { branch: branch }
                })).map(u => u.id)
            })
            let tCount = await remult.repo(Tenant).count({ branch: branch })
            for await (const u of remult.repo(User).query({ where: { manager: true } })) {
                let message = `סיכום חודשי
החודש הגיעו ${visitsVolunteers.length} מתנדבים מתוך ${vCount} שקיימים בסניפך\n
החודש קיבלו ${visitsTenants.length} אברכים מתוך ${tCount} שקיימים בסניפך\n
פרוייקט ההתנדבות גט חסד`

                await addNotification({
                    date: today,
                    time: '10:00',
                    user: u.id,
                    mobile: u.mobile,
                    message: message
                })
            }
        }//for
        await logJob(today, 'createMonthlyReport', JosStatus.done, '')
    }
    catch (error) {
        await logJob(today, 'createMonthlyReport', JosStatus.error, error)
    }
}

async function createWeeklyVisits() {
    let result = 0
    let today = resetDateTime(new Date())
    let fdate = firstDateOfWeek(today)
    let tdate = lastDateOfWeek(today)

    let job = await remult.repo(Job).findFirst({
        name: 'createWeeklyVisits',
        date: { "$gte": fdate, "$lte": tdate },
        status: [JosStatus.done, JosStatus.processing]
    })
    if (job) {
        if (job.status === JosStatus.done) {
            console.log(`Job 'createWeeklyVisits' already done`)
        } else if (job.status === JosStatus.processing) {
            console.log(`Job 'createWeeklyVisits' still running`)
        }
        return
    }

    await logJob(today, 'createWeeklyVisits', JosStatus.processing, '')
    console.log(`createWeeklyVisits..`)
    try {
        let counter = 0
        let bCounter = await remult.repo(Branch).count({ system: false, active: true })
        for await (const branch of remult.repo(Branch).query({ where: { system: false, active: true } })) {
            ++counter
            console.log('branch', branch.name, `${counter}/${bCounter}`)
            let visitsCounter = 0
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
                // for await (const tv of remult.repo(TenantVolunteer).query({ where: { tenant: tenant } })) {
                //     let vv = await remult.repo(VisitVolunteer).findFirst(
                //         {
                //             visit: visit,
                //             volunteer: tv.volunteer
                //         },
                //         { createIfNotFound: true })
                //     if (vv.isNew()) {
                //         await remult.repo(VisitVolunteer).save(vv)
                //     }
                // }
            }
        }
        await logJob(today, 'createWeeklyVisits', JosStatus.done, '')
    }
    catch (error) {
        await logJob(today, 'createWeeklyVisits', JosStatus.error, error)
    }
    return result
}

async function logJob(date: Date, job: string, status: JosStatus, error: any) {
    let log = await remult.repo(Job).findFirst(
        { name: job, date: date },
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
