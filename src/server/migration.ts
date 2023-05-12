import { remult } from "remult";
import * as xlsx from 'xlsx';
import { Branch } from "../app/branches/branch";
import { dateFormat, firstDateOfWeek, lastDateOfWeek, resetDateTime } from "../app/common/dateFunc";
import { Tenant } from "../app/tenants/tenant";
import { TenantVolunteer } from "../app/tenants/TenantVolunteer";
import { User } from "../app/users/user";
import { UserBranch } from "../app/users/userBranch";
import { VisitController } from "../app/visits/visitController";
import { ExportType } from "../app/visits/visits-export/exportType";
import { EmailService } from "./email";

const folder = `D:\\documents\\אשל ירושלים\\חבד לנוער\\migration`
const delimiter = ';'

export const migrate = async () => {

    // api.withRemult(undefined!, undefined!, async () => await sendEmailTest())
    // api.withRemult(undefined!, undefined!, async () => await addTenantBirthday());

    // api.withRemult(undefined!, undefined!, async () => await importBranches());
    // api.withRemult(undefined!, undefined!, async () => await importUsers());
    // api.withRemult(undefined!, undefined!, async () => await importTenants());

}

async function sendEmailTest() {
    let query = new VisitController()

    let today = resetDateTime(new Date())
    query.fdate = firstDateOfWeek(today)
    query.tdate = lastDateOfWeek(today)
    query.detailed = true
    query.type = ExportType.done
    let result = await query.exportVisits()
    // excel-sheet
    let wb = xlsx.utils.book_new();
    wb.Workbook = { Views: [{ RTL: true }] };

    xlsx.utils.book_append_sheet(
        wb,
        xlsx.utils.json_to_sheet(result),
        `${dateFormat(query.fdate, '.')}-${dateFormat(query.tdate, '.')}`);
    let fileName = `גט חסד דוח דיווחים${query.detailed ? ' מפורט' : ''}.${'xlsx'}`
    let f = xlsx.writeFile(
        wb,
        fileName,
        {
            bookType: 'xlsx',
            Props: { Company: 'BizTechoff™' },
            cellStyles: true
        });

    let email = new EmailService()
    let res = await email.sendEmail({
        senderid: '1',
        emails: ['biztechoff.app@gmail.com'],
        subject: 'From Job Sending Email',
        html: `
                 <div style="text-align: center">
                     <span>Hi, email sent to you on: ${new Date().toLocaleString()}</span>
                 </div>
                 `,
        attachment: fileName // 'https://eshel-app.s3.eu-central-1.amazonaws.com/excel/%D7%A8%D7%A9%D7%99%D7%9E%D7%AA+%D7%93%D7%99%D7%99%D7%A8%D7%99%D7%9D+%D7%9C%D7%A7%D7%9C%D7%99%D7%98%D7%94.xlsx'
    })
    console.info(JSON.stringify(res))
}

async function addTenantBirthday(): Promise<void> {
    console.log(`tenants.birthday.count.before: ${await remult.repo(Tenant).count({ birthday: { "$gt": new Date(1905, 1, 1) } })}`)
    let file = folder + '\\' + 'get.chesed.tenants.birthdays.csv'
    let lines = require('fs').readFileSync(file, 'utf-8').split(/\r?\n/);
    console.log('lines', lines.length)
    let counter = 0
    let fcounter = 0
    for (const line of lines) {
        ++counter
        if (line.trim().length) {
            // console.log(line)
            let cols = line.split(delimiter)
            let birthday = cols[0].trim()
            let id = cols[1].trim()

            let found = await remult.repo(Tenant).findId(id)
            if (found) {
                ++fcounter
                found.birthday = birthday
                await found.save()
                // return
                console.log('found.birthday', found.birthday, birthday)
            }

            console.log('addTenantBirthday', birthday, id)
        }
    }
    console.log('fcounter', fcounter)
    console.log(`tenants.birthday.count.after: ${await remult.repo(Tenant).count({ birthday: { "$gt": new Date(1905, 1, 1) } })}`)
}

