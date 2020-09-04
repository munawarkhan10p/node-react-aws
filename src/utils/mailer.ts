/* eslint-disable @typescript-eslint/ban-types */
import * as AWS from 'aws-sdk';

import config from '../config';

import { SES } from './aws';
import { EmailTemplate, EmailTemplater, MustacheEmailTemplater } from './emailTemplater';

export type MailRecipient = {
    address: string;
    templateData: object;
}

export interface Mailer {
    sendMail(from: string, to: MailRecipient | MailRecipient[], templateName: EmailTemplate, templateData: object): Promise<void>;
}

export class SESMailer implements Mailer {
    private templater: EmailTemplater;
    private ses: AWS.SES;

    constructor(templater: EmailTemplater, ses: AWS.SES) {
        this.templater = templater;
        this.ses = ses;
    }

    async sendMail(from: string, to: MailRecipient | MailRecipient[], templateName: EmailTemplate, templateData: object): Promise<void> {
        if (!Array.isArray(to)) {
            to = [to];
        }

        await Promise.all(to.map(async (recipient) => {
            const [subject, text, html] = await this.templater.render(templateName, {
                ...templateData,
                ...recipient.templateData,
            });

            return this.ses.sendEmail({
                Source: from,
                Destination: {
                    ToAddresses: [recipient.address],
                },
                Message: {
                    Subject: { Data: subject },
                    Body: {
                        Text: { Data: text },
                        Html: { Data: html },
                    },
                },
            }).promise();
        }));
    }
}

const templater = new MustacheEmailTemplater();

let mailer: Mailer;

switch (config.env) {
case 'development':
case 'staging':
    mailer = new SESMailer(templater, SES);
    break;
}

export default mailer;
