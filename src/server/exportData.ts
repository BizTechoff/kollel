import { remult } from 'remult';
import * as xlsx from 'xlsx';
import { Branch } from '../app/branches/branch';
import { Visit } from '../app/visits/visit';
import { VisitVolunteer } from '../app/visits/visit-volunteer';
import { VisitStatus } from '../app/visits/visitStatus';

export interface exportData {
    // "excelLine": number;
    // "import-status": string;
    // "error"?: string;
    [caption: string]: any;
}

const COLUMN_BRANCH = 'כולל'
const COLUMN_TENANT = 'דייר'
const COLUMN_VOLUNTEERS = 'מתנדבים'
const COLUMN_DELIVERED = 'מסרו'
const COLUMN_VISITED = 'ביקרו'

export const exportData = async () => {
    console.log('exportData')
    let result = [];
    let fdate = new Date(2023, 1, 6)
    let tdate = new Date(2023, 1, 12)
    for await (const branch of remult.repo(Branch).query({
        where: {
            active: true,
            system: false
        }
    })) { 
        if(branch.id !== '9d7cf4d2-0e9f-4aa0-887f-a436c1261ab2') continue
        let blank: exportData = [];
        blank[COLUMN_BRANCH] = ''
        result.push(blank);
        let branchRow: exportData = [];
        branchRow[COLUMN_BRANCH] = branch.name
        result.push(branchRow);
        for await (const v of remult.repo(Visit).query({
            where: {
                branch: branch,
                // status: { '$ne': VisitStatus.none },
                date: {
                    "$gte": fdate,
                    "$lte": tdate
                }//,
            },
        })) {
            // ++bc
            let volunteersNames = (await remult.repo(VisitVolunteer).find({
                where: { visit: v }
            })).map(v => v.volunteer?.name).join(', ')

            let row: exportData = [];
            row[COLUMN_TENANT] = v.tenant.name
            row[COLUMN_VOLUNTEERS] = volunteersNames
            row[COLUMN_DELIVERED] = (v.status === VisitStatus.delivered ? 'כן' : '')
            row[COLUMN_VISITED] = (v.status === VisitStatus.visited ? 'כן' : '')
            // console.log('v.status',v.status,v.status === VisitStatus.delivered,v.status === VisitStatus.visited,v.status === VisitStatus.none)
            result.push(row);
        }
        // if(bc > 0)
        // break
    }
    let wb = xlsx.utils.book_new();
    wb.Workbook = { Views: [{ RTL: true }] };
    xlsx.utils.book_append_sheet(wb, xlsx.utils.json_to_sheet(result));
    xlsx.writeFile(wb, "visits.xlsx");
}