async function test(): Promise<void> {
    console.log(`tenants.count.before: ${await remult.repo(Tenant).count()}`)
    let file = folder + '\\' + 'get.chesed.tenants.csv'
    let lines = require('fs').readFileSync(file, 'utf-8').split(/\r?\n/);
    let counter = 0
    for (const line of lines) {
        ++counter
        if (line.trim().length) {
            // console.log(line)
            let cols = line.split(delimiter)
            console.log(cols[10].trim())
            let vids = JSON.parse(cols[10].trim())
            console.log(vids)
            // console.log(cols)
            // let tenant = await remult.repo(Tenant).insert({
            //     id: cols[0].trim(),
            //     branch: cols[1].trim(),
            //     referrer: Number.parseInt(cols[2].trim()),
            //     name: cols[3].trim(),
            //     mobile: cols[4].trim(),
            //     address: cols[5].trim(),
            //     languages: cols[6].trim(),
            //     active: true, //[7]
            //     // birthday: new Date(cols[8].trim()),
            //     // age: Number.parseInt(cols[9].trim()),
            //     // defvids --> TenantVolunteer [10]
            //     // created: new Date(cols[11].trim()),
            //     // modified: new Date(cols[12].trim()),
            //     createdby: cols[13].trim(),
            //     modifiedby: cols[14].trim(),
            //     phone: cols[15].trim(),
            //     addressremark: cols[16].trim(),
            //     apartment: cols[17].trim(),
            //     floor: cols[18].trim(),
            //     referrerremark: cols[19].trim(),
            //     foodcount: Number.parseInt(cols[20].trim()),
            //     gender: Number.parseInt(cols[21].trim()),
            //     fooddeliveryarea: cols[22].trim()
            // })
            // let vols = cols[10].trim()
            // for (const vol of vols) {
            //     await remult.repo(TenantVolunteer).insert({
            //         tenant: tenant,
            //         volunteer: await remult.repo(User).findId(vol.id)
            //     })
            // }

            break
            if (counter % 100 === 0) {
                console.log(`${counter}/${lines.length}`)
            }
        }
    }
    console.log(`tenants.count.after: ${await remult.repo(Tenant).count()}`)
}

async function importBranches(): Promise<void> {
    console.log(`brnaches.count.before: ${await remult.repo(Branch).count()}`)
    let file = folder + '\\' + 'get.chesed.branches.csv'
    let lines = require('fs').readFileSync(file, 'utf-8').split(/\r?\n/);
    for (const line of lines) {
        if (line.trim().length) {
            let cols = line.split(delimiter)
            await remult.repo(Branch).insert({
                id: cols[0].trim(),
                name: cols[1].trim(),
                address: cols[2].trim(),
                email: cols[3].trim(),
                system: false
            })
        }
    }
    console.log(`brnaches.count.after: ${await remult.repo(Branch).count()}`)
}

async function importTenants(): Promise<void> {
    console.log(`tenants.count.before: ${await remult.repo(Tenant).count()}`)
    let file = folder + '\\' + 'get.chesed.tenants.csv'
    let lines = require('fs').readFileSync(file, 'utf-8').split(/\r?\n/);
    let counter = 0
    for (const line of lines) {
        ++counter
        if (line.trim().length) {
            // if(!line.includes('שבתאי')) continue
            // console.log(line)
            let cols = line.split(delimiter)
            // console.log(cols)
            let tenant = await remult.repo(Tenant).insert({
                id: cols[0].trim(),
                branch: cols[1].trim(),
                referrer: Number.parseInt(cols[2].trim()),
                name: cols[3].trim(),
                mobile: cols[4].trim().padStart(10, '0'),
                address: cols[5].trim(),
                languages: cols[6].trim(),
                active: true, //[7]
                // birthday: new Date(cols[8].trim()),
                // age: Number.parseInt(cols[9].trim()),
                // defvids --> TenantVolunteer [10]
                // created: new Date(cols[11].trim()),
                // modified: new Date(cols[12].trim()),
                createdby: cols[13].trim(),
                modifiedby: cols[14].trim(),
                phone: cols[15].trim(),
                addressremark: cols[16].trim(),
                apartment: cols[17].trim(),
                floor: cols[18].trim(),
                referrerremark: cols[19].trim(),
                foodcount: Number.parseInt(cols[20].trim()),
                gender: Number.parseInt(cols[21].trim()),
                fooddeliveryarea: cols[22].trim()
            })
            let vols = cols[10].trim() as string //as {id:string, name:string}[]
            // console.log('vols', vols)
            while (true) {
                let i = vols.indexOf('id')
                // console.log('i', i)
                if (i < 0) {
                    break
                }
                vols = vols.slice(i + 7)
                // console.log('vols', vols)

                let id = vols.slice(0, 36)
                // console.log('id', id)

                await remult.repo(TenantVolunteer).insert({
                    tenant: tenant,
                    volunteer: await remult.repo(User).findId(id)
                })
            }
            if (counter % 100 === 0) {
                console.log(`${counter}/${lines.length}`)
            }
        }
    }
    console.log(`tenants.count.after: ${await remult.repo(Tenant).count()}`)
}

