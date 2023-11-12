import { Injectable } from '@angular/core';
import EXIF from 'exif-js';
import * as fetch from 'node-fetch';
import { remult } from 'remult';
import { AppController } from '../appController';
import { Branch } from '../branches/branch';
import { Media } from '../media/media';
import { MediaType } from '../media/mediaTypes';
import { News } from '../news/news';
import { Tenant } from '../tenants/tenant';
import { User } from '../users/user';
import { Visit } from '../visits/visit';

@Injectable()
export class uploader {

  excel = false
  branch!: Branch
  visit!: Visit
  tenant!: Tenant
  volunteer!: User
  news!: News

  links = [] as { file: string, path: string }[]

  constructor(excel: Boolean, visit: Visit, tenant: Tenant, volunteer: User, news: News) {
    this.excel = excel === true ? true : false
    this.visit = visit
    this.tenant = tenant
    this.volunteer = volunteer
    this.news = news
  }

  async handleFiles(files: any[]) {
    if (!this.branch || !this.branch.id || !this.branch.id.trim().length) {
      //console.log('a-10')
      this.branch = await remult.repo(Branch).findId(remult.user?.branch!)
      // console.log('loadFiles.branch.after', this.branch)
      //console.log('a-11')
    }

    var result = [] as string[]
    // var promises = [] as Promise<boolean>[];
    for (const f of files) {
      // let proccess = new Promise<boolean>(async () => {
        // console.log('busy - 100')
        let url = await this.handleFile(f)
        // console.log('busy - 101')
        if (url?.trim().length) {
          result.push(url)
        }
      // })
        // console.log('busy - 10')
      // await proccess
      // console.log('busy - 11')
      // promises.push(proccess);
    }
    // if (promises.length) {
    //   console.log('busy - 10',promises.length)
    //   await Promise.all(promises);
    //   console.log('busy - 11')
    // }
    return result
  }

  async handleFile(file: any) {

    console.log('handleFile', file)

    // var taken = await this.takenOnDate(file) as Date
    // return ''

    var signedUrl = await this.signUrl()//with aws
    if (signedUrl?.trim().length) {
      console.log('signedUrl', signedUrl)
      var uploaded = await this.uploadUrl(signedUrl, file)//to aws
      signedUrl = signedUrl.split('?')[0]
      if (uploaded) {
        console.log('uploaded', uploaded)
        // var taken = await this.takenOnDate(file) as Date
        await this.addToMedia('', signedUrl, file.type)//, taken)
      }
    }

    return signedUrl ?? ''

  }

  async signUrl() {
    let result = '';
    const { v4: uuidv4 } = require('uuid');
    let id = uuidv4()

    let fileName = `${id}`
    let branchEngName = this.branch.email.trim().split('@')[0]
    const s3SignUrl = `/api/s3Url?key=${'eshel-app-s3-key'}&f=${encodeURI(fileName)}&branch=${encodeURI(branchEngName)}&excel=${this.excel ? 'true' : 'false'}`;
    const signRes = await fetch.default(s3SignUrl);
    if (signRes.ok) {
      let link = await signRes.json();
      console.log('link', link)
      if (link && link.url && link.url.length > 0) {
        result = link.url//.split('?')[0]
        console.log('link.result', result, JSON.stringify(link))
      }
    } else {
      console.error(`signUrl.error: { status: ${signRes.status}, statusText: ${signRes.statusText} } `);
    }
    return result
  }

  async uploadUrl(url = '', f: any) {
    console.debug(`uploadUrl: { url: ${url}, f: ${f.name} }`)
    var result = false
    const linkRes = await fetch.default(url, {
      method: "PUT",
      body: f
    })

    if (linkRes.ok) {
      result = true
    } else {
      console.error(`uploadUrl.error: { status: ${linkRes.status}, statusText: ${linkRes.statusText} , all: ${await linkRes.text()}} `);
    }
    return result
  }

