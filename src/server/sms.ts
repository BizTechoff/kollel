import FormData from 'form-data';
import * as fetch from 'node-fetch';

export interface SmsMultiRequest {
    senderid: string,
    mobiles: string[],
    message: string,
    international: boolean
}
export interface SmsMultiResponse {
    success: boolean,
    message: string,
    count: number
};

export interface SmsRequest {
    uid: string,
    mobile: string,
    message: string,
    international: boolean
}
export interface SmsResponse {
    success: boolean,
    message: string,
    count: number
};

export class SmsService {

    sendSmsMulti = async (req: SmsMultiRequest): Promise<SmsMultiResponse> => {
        let result: SmsMultiResponse = { success: false, message: '', count: 0 };
        // const open = (process.env['SMS_CHANNEL_OPENED']?.trim().toLowerCase() === 'true') ?? false
        const open = ((process.env['SMS_CHANNEL_OPENED'] ?? 'false') === 'true') ?? false
        if (open) {
            const payload =
                `
                <multiXML>
                    <User>
                        <Username>${process.env['SMS_ACCOUNT']!}</Username>
                        <Password>${process.env['SMS_PASSWORD']!}</Password>
                    </User>
                    <send>
                        <Content Type="SMS">
                            <Message>${req.message}</Message>
                        </Content>
                        <Recipients>
                            ${req.mobiles?.map(m => `<PhoneNumber>${m}</PhoneNumber>`).join('')}
                        </Recipients>
                        <Settings>
                            <Sender>${process.env['SMS_FROM_NAME']!}</Sender>
                            <international>${req.international ? '1' : '0'}</international>
                            <CustomerMessageID>${req.senderid}</CustomerMessageID>
                            <feedback>1</feedback>
                        </Settings>
                    </send>
                </multiXML>
            `

            // <DeliveryNotificationUrl></DeliveryNotificationUrl>
            // <DeliveryNotificationMethod></DeliveryNotificationMethod>
            // <feedback></feedback>
            // <voiceFile></voiceFile>
            // <sendID>${req.mobiles.length}</sendID>
            // <scheduledatetime></scheduledatetime>

            console.log('sendSmsMulti.payload', payload)

            var formData = new FormData();
            formData.append("multiXML", payload);

            let url = process.env['SMS_MULTI_URL']!
            try {
                let r = await fetch.default(url, {
                    method: 'POST',
                    headers: formData.getHeaders(),
                    body: formData
                });

                let res = await r.text();
                let json = JSON.parse(res)
                result.success = json.success ?? false;
                result.message = json.Message ? json.Message : json.Error ? JSON.stringify(json.Error) : 'unKnown';
                result.count = json.smsCount ?? 0;
                console.log('sendSmsMulti.result:' + JSON.stringify(result));
            } catch (err) {
                result.message = `${JSON.stringify(err)}`
                console.log('sendSmsMulti.err: ' + err);
            }
        }
        else {
            result.message = 'ערוץ מסרונים סגור'
            console.debug(`sendSmsFlash.return: Sms channel is close!`);
        }

        return result;
    }

    sendSmsFlash = async (req: SmsRequest): Promise<SmsResponse> => {
        let result: SmsResponse = { success: false, message: '', count: 0 };

        // load requested Sms-class details
        // let sms = await remult.repos(Sms).findId(req.smsId)

        let payload = {
            user: process.env['SMS_ACCOUNT']!,
            password: process.env['SMS_PASSWORD']!,
            from: process.env['SMS_FROM_NAME']!,
            recipient: req.mobile,
            message: req.message,// encodeURI(req.message),
            message_type: 'FLASH',
            customermessageid: req.uid,
            international: req.international ? '1' : '0',
        }

        const open = (process.env['SMS_CHANNEL_OPENED'] === 'true') ?? false
        if (open) {
            let url = process.env['SMS_FLASH_URL']!
            let r = await fetch.default(url, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json; charset=UTF-8',
                    'Cache-Control': 'no-store'
                },
                body: JSON.stringify(payload)
            });

            if (r) {
                if (r?.ok) {//received from provider
                    let res = await r.text();
                    let json = JSON.parse(res)
                    result.success = json.success ?? false;
                    result.message = json.Message ? json.Message : json.Error ? JSON.stringify(json.Error) : 'unKnown';
                    result.count = json.smsCount ?? 0;
                    console.log('sendSmsFlash result:' + JSON.stringify(result));
                }
                else {
                    console.debug(`sendSmsFlash.error: { status: ${r.status}, statusText: ${r.statusText} } `);
                }
            }
            else {
                console.debug(`sendsendSmsFlashSms.return: fetch.default.error`);
            }
        }
        else {
            console.debug(`sendSmsFlash.return: Sms channel is close!`);
        }
        return result
    }

}


// export interface SmsRequest {
//     uid: string,
//     mobile: string,
//     message: string,
//     messageType: string,//'FLASH','SMS'
//     schedule?: string,//YYYY-MM-DD+HH:mm:ss
//     international: boolean
// }
// export interface SmsResponse {
//     success: boolean,
//     message: string,
//     count: number
// };
// export interface GroupCreateRequest {
//     groupName: string,
//     groupDescription: string,
//     international: boolean
// }
// export interface GroupCreateResponse {
//     success: boolean,
//     message: string,
//     count: number
// }
// export interface GroupAddRecipientsRequest {
//     groupName: string,
//     recipientsArray: string[]
// }
// export interface GroupAddRecipientsResponse {
//     success: boolean,
//     message: string,
//     count: number
// }
// export interface SmsToGroupsRequest {
//     uid: string,
//     groups: string[],
//     message: string,
//     messageType: string,//'FLASH','SMS'
//     schedule?: string,//YYYY-MM-DD+HH:mm:ss
//     international: boolean
// }
// export interface SmsToGroupsResponse {
//     success: boolean,
//     message: string,
//     count: number
// };