async function importUsers(): Promise<void> {
    console.log(`users.count.before: ${await remult.repo(User).count()}`)
    let file = folder + '\\' + 'get.chesed.users.csv'
    let lines: string[] = require('fs').readFileSync(file, 'utf-8').split(/\r?\n/);
    let counter = 0
    for (const line of lines) {
        ++counter
        if (line.trim().length) {
            // console.log(line)
            let cols = line.split(delimiter)
            // console.log(cols)
            try {
                let user = await remult.repo(User).insert({
                    id: cols[0].trim(),
                    // branch: cols[1].trim(),
                    name: cols[2].trim(),
                    // languages: cols[3].trim(),
                    mobile: cols[4].trim().padStart(10, '0'),
                    email: cols[5].trim(),
                    // clickedlink: false, //[6]
                    // birthday: new Date(cols[7].trim()),
                    // deftid: cols[8].trim(),
                    // password: cols[9].trim(),
                    admin: cols[10].trim().toLowerCase() === 'true', //[10]
                    donor: cols[11].trim().toLowerCase() === 'true', //[11]
                    // board: cols[12].trim().toLowerCase() === 'true', //[12]
                    manager: cols[13].trim().toLowerCase() === 'true', //[13]
                    volunteer: cols[14].trim().toLowerCase() === 'true', //[14]
                    active: cols[15].trim().toLowerCase() === 'true', //[15]
                    // age: Number.parseInt(cols[16].trim()),
                    // points: Number.parseInt(cols[17].trim()),
                    // created: new Date(cols[18].trim()),
                    // modified: new Date(cols[19].trim()),
                    createdBy: cols[20].trim(),
                    modifiedBy: cols[21].trim(),
                    // branch2: cols[22].trim(),
                    verifyCode: cols[23].trim(),
                    // verifyTime: new Date(cols[24].trim()),
                    address: cols[25].trim()
                })

                let b = cols[1].trim()
                if (b.length) {
                    await remult.repo(UserBranch).insert({
                        branch: await remult.repo(Branch).findId(b),
                        user: user
                    })
                }
                else {
                    await remult.repo(UserBranch).insert({
                        branch: await remult.repo(Branch).findFirst({ system: true }),
                        user: user
                    })
                }

                b = cols[22].trim()
                if (b.length) {
                    await remult.repo(UserBranch).insert({
                        branch: await remult.repo(Branch).findId(b),
                        user: user
                    })
                }

                // let vols = [cols[1].trim(), cols[22].trim()]
                // // console.log(vols) 
                // for (const branch of vols) {
                //     // console.log('branch', branch, !branch)
                //     await remult.repo(UserBranch).insert({
                //         branch: branch?.trim().length ? await remult.repo(Branch).findId(branch) : await remult.repo(Branch).findFirst({ system: true }),
                //         user: user
                //     })
                // }
            }
            catch (error) {
                console.error(error, cols[4].trim().padStart(10, '0'), cols)
            }
            // break
            if (counter % 100 === 0) {
                console.log(`${counter}/${lines.length}`)
            }
        }
        // break
    }
    console.log(`users.count.after: ${await remult.repo(User).count()}`)
}


// let start = vols.indexOf(':')
// console.log('start', start)
// if (start > 1) {
//     let id = vols.slice(start).replace('"', '').replace('"', '').replace('"', '').replace('"', '').replace('"', '')
//     console.log('id', id)
// }
// console.log('vols', vols)
// let splitVols = vols.split(',')
// console.log('splitVols', splitVols)
// for (const s of splitVols) {
//     let start = vols.indexOf(':')
//     console.log('start', start)
//     if (start > 1) {
//         let id = vols.slice(start).replace('"', '').replace('"', '').replace('"', '').replace('"', '').replace('"', '')
//         console.log('id', id)
//     }
// }
// console.log('vols',vols,vols.length)
// console.log('cols[10].trim()',JSON.parse(cols[10].trim()))

// for (const vol of vols) {
//     // console.log('vol',vol.id)
// //     await remult.repo(TenantVolunteer).insert({
// //         tenant: tenant,
// //         volunteer: await remult.repo(User).findId(vol.id)
// //     })
// }
