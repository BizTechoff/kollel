import { Injectable } from '@angular/core';
import * as fetch from 'node-fetch';
import { remult } from 'remult';
import { Branch } from '../branches/branch';
import { Media } from '../media/media';
import { MediaType } from '../media/mediaTypes';
import { Tenant } from '../tenants/tenant';
import { User } from '../users/user';
import { Visit } from '../visits/visit';

@Injectable()
export class uploader {

    branch!: Branch
    visit!: Visit
    tenant!: Tenant
    volunteer!: User

    links = [] as string[]

    constructor(visit: Visit, tenant: Tenant, volunteer: User) {
        this.visit = visit
        this.tenant = tenant
        this.volunteer = volunteer
    }

    async loadFiles(files: any) {
        if (files && files.length > 0) {
            // console.log('loadFiles.branch.before', this.branch)
            if (!this.branch || !this.branch.id || !this.branch.id.trim().length) {
                //console.log('a-10')
                this.branch = await remult.repo(Branch).findId(remult.user?.branch!)
                // console.log('loadFiles.branch.after', this.branch)
                //console.log('a-11')
            }

            for (let index = 0; index < files.length; index++) {
                const file = files[index];

                // console.debug(`loadFiles: { name: ${file.name}, type: ${file.type} }`)
                // if (!mediaAllowedUploadFileTypes.includes(file.type)) {
                //   console.debug(`loadFiles(${file.name}): file type ${file.type} not allowed to upload`)
                //   continue;
                // }
                // let f: File = file; 
                // //console.log('success-0', false)
                let success = await this.upload(file);
            }
        }
        return this.links
    }

    async upload(f: any): Promise<boolean> {
        let p = new Promise<boolean>(async (resolve, reject) => {
            let message = '';
            let result = false;
            const { v4: uuidv4 } = require('uuid');
            let id = uuidv4()

            let fileName = `${id}`
            // if (uploadS3WithFileExtention) {
            //   let split = f.type.split('/')
            //   if (split.length > 1) {
            //     fileName += `.${split[1]}`
            //   }
            // }
            //console.log('upload.1')
            // //console.log('upload.uuid',id)
            // get secure url from our server//'http://localhost:3000' + 
            // console.log('branchEngName', 11111)
            let branchEngName = this.branch.email.trim().split('@')[0]
            const s3SignUrl = `/api/s3Url?key=${'eshel-app-s3-key'}&f=${encodeURI(fileName)}&branch=${encodeURI(branchEngName)}`;
            // //console.log('s3SignUrl', s3SignUrl)
            //console.log('upload.2')
            const signRes = await fetch.default(s3SignUrl);

            // console.log('branchEngName', branchEngName)
            //console.log('upload.3')
            if (signRes.ok) {
                // console.log('branchEngName 1', branchEngName)
                // //console.log('upload.4',await signRes.json())
                // coso
                let link = await signRes.json();// JSON.parse(await url.text());// as AwsS3SignUrlResponse;
                //console.log('upload.4.1',link)
                // //console.log('link', link)
                if (link && link.url && link.url.length > 0)
                // post the image direclty to the s3 bucket
                {
                    // console.log('branchEngName 2', branchEngName)
                    const linkRes = await fetch.default(link.url, {
                        method: "PUT",
                        body: f
                    })

                    if (linkRes.ok) {
                        // //console.log('linkRes.linkRes', linkRes)
                        const imageUrl = link.url.split('?')[0]
                        // //console.log(imageUrl)
                        // console.log('branchEngName 3', branchEngName)
                        await this.addMedia(id, f.name, f.type, imageUrl)
                        this.links.push(imageUrl)
                        result = true;
                    }
                    else {
                        // //console.log('NOT OK')
                        message = `upload.link(${link}): { status: ${linkRes.status}, statusText: ${linkRes.statusText} }`;
                        // console.debug(message);
                    }
                } else {
                    //console.log('upload.5')
                    // //console.log('NOT OK')
                    message = `upload(${f.name}): upSigning Url Failed`;
                    // console.debug(message);
                }
            }
            else {
                message = `upload(${f.name}): { status: ${signRes.status}, statusText: ${signRes.statusText} }`;
                // console.debug(message);
            }
            if (message.length > 0) {
                console.debug(message);
            }
            resolve(result)
            // if (result) {
            //   resolve(result)
            // }
            // else {
            //   reject(message)
            // }
        });
        // let closeBusy = this.busy.showBusy();
        let ret = await p;
        // closeBusy();
        return ret;
    }

    async addMedia(id: string, name: string, type: string, link: string) {
        //console.log('a-1')

        // console.log('branchEngName 4')
        //console.log('a-60',JSON.stringify( this.branch))
        // if(!this.visit){
        //console.log('a-2') 

        // branch: {$id: this.branch?.id },
        //   visit:{$id: this.visit?.id },
        //   tenant: {$id: this.tenant?.id },
        //   volunteer: {$id: this.volunteer?.id },

        if (!this.visit) {
            let media = await remult.repo(Media).findFirst({
                branch: this.branch,
                visit: this.visit,
                tenant: this.tenant,
                volunteer: this.volunteer,
                active: true
            })
            // console.log('branchEngName 5')
            //console.log('a-3')
            if (media) {
                //console.log('a-4')
                media.active = false
                await media.save()
                // console.log('branchEngName 6')
            }
        }
        //console.log('a-5')
        // }
        // console.log('branchEngName 7')
        //console.log('a-6',JSON.stringify( this.branch))
        await remult.repo(Media).insert({
            branch: this.branch,
            visit: this.visit,
            tenant: this.tenant,
            volunteer: this.volunteer,
            type: type.includes('image') ? MediaType.photo : MediaType.video,
            link: link,
            id: id
        })
        // console.log('branchEngName 8')
        //console.log('a-7')
    }

}
