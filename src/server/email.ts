import { createTransport } from "nodemailer";
import Mail from "nodemailer/lib/mailer";

export interface EmailRequest {
    senderid: string,
    emails: string[],
    cc?: string[],
    subject: string,
    html: string,
    attachment?: string
}
export interface EmailResponse {
    success: boolean,
    message: string,
    count: number
};


export class EmailService {

    sendEmail = async (req: EmailRequest): Promise<EmailResponse> => {
        let result: EmailResponse = { success: false, message: '', count: 0 };

        const open = ((process.env['EMAIL_CHANNEL_OPENED'] ?? 'false') === 'true') ?? false
        if (open) {

            var transporter = createTransport({
                service: 'gmail',
                port: 587,
                secure: false,
                requireTLS: true,
                auth: {
                    user: process.env['EMAIL_ADMIN_GMAIL_MAIL'],
                    pass: process.env['EMAIL_ADMIN_GAMIL_APP_PASSWORD']
                }
            });

            var attachments = [] as Mail.Attachment[]
            if (req.attachment?.trim().length)
                attachments.push({ path: req.attachment })

            var mailOptions: Mail.Options = {
                from: `גט חסד של חבד לנוער <${process.env['EMAIL_ADMIN_GMAIL_MAIL']}>`,
                to: req.emails.join(';') ?? process.env['EMAIL_ADMIN_GMAIL_MAIL'],
                cc: req.cc?.join(';'),
                subject: req.subject,
                date: new Date(),
                html: req.html,
                attachments: attachments
            };

            await new Promise((res, rej) => {
                transporter.sendMail(mailOptions, (error: any, info: { response: string; }) => {
                    if (error) {
                        result.message = error?.stack
                        console.debug('Email error', error, error?.stack);
                        rej(error);
                    } else {
                        result.success = true
                        console.debug('Email sent', info.response);
                        res(true);
                    }
                });
            });
        }
        else {
            result.message = 'ערוץ מסרונים סגור'
            console.debug(`sendSmsFlash.return: Sms channel is close!`);
        }

        return result;
    }

}
