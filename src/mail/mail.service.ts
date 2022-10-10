import { Inject, Injectable } from '@nestjs/common';
import got from 'got';
import * as FormData from 'form-data';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { MailModuleOptions } from './mail.interfaces';

@Injectable()
export class MailService {
  constructor(
    @Inject(CONFIG_OPTIONS) private readonly options: MailModuleOptions,
  ) {
    this.sendEmail('test', 'test contents');
  }

  private async sendEmail(subject: string, content: string) {
    const form = new FormData();
    form.append('from', `Nuber <Nuber@mailgun-test.com>`);
    form.append('to', `dkxm09277@gmail.com`);
    form.append('subject', subject);
    form.append('template', 'verify-email');
    form.append('v:username', 'JS');
    form.append('v:code', 'asdf');
    const response = await got(
      `https://api.mailgun.net/v3/${this.options.domain}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(
            `api:${this.options.apiKey}`,
          ).toString('base64')}`,
        },
        body: form,
      },
    );
    console.log(response.body);
  }
}