// MAX_RECIPIENTS = 500000

// private async _sendToProvider(action = '', payload = {}): Promise<string> {
//     console.log('action', action)
//     console.log('payload', payload)
//     let result = ''
//     const open = (process.env['SMS_CHANNEL_OPENED'] === 'true') ?? false
//     if (open) {
//         let url = process.env['SMS_URL']! + action
//         let multi = action === 'sendMultiXMLMessage'

//         // if (action === 'sendMultiXMLMessage') {
//         //     url = url.replace('/MultiSendAPI/', '/V2/')
//         // }
//         let r = await fetch.default(url, {
//             method: 'POST',
//             headers: multi ? {} : {
//                 'Accept': 'application/json',
//                 'Content-Type': 'application/json; charset=UTF-8',
//                 'Cache-Control': 'no-store'
//             },
//             body: multi ? payload + '' : JSON.stringify(payload)
//         });

//         if (r) {
//             if (r?.ok) {//received from provider
//                 console.log('r?.ok', r?.ok)
//                 result = await r.text()
//                 console.log('result', result)
//             }
//             else {
//                 console.debug(`sendSms.error: { status: ${r.status}, statusText: ${r.statusText} } `);
//             }
//         }
//         else {
//             console.debug(`sendSms.return: fetch.default.error`);
//         }
//     }
//     else {
//         console.debug(`sendSms.return: Sms channel is close!`);
//     }
//     return result
// }

// addGroup = async (req: GroupCreateRequest): Promise<GroupCreateResponse> => {
//     let result = {} as GroupCreateResponse

//     let payload = {
//         user: process.env['SMS_ACCOUNT']!,
//         password: process.env['SMS_PASSWORD']!,
//         groupName: req.groupName,
//         groupDescription: req.groupDescription,
//         international: req.international ? '1' : '0'
//     }
//     let text = await this._sendToProvider('addNewGroup', payload)
//     let response = JSON.parse(text)
//     result.success = response.success ?? false;
//     result.message = response.message ? response.message : response.error ? JSON.stringify(response.error) : 'unKnown';
//     result.count = response.smsCount ?? 0;

//     console.log('response', response)

//     return result
// }

// addRecipients = async (req: GroupAddRecipientsRequest): Promise<GroupAddRecipientsResponse> => {
//     let result = {} as GroupAddRecipientsResponse

//     let payload = {
//         user: process.env['SMS_ACCOUNT']!,
//         password: process.env['SMS_PASSWORD']!,
//         groupName: req.groupName,
//         recipientsArray: req.recipientsArray
//     }

//     let text = await this._sendToProvider('addNewRecipients', payload)
//     let response = JSON.parse(text)
//     result.success = response.success ?? false;
//     result.message = response.message ? response.message : response.error ? JSON.stringify(response.error) : 'unKnown';
//     result.count = response.smsCount ?? 0;

//     console.log('response', response)

//     return result
// }

// sendSmsToGroups = async (req: SmsToGroupsRequest): Promise<SmsToGroupsResponse> => {
//     let result: SmsToGroupsResponse = { success: false, message: '', count: 0 };

//     let payload = {
//         user: process.env['SMS_ACCOUNT']!,
//         password: process.env['SMS_PASSWORD']!,
//         from: process.env['SMS_FROM_NAME']!,
//         groups: req.groups.join(','),
//         message: req.message,// encodeURI(req.message),
//         message_type: req.messageType,//'FLASH'
//         scheduledatetime: req.schedule,//YYYY-MM-DD+HH:mm:ss
//         // sendID: req.groupId,//A number, can be use to group all API send
//         customermessageid: req.uid,
//         international: req.international ? '1' : '0',
//         // deliverynotificationURL:''//Message Delivery Status will be sent to this url
//         // deliverynotificationmethod:'POST'
//     }

//     let text = await this._sendToProvider('sendSMS2Groups', payload)
//     let response = JSON.parse(text)
//     result.success = response.success ?? false;
//     result.message = response.message ? response.message : response.error ? JSON.stringify(response.error) : 'unKnown';
//     result.count = response.smsCount ?? 0;

//     console.log('response', response)

//     return result;
// }

// sendSms = async (req: SmsRequest): Promise<SmsResponse> => {
//     let result: SmsResponse = { success: false, message: '', count: 0 };

//     // load requested Sms-class details
//     // let sms = await remult.repos(Sms).findId(req.smsId)

//     let payload = {
//         user: process.env['SMS_ACCOUNT']!,
//         password: process.env['SMS_PASSWORD']!,
//         from: process.env['SMS_FROM_NAME']!,
//         recipient: req.mobile,
//         message: req.message,// encodeURI(req.message),
//         message_type: req.messageType,//'FLASH'
//         scheduledatetime: req.schedule,//YYYY-MM-DD+HH:mm:ss
//         // sendID: req.groupId,//A number, can be use to group all API send
//         customermessageid: req.uid,
//         international: req.international ? '1' : '0',
//         // deliverynotificationURL:''//Message Delivery Status will be sent to this url
//         // deliverynotificationmethod:'POST'
//     }

//     let text = await this._sendToProvider('sendsms', payload)
//     let response = JSON.parse(text)
//     result.success = response.success ?? false;
//     result.message = response.message ? response.message : response.error ? JSON.stringify(response.error) : 'unKnown';
//     result.count = response.smsCount ?? 0;

//     console.log('response', text)

//     return result;
// }
