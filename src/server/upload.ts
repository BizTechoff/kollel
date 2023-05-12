
import * as fetch from 'node-fetch';

export class MediaService {

  addPhoto(id: any, name: any, type: any, imageUrl: any) {
    throw new Error('Method not implemented.');
  }

  uploadS3WithFileExtention = true

  upload = async (f: any, branch: string): Promise<boolean> => {
    let p = new Promise<boolean>(async (resolve, reject) => {
      let message = '';
      let result = false;
      const { v4: uuidv4 } = require('uuid');
      let id = uuidv4()

      let fileName = `${id}`
      if (this.uploadS3WithFileExtention) {
        let split = f.type.split('/')
        if (split.length > 1) {
          fileName += `.${split[1]}`
        }
      }

      // console.log('upload.uuid',id)
      // get secure url from our server//'http://localhost:3000' + 
      const s3SignUrl = `/api/s3Url?key=${'eshel-app-s3-key'}&f=${encodeURI(fileName)}&branch=${encodeURI(branch)}`;
      // console.log('s3SignUrl', s3SignUrl)
      const signRes = await fetch.default(s3SignUrl);

      if (signRes.ok) {
        // coso
        let link = await signRes.json();// JSON.parse(await url.text());// as AwsS3SignUrlResponse;
        // console.log('link', link)
        if (link && link.url && link.url.length > 0)
        // post the image direclty to the s3 bucket
        {
          const linkRes = await fetch.default(link.url, {
            method: "PUT",
            body: f
          })

          if (linkRes.ok) {
            // console.log('linkRes.linkRes', linkRes)
            const imageUrl = link.url.split('?')[0]
            // console.log(imageUrl)
            await this.addPhoto(id, f.name, f.type, imageUrl)
            result = true;
          }
          else {
            // console.log('NOT OK')
            message = `upload.link(${link}): { status: ${linkRes.status}, statusText: ${linkRes.statusText} }`;
            // console.debug(message);
          }
        } else {
          // console.log('NOT OK')
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

  download = async (f: any, branch: string): Promise<boolean> => {
    let p = new Promise<boolean>(async (resolve, reject) => {
      let message = '';
      let result = false;
      const { v4: uuidv4 } = require('uuid');
      let id = uuidv4()

      let fileName = `${id}`
      if (this.uploadS3WithFileExtention) {
        let split = f.type.split('/')
        if (split.length > 1) {
          fileName += `.${split[1]}`
        }
      }

      // console.log('upload.uuid',id)
      // get secure url from our server//'http://localhost:3000' + 
      const s3SignUrl = `/api/download?key=${'eshel-app-s3-key'}&f=${encodeURI(fileName)}&branch=${encodeURI(branch)}`;
      // console.log('s3SignUrl', s3SignUrl)
      const signRes = await fetch.default(s3SignUrl);

      if (signRes.ok) {
        // coso
        let link = await signRes.json();// JSON.parse(await url.text());// as AwsS3SignUrlResponse;
        // console.log('link', link)
        if (link && link.url && link.url.length > 0)
        // post the image direclty to the s3 bucket
        {
          const linkRes = await fetch.default(link.url, {
            method: "PUT",
            body: f
          })

          if (linkRes.ok) {
            // console.log('linkRes.linkRes', linkRes)
            const imageUrl = link.url.split('?')[0]
            // console.log(imageUrl)
            await this.addPhoto(id, f.name, f.type, imageUrl)
            result = true;
          }
          else {
            // console.log('NOT OK')
            message = `upload.link(${link}): { status: ${linkRes.status}, statusText: ${linkRes.statusText} }`;
            // console.debug(message);
          }
        } else {
          // console.log('NOT OK')
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

}
