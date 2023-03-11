import { Test } from '@nestjs/testing';
import got from 'got';
import * as FormData from 'form-data';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { MailService } from './mail.service';

jest.mock('got');
jest.mock('form-data');

const TEST_DOMAIN = 'test-domain';

describe('MailServcie', () => {
  let service: MailService;
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: CONFIG_OPTIONS,
          useValue: {
            apiKey: 'test-apiKey',
            domain: TEST_DOMAIN,
            fromEmail: 'test-fromEmail',
          },
        },
      ],
    }).compile();
    service = module.get<MailService>(MailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendVerificationEmail', () => {
    it('should call sendEmail', () => {
      const sendVerificationEmailArgs = {
        email: 'email',
        code: 'code',
      };
      jest.spyOn(service, 'sendEmail').mockImplementation(async () => true);

      service.sendVerificationEmail(
        sendVerificationEmailArgs.email,
        sendVerificationEmailArgs.code,
      );

      expect(service.sendEmail).toHaveBeenCalledTimes(1);
      expect(service.sendEmail).toHaveBeenCalledWith(
        'Verify Your Email',
        'verify-email',
        [
          { key: 'username', value: sendVerificationEmailArgs.email },
          { key: 'code', value: sendVerificationEmailArgs.code },
        ],
      );
    });
  });

  describe('sendEmail', () => {
    it('sends email', async () => {
      const result = await service.sendEmail('', '', []);
      // FormData.append() 기능을 그대로 spyOn으로 물려받고 테스트를 가능케함
      const formSpy = jest.spyOn(FormData.prototype, 'append');
      // FormData.prototype.append로 대체 가능
      expect(formSpy).toHaveBeenCalled();
      expect(got.post).toHaveBeenCalledTimes(1);
      expect(got.post).toHaveBeenCalledWith(
        `https://api.mailgun.net/v3/${TEST_DOMAIN}/messages`,
        expect.any(Object),
      );
      expect(result).toEqual(true);
    });

    it('fails on error', async () => {
      jest.spyOn(got, 'post').mockImplementation(() => {
        throw new Error();
      });
      const result = await service.sendEmail('', '', []);
      expect(result).toEqual(false);
    });
  });
});
// [ jest.spyOn(object, methodName) ]
// jest.fn과 유사한 mock 함수를 생성하지만, object[methodName](메서드)에 대한 호출도 추적합니다.
// Jest mock 함수를 반환합니다. 기본적으로
// jest.spyOn은 spied 메서드도 호출합니다. 이것은 대부분의 다른 테스트 라이브러리와 다른 동작입니다.
// 원래 함수를 덮어쓰려면 아래와 같이 덮어쓸수 있습니다.
// ```
// jest.spyOn(object, methodName).mockImplementation(() => customImplementation) 또는
// object[methodName] = jest.fn(() => customImplementation);
// ```
// https://jestjs.io/docs/jest-object#jestspyonobject-methodname

// [ mockFn.mockImplementation(fn) ]
// mock Implementation으로 사용해야 하는 함수를 허용합니다.
// const mockFn = jest.fn().mockImplementation(scalar => 42 + scalar);
// https://jestjs.io/docs/mock-function-api#mockfnmockimplementationfn
