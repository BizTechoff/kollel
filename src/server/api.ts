import { config } from 'dotenv';
import { createPostgresConnection } from 'remult/postgres';
import { remultExpress } from 'remult/remult-express';
import { AppController } from '../app/appController';
import { Branch } from '../app/branches/branch';
import { BranchController } from '../app/branches/branchController';
import { HelperController } from '../app/common/helperController';
import { ExcelController } from '../app/excelController';
import { JobController } from '../app/jobs/jobController';
import { Media } from '../app/media/media';
import { MediaController } from '../app/media/mediaController';
import { News } from '../app/news/news';
import { NewsBranch } from '../app/news/newsBranch';
import { NewsController } from '../app/news/newsController';
import { NewsUser } from '../app/news/newsUser';
import { Notification } from '../app/notifications/notification';
import { Tenant } from '../app/tenants/tenant';
import { TenantController } from '../app/tenants/tenantController';
import { TenantVolunteer } from '../app/tenants/TenantVolunteer';
import { TenantVolunteerController } from '../app/tenants/tenantVolunteerController';
import { RegisterController } from '../app/users/registerController';
import { SignInController } from '../app/users/SignInController';
import { User } from '../app/users/user';
import { UserBranch } from '../app/users/userBranch';
import { UserController } from '../app/users/userController';
import { Visit } from '../app/visits/visit';
import { VisitVolunteer } from '../app/visits/visit-volunteer';
import { VisitController } from '../app/visits/visitController';
import { VisitVolunteerController } from '../app/visits/visitVolunteerController';

config(); //loads the configuration from the .env file

export const api = remultExpress({
    entities: [User, Branch, Tenant, Visit, News, Media, /*Alarm,*/ Notification, UserBranch,
        TenantVolunteer, VisitVolunteer, NewsUser, NewsBranch],
    controllers: [AppController, SignInController, RegisterController, BranchController, UserController, VisitController,
        VisitVolunteerController, NewsController, TenantController, TenantVolunteerController,
        MediaController, HelperController, JobController, ExcelController],
    getUser: request => request?.session!['user'],
    // {
    //     let ui = request.session!['user']
    //     console.log('ui', JSON.stringify(ui))
    //     return ui
    // },
    dataProvider: async () => {
        // if (process.env['NODE_ENV'] === "production")
        return createPostgresConnection({ configuration: "heroku", sslInDev: !(process.env['DEV_MODE'] === 'DEV') })
        // return undefined; 
    },
    initApi: async remult => {
        try {
            let branchRepo = remult.repo(Branch)
            if (await branchRepo.count() === 0) {
                let branch = await branchRepo.insert({
                    name: 'הנהלה',
                    address: 'הכנסת אורחים 1 ירושלים',
                    email: 'kollel@gmail.com',
                    system: true,
                    group: undefined
                })
            } 
        } catch (err) {
            console.log('initApi-err', err)
        }
 
    }
});
