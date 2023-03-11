import { Global, Inject, Injectable } from '@nestjs/common';
import got from 'got';
import * as FormData from 'form-data';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { EmailVar, MailModuleOptions } from './mail.interfaces';

@Injectable()
export class MailService {
  constructor(
    @Inject(CONFIG_OPTIONS) private readonly options: MailModuleOptions,
  ) {}

  async sendEmail(
    subject: string,
    template: string,
    emailVars: EmailVar[],
    //to:string,
  ): Promise<boolean> {
    const form = new FormData();
    form.append('from', `Nuber <Nuber@mailgun-test.com>`);
    form.append('to', `dkxm09277@gmail.com`); // production일 때는 수신자 조정
    form.append('subject', subject);
    form.append('template', template);
    emailVars.forEach((eVar) => form.append(`v:${eVar.key}`, eVar.value));
    try {
      await got.post(
        `https://api.mailgun.net/v3/${this.options.domain}/messages`,
        {
          headers: {
            Authorization: `Basic ${Buffer.from(
              `api:${this.options.apiKey}`,
            ).toString('base64')}`,
          },
          body: form,
        },
      );
      return true;
    } catch (error) {
      return false;
    }
  }
  // production에서는 to : email 추가
  sendVerificationEmail(email: string, code: string) {
    this.sendEmail('Verify Your Email', 'verify-email', [
      { key: 'username', value: email },
      { key: 'code', value: code },
    ]);
  }
}

// Mailgun
// 개발자를 위한 트랜잭션 이메일 API 서비스
// https://www.mailgun.com

// Receive SMS Online
// 온라인으로 즉시 SMS 수신
// https://receive-smss.com/

// Dynamic module use case
// https://docs.nestjs.com/fundamentals/dynamic-modules#dynamic-module-use-case

// MAILGUN_API_KEY
// MAILGUN_DOMAIN_NAME
// MAINGUN_FROM_EMAIL

// NestJS Mailer
// Nodemailer 라이브러리를 사용하는 Nest.js 프레임워크(node.js)용 메일러 모듈
// https://nest-modules.github.io/mailer
// https://github.com/nest-modules/mailer

// cURL (Client URL)
// URL로 데이터를 전송하기 위한 커맨드 라인 툴 및 라이브러리
// curl은 데이터를 전송하기 위해 명령줄이나 스크립트에서 사용됩니다.
// curl은 다양한 통신 프로토콜을 이용하여 데이터를 전송하기 위한 라이브러리와 명령 줄 도구를 제공하는 컴퓨터 소프트웨어 프로젝트이다.

// GOT
// Node.js를 위한 인간 친화적이고 강력한 HTTP request 라이브러리
// + got 12버전 이상 사용시, 모듈을 import해올 때 오류가 발생하시는 분들은 12버전보다 아래인 11.8.3버전으로 설치해보세요
// npm i got@11.8.3
// https://www.npmjs.com/package/got

// Form-Data
// 읽을 수 있는 "multipart/form-data" 스트림을 생성하는 라이브러리입니다.
// 다른 웹 애플리케이션에 form을 submit하고, 파일을 업로드하는 데 사용할 수 있습니다.
// npm i form-data

// 이 예제에서는 문자열, 버퍼 및 파일 스트림을 포함하는 3개의 field가 있는 form을 구성합니다.
// ```
// var FormData = require('form-data');
// var fs = require('fs');

// var form = new FormData();
// form.append('my_field', 'my value');
// form.append('my_buffer', new Buffer(10));
// form.append('my_file', fs.createReadStream('/foo/bar.jpg'));
// ```
// https://www.npmjs.com/package/form-data

// Mailgun Doc
// https://documentation.mailgun.com/en/latest/quickstart-sending.html#how-to-start-sending-email

// Buffer란? Node.js 에서 제공하는 Binary의 데이터를 담을 수 있는 객체
// Binary 데이터란? 01001010과 같은 이진수 시스템으로 표현되는 데이터

// Node.js방식으로 Mailgun으로 메일 보내기

// cURL와 got을 사용하지 않고, Node.js방식으로도 아래와 같이 메일을 보낼 수 있습니다.
// mailgun.js을 require('mailgun.js')가 아닌 import로 가져오려면
// tsconfig.json에 compilerOptions에 esModuleInterop를 true로 설정해주시면 됩니다.
// ```
// import formData from 'form-data';
// import Mailgun from 'mailgun.js';

// sendEmail(){
// const mailgun = new Mailgun(formData);
// const client = mailgun.client({ username: 'Nuber', key: this.mailOptions.mailgunApiKey });

// const messageData = {
// from: 'Nuber @mailgun-test.com>',
// to: 'nubereats@gmail.com',
// subject: 'Hello',
// template: 'nuber-eats',
// 'v:username': 'test',
// 'v:code': 'abcd123',
// };

// const response = await client.messages.create(this.mailOptions.mailgunDomainName, messageData);
// console.log('response', response);
// }
// ```
// https://documentation.mailgun.com/en/latest/quickstart-sending.html#how-to-start-sending-email
// https://www.npmjs.com/package/mailgun.js

// Mailgun에서 보낸 이메일이 스팸함으로 가시는 분들은 이메일 주소를 다르게 바꿔보세요.
// 이메일 주소를 다르게 바꾸니 스팸이 아닌 일반 메일함에서 받을 수 있네요.
// 예) formData.append('from', `Nuber < Nuber@mailgun-test.com >`);

// Handlebars
// 핸들바는 간단한 템플릿 언어입니다. 템플릿과 input객체를 사용하여 HTML 또는 기타 텍스트 형식을 생성합니다.
// 핸들바 템플릿은 핸들바 표현식이 포함된 일반 텍스트처럼 보입니다.
// // 핸들바에서 자바스크립트 변수를 가져오기: {{ 코드 }}
// ex) < p >{{firstname}} {{lastname}}< / p >
// https://handlebarsjs.com/guide/

// sending 옵션 (parameters)
// 컴포넌트로부터 여러 옵션을 조합해서 메세지를 보낼 수 있습니다.
// 대부분의 매개변수를 여러 번 지정할 수 있으며 HTTP는 기본적으로 이를 지원합니다.

// template (Mailgun template을 통해 생성한 템플릿 이름)
// 템플릿 API를 통해 저장된 템플릿 이름
// ex) formData.append('template', 'nuber-eats');

// v:my-var (사용할 변수 이름)
// v: prefix를 통해 커스텀 JSON 데이터를 메세지에 이름을 붙여 보낼 수 있다.
// ex) formData.append('v:code', 'abcd1234')
// https://documentation.mailgun.com/en/latest/api-sending.html#sending

// templates
// https://documentation.mailgun.com/en/latest/user_manual.html#templates

// + 이메일 템플릿 좀 더 쉽게 수정하실 분들은 코드 복사해서 VSCode에서 prettier로 정렬 후 수정해서 복사 붙여넣기 하셔도 됩니다.