  async addToMedia(id = '', link = '', type = '', taken?: Date) {
    var added = await remult.repo(Media).insert({
      branch: this.branch,
      visit: this.visit,
      tenant: this.tenant,
      volunteer: this.volunteer,
      news: this.news,
      type: type.includes('image') ? MediaType.photo : type.includes('video') ? MediaType.video : MediaType.excel,
      link: link,
      taken: taken,
      id: id
    })
    if (added && added.id === id && added.link === link) {
      return true
    }
    return false
  }

  // @ViewChild('img')
  // img!: HTMLImageElement

  async takenOnDate(file: any) {
    const ff = file as File
    console.debug(`takenOnDate: { file: ${file.name}, path: ${file.webkitRelativePath}, type: ${file.type} }`)
    // EXIF.getData(file, function () {
    //   console.log(EXIF.tagKeys(this));
    // });

    let key = 'DateTimeOriginal'

    let defaultOptions = {
      // Segments (JPEG APP Segment, PNG Chunks, HEIC Boxes, etc...)
      tiff: false,
      xmp: false,
      icc: false,
      iptc: true,
      jfif: false, // (jpeg only)
      ihdr: false, // (png only)
      // Sub-blocks inside TIFF segment
      // ifd0: false, // aka image
      ifd1: false, // aka thumbnail
      exif: false,
      gps: true,
    }

    let data2 = await EXIF.getData(
      'D:\\documents\\biztechoff\\test\\image.jpg',
      // 'https://eshel-app.s3.eu-central-1.amazonaws.com/kollel/dev/kollel.kiryat.gat/3cf8ac24-2c9c-49c0-b640-27988b0e1af0',
      () => {
        var make = EXIF.getTag(this, "Make");
        console.log('make', make)
      })
    console.log('data2', data2)
    //DateTimeOriginal
    // let ex = await exifr.getTag(file, '')
    // let data = await EXIF.getData(
    //   file.name + '',
    //   async () => {
    //     console.debug('ex111')
    //     let ex = await EXIF.getAllTags(file)
    //     console.debug('ex222')
    //     console.debug('ex', ex)
    //     console.debug('ex.json', JSON.stringify(ex))
    //   })

    // console.debug('data', data)
    return new Date()
  }


