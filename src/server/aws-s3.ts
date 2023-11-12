import * as fs from 'fs'; //
import * as fetch from 'node-fetch';
import * as xlsx from 'xlsx';

// const randomBytes = promisify(crypto.randomBytes)
//https://www.youtube.com/watch?v=yGYeYJpRWPM&ab_channel=SamMeech-Ward

// const aws =  require('aws-sdk')

const s3Client = async () => {
    let result = undefined
    if (process.env['S3_CHANNEL_OPENED'] === 'true') {
        const region = process.env['AWS_S3_IAM_BTO_REGION']
        const accessKeyId = process.env['AWS_S3_IAM_BTO_APP_ACCESS_KEY_ID']
        const secretAccessKey = process.env['AWS_S3_IAM_BTO_APP_SECRET_ACCESS_KEY']

        const aws = require('aws-sdk')
        result = new aws.S3({
            region,
            accessKeyId,
            secretAccessKey,
            signatureVersion: 'v4'
        })
        // console.debug('result',result);
    }
    else {
        console.debug('s3Client.error: aws-S3 Channel is Closed!!');
    }
    return result
}

export async function generateUploadURL(action: string, fName: string, branch: string, excel = false) {
    console.debug(`generateUploadURL: { fName: ${fName}, branch: ${branch}, excel: ${excel} }`);

    let result = ''
    const s3 = await s3Client()
    if (s3) {
        let key = 'kollel/' +
            (
                excel
                    ? 'excel/tenants'
                    : 'dev'
            ) +
            '/' + branch + "/" + fName
        console.log(`upload.url.key: ${key}`)
        const params = ({
            Bucket: process.env['AWS_S3_IAM_BTO_APP_BUCKET']!,
            Key: key,
            Expires: 60 //sec
        })
        result = await s3.getSignedUrlPromise(action, params)
        console.log('signed-url: ' + result)
        // var d = s3.getSignedUrlPromise(action, params)
        // d.then(
        //     (url = '') => { /*success*/ },
        //     (err = '') => { /*failure*/ })
    }
    return result;
}

export async function download(fileName = '', branch = '') {
    console.debug(`download: { fName: ${fileName}, branch: ${branch} }`);
    let result = [] as string[]
    if (fileName?.trim().length) {
        const s3 = await s3Client()
        if (s3) {
            let key = 'kollel/' + 'excel/tenants' + '/' + branch + "/" + fileName
            const params = ({
                Bucket: process.env['AWS_S3_IAM_BTO_APP_BUCKET']!,
                Key: key
            })

            await s3.getObject(params, async (err: any, data: any) => {
                if (err) {
                    console.error('getObject return error', err, err.stack)
                }
                else {
                    let wb = xlsx.read(data.Body, {})
                    if (wb) {
                        let ws = wb.Sheets['Sheet1']
                        let range = xlsx.utils.decode_range(ws['!ref']!);
                        console.log('range', range)
                        for (let row = range.s.r; row <= range.e.r; ++row) {
                            let values = [] as string[]
                            for (let col = range.s.c; col <= range.e.c; ++col) {
                                if (col >= 1 && row >= 2) {
                                    let value = ''
                                    try {
                                        let cell = ws[xlsx.utils.encode_cell({ c: col, r: row })]
                                        if (cell) { value = cell.v }
                                    }
                                    catch (err) { console.error(`[${row},${col}]=${value}`, err) }
                                    // console.log(`[${col},${row}]=[${row},${col}]=${value}`)
                                    values.push(value)
                                }
                            }
                            if (values.length) {
                                result.push(values.join('|'))
                            }
                        }
                    }
                }
            }).promise()
        }
    }
    return result
}

export async function downloadByLink(link = '') {
    console.debug(`download: { link: ${link} }`);
    let result = false
    if (link?.trim().length) {

        let i = link.indexOf('/dev')
        if (i > 0) {
            let fileName = link.substring(link.lastIndexOf('/') + 1)
            let key = link.substring(i + 1)
            console.debug(`download: { bucket: ${process.env['AWS_S3_IAM_BTO_APP_BUCKET']!}, key: ${key} }`);

            // let res = await fetch.default(link)
            // if(res?.ok){

            // }
            // else{
            //     console.error(res?.statusText)
            // }
            //      return       
            const s3 = await s3Client()
            if (s3) {
                const params = ({
                    Bucket: process.env['AWS_S3_IAM_BTO_APP_BUCKET']!,
                    Key: 'kollel/' + key
                })
                var fileStream = await s3.getObject(params).createReadStream()

                await s3.getObject(params, async (err: any, data: any) => {
                    if (err) {
                        console.error('getObject return error', err, err.stack)
                    }
                    else {
                        console.log('OKKKKKKKKKKKKKKK', fileName, data.Body)
                        // let fs = require('fs')
                        // fs.writeFile('moti.jpg', data.Body)
                        fs.writeFile(fileName, data.Body, (err: any) => {
                            if (err) {
                                console.error(`Error download from link '${link}': ${err?.stack}`)
                            }
                            else {
                                result = true
                                console.info('SAVED!')
                            }
                        });

                        console.log('data', data)
                    }
                }).promise()
            }
        }
    }
    return result
}

export async function upload(text = '', branch = '') {
    console.debug(`upload: { text: ${text}, branch: ${branch} }`);
    let result = { id: '', link: '' }

    if (text?.trim().length && branch?.trim().length) {

        //https://www.npmjs.com/package/text-to-picture
        // const textToPicture = require('text-to-picture')
        //         const convert = await textToPicture.convert({
        //             text: 'שלום hi עברית english',// text.trim(),
        //             size: 32
        //         })
        //         const buf = await convert.getBuffer()
        // console.log('getBase64',await convert.getBase64())

        // https://www.npmjs.com/package/text2png
        const text2png = require('text2png');
        const buf = text2png(
            text,
            {
                font: '30px sans-serif',// '80px Futura',
                textAlign: 'center',
                strokeWidth: 2,
                strokeColor: 'black',
                color: 'teal',
                backgroundColor: 'linen',
                lineSpacing: 10,
                padding: 20//,
                // output: 'canvas'
            })

        const { v4: uuidv4 } = require('uuid');
        let id = uuidv4()
        let fileName = `${id}`

        let url = await generateUploadURL(
            'putObject',
            fileName,
            branch,
            false)

        if (url?.trim().length) {
            console.log('url', url)
            const linkRes = await fetch.default(url, {
                method: "PUT",
                body: buf
            })
            console.log('PUT OK')

            if (linkRes?.ok) {
                result.link = linkRes.url.split('?')[0]
                result.id = id
            }
        }

    }
    else console.error('upload.error: NO BRANCH')


    return result
}
