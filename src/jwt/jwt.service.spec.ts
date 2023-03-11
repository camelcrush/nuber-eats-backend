import { Test } from '@nestjs/testing';
import * as jwt from 'jsonwebtoken';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { JwtService } from './jwt.service';

const TEST_KEY = 'testKey';
const USER_ID = 1;

jest.mock('jsonwebtoken', () => {
  return {
    sign: jest.fn(() => 'TOKEN'),
    verify: jest.fn(() => ({ id: USER_ID })),
  };
});

describe('JwtService', () => {
  let service: JwtService;
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        JwtService,
        { provide: CONFIG_OPTIONS, useValue: { privateKey: TEST_KEY } },
      ],
    }).compile();
    service = module.get<JwtService>(JwtService);
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sign', () => {
    it('should return a signed token', () => {
      const token = service.sign(USER_ID);
      expect(typeof token).toBe('string');
      expect(jwt.sign).toHaveBeenCalledTimes(1);
      expect(jwt.sign).toHaveBeenCalledWith({ id: USER_ID }, TEST_KEY);
    });
  });

  describe('verify', () => {
    it('should return a decoded token', () => {
      const TOKEN = 'TOKEN';
      const decodedToken = service.verify(TOKEN);
      expect(decodedToken).toEqual({ id: USER_ID });
      expect(jwt.verify).toHaveBeenCalledTimes(1);
      expect(jwt.verify).toHaveBeenLastCalledWith(TOKEN, TEST_KEY);
    });
  });
});

// [ jest.mock(moduleName, factory, options) ]
// 필요할 때 auto-mocked 버전으로 모듈을 mock합니다.
// 두 번째 인수는 factory에는 Jest의 automocking 기능을 사용하는 대신 실행 중인 명시적 모듈 팩토리를 지정하는 데 사용할 수 있습니다.
// ```
// import moduleName, {foo} from '../moduleName';
// jest.mock('../moduleName', () => {
// return {
// __esModule: true,
// default: jest.fn(() => 42),
// foo: jest.fn(() => 43),
// };
// });
// moduleName(); // Will return 42
// foo(); // Will return 43
// ```
// jest.mock으로 mock되는 모듈은 jest.mock을 호출하는 파일에 대해서만 mock됩니다.
// 모듈을 가져오는 다른 파일은 모듈을 mock하는 테스트 파일 이후에 실행되더라도 원래 implementation을 가져옵니다.
// https://jestjs.io/docs/jest-object#jestmockmodulename-factory-options
