import { promises as fs } from 'fs';
import path from 'path';

import Mustache from 'mustache';

import config from '../config';

export enum EmailTemplate {
    RESET_PASSWORD = 'reset-password',
}

export interface EmailTemplater {
    // eslint-disable-next-line @typescript-eslint/ban-types
    render(template: EmailTemplate, data: object): Promise<[string, string, string]>;
}

export class MustacheEmailTemplater implements EmailTemplater {
    private cached = false;

    static templatePath(name: EmailTemplate, type: 'subject' | 'text' | 'html'): string {
        return path.join(__dirname, `../emailTemplates/${name}-${type}.mustache`);
    }

    private async cache(): Promise<void> {
        const templates = [
            EmailTemplate.RESET_PASSWORD,
        ];

        for (const template of templates) {
            const subjectTmpl = await fs.readFile(MustacheEmailTemplater.templatePath(template, 'subject'));
            const textTmpl = await fs.readFile(MustacheEmailTemplater.templatePath(template, 'text'));
            const htmlTmpl = await fs.readFile(MustacheEmailTemplater.templatePath(template, 'html'));

            Mustache.parse(subjectTmpl.toString());
            Mustache.parse(textTmpl.toString());
            Mustache.parse(htmlTmpl.toString());
        }
    }

    // eslint-disable-next-line @typescript-eslint/ban-types
    async render(template: EmailTemplate, data: object): Promise<[string, string, string]> {
        if (!this.cached) {
            await this.cache();

            this.cached = true;
        }

        data = {
            ...data,
            app: config.app,
        };

        const subjectTmpl = await fs.readFile(MustacheEmailTemplater.templatePath(template, 'subject'));
        const textTmpl = await fs.readFile(MustacheEmailTemplater.templatePath(template, 'text'));
        const htmlTmpl = await fs.readFile(MustacheEmailTemplater.templatePath(template, 'html'));

        const subject = Mustache.render(subjectTmpl.toString(), data);
        const text = Mustache.render(textTmpl.toString(), data);
        const html = Mustache.render(htmlTmpl.toString(), data);

        return [subject, text, html];
    }
}
