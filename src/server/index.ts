import compression from 'compression';
import session from "cookie-session";
import csrf from "csurf";
import { config } from 'dotenv';
import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import sslRedirect from 'heroku-ssl-redirect';
import { SignInController } from '../app/users/SignInController';
import { api } from './api';
import { download, generateUploadURL } from './aws-s3';
import { getRequestMiddleware } from './getRequestMiddleware';
import './jobs';
import { runEveryFullHours } from './jobs';

config(); //loads the configuration from the .env file
// process.env['TZ'] = 'Asia/Jerusalem'
// SqlDatabase.LogToConsole = true 
async function startup() {

    console.log('kollel.startup')

    const app = express();
    app.use(sslRedirect());
    app.use(session({
        secret: process.env["NODE_ENV"] === "production" ? process.env['SESSION_SECRET'] : process.env['SESSION_SECRET_DEV']
    }));
    app.use(compression());
    app.use(helmet({ contentSecurityPolicy: false }));
    // app.use('/api', (req, res, next) => {
    //     //disable csrf for the `currentUser` backend method that is the first call of the web site.
    //     const currentUserMethodName: keyof typeof SignInController = 'currentUser';
    //     if (req.path === '/' + currentUserMethodName)
    //         csrf({ ignoreMethods: ["post"] })(req, res, next);
    //     else
    //         csrf({})(req, res, next);
    // });
    app.use('/api', (req: Request, res: Response, next: NextFunction) => {
        // Disable CSRF for the `currentUser` backend method that is the first call of the website.
        const currentUserMethodName: keyof typeof SignInController = 'currentUser';
        
        if (req.path === '/' + currentUserMethodName) {
            // Ignore CSRF for `currentUser` method
            csrf({ ignoreMethods: ["POST"] })(req, res, next);
        } else {
            csrf({})(req, res, next);
        }
    });
    app.use("/api", (req, res, next) => {
        res.cookie("XSRF-TOKEN", req.csrfToken());
        next();
    });
    app.use(getRequestMiddleware);
    app.use(api);
    // app.get('/test', async (req, res) => {
    //     console.log("i am here")
    //     api.withRemult(undefined!, undefined!, async () => {
    //         res.json(await remult.repo(Branch).count())
    //     })

    // })

    await runEveryFullHours()
    // await createWeeklyVisits()

    // migrate()

    app.get("/api/s3Url", async (req, res) => {//?key=[key]&f=[fname]&branch=[branch]
        // console.log('upload.10')
        let result: { url: string, error: string } = { url: '', error: '' };
        let key = req.query['key'] as string;
        if (key === process.env['AWS_CLIENT_KEY']!) {
            // console.log('upload.11')
            let fName = req.query['f'] as string;
            let branch = req.query['branch'] as string;
            let excel1 = req.query['excel'] as string;
            let excel = excel1?.trim().toLocaleLowerCase() === 'true' ? true : false
            // console.log('fName', fName, 'branch', branch, 'key', key);
            if (fName && fName.length > 0) {
                result.url = await generateUploadURL('putObject', fName, branch, excel)
            }
            else {
                result.error = 's3Url.NO File Name'
            }
        }
        else {
            // console.log('upload.12')
            result.error = 's3Url.NOT ALLOWED'
        }
        res.send(JSON.stringify(result));
    })
 
    app.get("/api/download", async (req, res) => {//?key=[key]&f=[fname]&branch=[branch]
        // console.log('upload.10')
        let result: { data: string[], error: string } = { data: [] as string[], error: '' };
        let key = req.query['key'] as string;
        if (key === process.env['AWS_CLIENT_KEY']!) {
            // console.log('upload.11')
            let fName = req.query['f'] as string;
            let branch = req.query['branch'] as string;
            let excel1 = req.query['excel'] as string;
            let excel = excel1?.trim().toLocaleLowerCase() === 'true' ? true : false
            // console.log('fName', fName, 'branch', branch, 'key', key);
            if (fName && fName.length > 0) {
                result.data.push(... await download(fName, branch))
                //  result.url = await generateUploadURL('getObject', fName, branch, excel)
            }
            else {
                result.error = 's3Url.NO File Name'
            }
        }
        else {
            // console.log('upload.12')
            result.error = 's3Url.NOT ALLOWED'
        }
        res.send(JSON.stringify(result));
    })

    app.use(express.static('dist/kollel'));
    app.use('/*', async (req, res) => {
        req.session
        if (req.headers.accept?.includes("json")) {
            console.log(req);
            res.status(404).json("missing route: " + req.originalUrl);
            return;
        }
        try {
            res.sendFile(process.cwd() + '/dist/kollel/index.html');
        } catch (err) {
            res.sendStatus(500);
        }
    });
    let port = process.env['PORT'] || 3002;
    app.listen(port);
}

startup();