  async loadFiles(files: any) {

    // var v = await this.takenOnDate(files[0])
    // return

    // var taken = await exifr.parse(f)
    // let files1 = Array.from(files)
    // let ex = exifr.parse(files1[0] as File)
    // // let promises = files1.map(exifr.Exifr.parse)
    // // let exifs = await Promise.all(promises)
    // // let dates = exifs.map(exif => exif.DateTimeOriginal.toGMTString())
    // // console.log(`${files.length} photos taken on:`,JSON.stringify( ex))
    // return


    this.links = [] as { file: string, path: string }[]
    let isDevMode = await (new AppController()).isDevMode()
    if (files && files.length) {
      // console.log('loadFiles.branch.before', this.branch)
      if (!this.branch || !this.branch.id || !this.branch.id.trim().length) {
        //console.log('a-10')
        this.branch = await remult.repo(Branch).findId(remult.user?.branch!)
        // console.log('loadFiles.branch.after', this.branch)
        //console.log('a-11')
      }

      for (let index = 0; index < files.length; index++) {
        const file: File = files[index];

        // console.debug(`loadFiles: { isDevMode: ${isDevMode}, name: ${file.name}, type: ${file.type}, path: ${file.webkitRelativePath}, excel: ${this.excel} }`)

        // if (isDevMode) {
        //   if (!this.excel) {
        //     console.info(`DevMode = 'true', Files NOT uploaded! `)
        //     continue
        //   }
        // }

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
      const s3SignUrl = `/api/s3Url?key=${'eshel-app-s3-key'}&f=${encodeURI(fileName)}&branch=${encodeURI(branchEngName)}&excel=${this.excel ? 'true' : 'false'}`;
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
            if (!this.excel) {
              // console.log('dd-dd-dd-dd')
              // console.log(f)
              // var imageCreatedDate = ''
              // var taken = await exifr.parse(f)
              // console.log('d-d-d-d', taken)
              // taken = undefined!
              await this.addMedia(id, f.name, f.type, imageUrl) //, taken)
            }
            this.links.push({ file: id, path: imageUrl })
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

  async addMedia(id: string, name: string, type: string, link: string, taken?: Date) {
    //console.log('a-1')

    // console.log('branchEngName 4')
    //console.log('a-60',JSON.stringify( this.branch))
    // if(!this.visit){
    //console.log('a-2') 

    // branch: {$id: this.branch?.id },
    //   visit:{$id: this.visit?.id },
    //   tenant: {$id: this.tenant?.id },
    //   volunteer: {$id: this.volunteer?.id },

    if (!this.visit && false) {
      // console.log('this.branch', this.branch)
      // console.log('this.visit', this.visit)
      // console.log('this.tenant', this.tenant)
      // console.log('this.volunteer', this.volunteer)

      let media2 = await remult.repo(Media).find({
        where: {
          branch: this.branch,
          visit: this.visit,
          tenant: this.tenant,
          volunteer: this.volunteer,
          active: true
        }
      })

      // console.log('branc?hEngName 4.5+')

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
      news: this.news,
      type: type.includes('image') ? MediaType.photo : type.includes('video') ? MediaType.video : MediaType.excel,
      link: link,
      taken: taken,
      id: id
    })
    // console.log('branchEngName 8')
    //console.log('a-7')
  }

  async download(fileName = ''): Promise<string[]> {
    // let excel = new ExcelController()
    // return await excel.import()
    return [] as string[]
  }

  async download2(fileName = ''): Promise<boolean> {
    let p = new Promise<boolean>(async (resolve, reject) => {
      let message = '';
      let result = false;
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
      let branchEngName = 'eshel.app.test'
      const s3SignUrl = `/api/download?key=${'eshel-app-s3-key'}&f=${encodeURI(fileName)}&branch=${encodeURI(branchEngName)}&excel=${this.excel ? 'true' : 'false'}`;
      // //console.log('s3SignUrl', s3SignUrl)
      //console.log('upload.2')
      const signRes = await fetch.default(s3SignUrl);
      result = true
      // console.log('branchEngName', branchEngName)
      //console.log('upload.3')
      // if (signRes.ok) {
      //   // console.log('branchEngName 1', branchEngName)
      //   // //console.log('upload.4',await signRes.json())
      //   // coso
      //   let link = await signRes.json();// JSON.parse(await url.text());// as AwsS3SignUrlResponse;
      //   //console.log('upload.4.1',link)
      //   // //console.log('link', link)
      //   if (link && link.url && link.url.length > 0)
      //   // post the image direclty to the s3 bucket
      //   {
      //     // console.log('branchEngName 2', branchEngName)
      //     const linkRes = await fetch.default(link.url, {
      //       method: "GET"
      //     })

      //     if (linkRes.ok) {
      //       console.log('download SUCCESS')
      //       let excel = linkRes.body
      //       // //console.log('linkRes.linkRes', linkRes)
      //       // const imageUrl = link.url.split('?')[0]
      //       // // //console.log(imageUrl)
      //       // // console.log('branchEngName 3', branchEngName)
      //       // // if (!this.excel) { 
      //       // //   await this.addMedia(id, f.name, f.type, imageUrl)
      //       // // }
      //       // this.links.push(imageUrl)
      //       // result = true;
      //     }
      //     else {
      //       // //console.log('NOT OK')
      //       message = `upload.link(${link}): { status: ${linkRes.status}, statusText: ${linkRes.statusText} }`;
      //       // console.debug(message);
      //     }
      //   } else {
      //     //console.log('upload.5')
      //     // //console.log('NOT OK')
      //     message = `upload(${fileName}): upSigning Url Failed`;
      //     // console.debug(message);
      //   }
      // }
      // else {
      //   message = `upload(${fileName}): { status: ${signRes.status}, statusText: ${signRes.statusText} }`;
      //   // console.debug(message);
      // }
      // if (message.length > 0) {
      //   console.debug(message);
      // }
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

}
