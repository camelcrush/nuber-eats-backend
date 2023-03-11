import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from 'src/jwt/jwt.service';
import { MailService } from 'src/mail/mail.service';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { Verification } from './entities/verification.entity';
import { UsersService } from './users.service';

const mockRepository = () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  findOneOrFail: jest.fn(),
  delete: jest.fn(),
});

const mockJwtService = () => ({
  sign: jest.fn(() => 'signed-token'),
  verify: jest.fn(),
});

const mockMailService = () => ({
  sendVerificationEmail: jest.fn(),
});

type MockRepository<T> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('UserService', () => {
  let service: UsersService;
  let mailService: MailService;
  let jwtService: JwtService;
  let usersRepository: MockRepository<User>;
  let verificationRepository: MockRepository<Verification>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(Verification),
          useValue: mockRepository(),
        },
        {
          provide: JwtService,
          useValue: mockJwtService(),
        },
        {
          provide: MailService,
          useValue: mockMailService(),
        },
      ],
    }).compile();
    service = module.get(UsersService);
    mailService = module.get<MailService>(MailService);
    jwtService = module.get<JwtService>(JwtService);
    usersRepository = module.get(getRepositoryToken(User));
    verificationRepository = module.get(getRepositoryToken(Verification));
  });

  it('shold be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createAccount', () => {
    const createAccountArgs = {
      email: 'bs@email.com',
      password: 'bs.password',
      role: UserRole.Client,
    };
    it('should fail if user exists', async () => {
      usersRepository.findOne.mockResolvedValue({
        id: 1,
        email: '',
      });
      const result = await service.createAccount(createAccountArgs);
      expect(result).toMatchObject({
        ok: false,
        error: 'There is a user with that email already',
      });
    });

    it('should create a new user', async () => {
      usersRepository.findOne.mockResolvedValue(undefined);
      usersRepository.create.mockReturnValue(createAccountArgs);
      usersRepository.save.mockResolvedValue(createAccountArgs);
      verificationRepository.create.mockReturnValue({
        user: createAccountArgs,
      });
      verificationRepository.save.mockResolvedValue({ code: 'code' });

      const result = await service.createAccount(createAccountArgs);

      expect(usersRepository.create).toHaveBeenCalledTimes(1);
      expect(usersRepository.create).toHaveBeenCalledWith(createAccountArgs);

      expect(usersRepository.save).toHaveBeenCalledTimes(1);
      expect(usersRepository.save).toHaveBeenCalledWith(createAccountArgs);

      expect(verificationRepository.create).toHaveBeenCalledTimes(1);
      expect(verificationRepository.create).toBeCalledWith({
        user: createAccountArgs,
      });

      expect(verificationRepository.save).toHaveBeenCalledTimes(1);
      expect(verificationRepository.save).toHaveBeenCalledWith({
        user: createAccountArgs,
      });

      expect(mailService.sendVerificationEmail).toHaveBeenCalledTimes(1);
      expect(mailService.sendVerificationEmail).toBeCalledWith(
        expect.any(String),
        expect.any(String),
      );
      expect(result).toEqual({ ok: true });
    });

    it('should fail on exception', async () => {
      usersRepository.findOne.mockRejectedValue(new Error());
      const result = await service.createAccount(createAccountArgs);
      expect(result).toEqual({ ok: false, error: "Couldn't create account" });
    });
  });

  describe('login', () => {
    const loginArgs = {
      email: 'bs@email.com',
      password: 'bs.password',
    };

    it('should be fail if user does not exist', async () => {
      usersRepository.findOne.mockResolvedValue(null);

      const result = await service.login(loginArgs);

      expect(usersRepository.findOne).toHaveBeenCalledTimes(1);
      expect(usersRepository.findOne).toHaveBeenCalledWith(expect.any(Object));
      expect(result).toEqual({ ok: false, error: 'User not found' });
    });

    it('should fail if the password is wrong', async () => {
      const mockedUser = {
        checkPassword: jest.fn(() => Promise.resolve(false)),
      };
      usersRepository.findOne.mockResolvedValue(mockedUser);
      const result = await service.login(loginArgs);
      expect(result).toEqual({
        ok: false,
        error: 'Wrong password',
      });
    });

    it('should return token if password correct', async () => {
      const mockedUser = {
        id: 1,
        checkPassword: jest.fn(() => Promise.resolve(true)),
      };
      usersRepository.findOne.mockResolvedValue(mockedUser);
      const result = await service.login(loginArgs);
      expect(jwtService.sign).toHaveBeenCalledTimes(1);
      expect(jwtService.sign).toHaveBeenCalledWith(expect.any(Number));
      expect(result).toEqual({
        ok: true,
        token: 'signed-token',
      });
    });

    it('should fail on exception', async () => {
      usersRepository.findOne.mockRejectedValue(new Error());
      const result = await service.login(loginArgs);
      expect(result).toEqual({ ok: false, error: "Can't log user in" });
    });
  });

  describe('findById', () => {
    const findByIdArgs = {
      id: 1,
    };

    it('should find an existing user', async () => {
      usersRepository.findOneOrFail.mockResolvedValue(findByIdArgs);
      const result = await service.findById(1);
      expect(result).toEqual({
        ok: true,
        user: findByIdArgs,
      });
    });

    it('should fail if no user is found', async () => {
      usersRepository.findOneOrFail.mockRejectedValue(new Error());
      const result = await service.findById(1);
      expect(result).toEqual({
        ok: false,
        error: 'User not found.',
      });
    });
  });

  describe('editProfile', () => {
    it('should change email', async () => {
      const oldUser = {
        email: 'bs@old.com',
        verified: true,
      };
      const editProfileArgs = {
        userId: 1,
        input: { email: 'bs@new.com' },
      };
      const newVerification = {
        code: 'code',
      };
      const newUser = {
        verified: false,
        email: editProfileArgs.input.email,
      };
      usersRepository.findOne.mockResolvedValue(oldUser);
      verificationRepository.create.mockReturnValue(newVerification);
      verificationRepository.save.mockResolvedValue(newVerification);

      await service.editProfile(editProfileArgs.userId, editProfileArgs.input);

      expect(usersRepository.findOne).toHaveBeenCalledTimes(1);
      expect(usersRepository.findOne).toHaveBeenCalledWith({
        where: { id: editProfileArgs.userId },
      });

      expect(verificationRepository.create).toHaveBeenCalledTimes(1);
      expect(verificationRepository.create).toHaveBeenCalledWith({
        user: newUser,
      });
      expect(verificationRepository.save).toHaveBeenCalledTimes(1);
      expect(verificationRepository.save).toHaveBeenCalledWith(newVerification);

      expect(mailService.sendVerificationEmail).toHaveBeenCalledTimes(1);
      expect(mailService.sendVerificationEmail).toHaveBeenCalledWith(
        newUser.email,
        newVerification.code,
      );
    });

    it('should change password', async () => {
      const editProfileArgs = {
        userId: 1,
        input: { password: 'bs@new.com' },
      };
      usersRepository.findOne.mockResolvedValue({ password: 'old' });
      const result = await service.editProfile(
        editProfileArgs.userId,
        editProfileArgs.input,
      );
      expect(usersRepository.save).toHaveBeenCalledTimes(1);
      expect(usersRepository.save).toHaveBeenCalledWith(editProfileArgs.input);
      expect(result).toEqual({ ok: true });
    });

    it('should fail on exception', async () => {
      usersRepository.findOne.mockRejectedValue(new Error());
      const result = await service.editProfile(1, { email: '12' });
      expect(result).toEqual({ ok: true, error: 'Could not update Profile.' });
    });
  });

  describe('verifyEmail', () => {
    it('should verify email', async () => {
      const mockedVerification = {
        user: {
          verified: false,
        },
        id: 1,
      };
      verificationRepository.findOne.mockResolvedValue(mockedVerification);

      const result = await service.verifyEmail('');

      expect(verificationRepository.findOne).toHaveBeenCalledTimes(1);
      expect(verificationRepository.findOne).toHaveBeenCalledWith(
        expect.any(Object),
      );
      expect(usersRepository.save).toHaveBeenCalledTimes(1);
      expect(usersRepository.save).toHaveBeenCalledWith({ verified: true });
      expect(verificationRepository.delete).toHaveBeenCalledTimes(1);
      expect(verificationRepository.delete).toHaveBeenCalledWith(
        mockedVerification.id,
      );
      expect(result).toEqual({ ok: true });
    });

    it('should fail on verification not found', async () => {
      verificationRepository.findOne.mockResolvedValue(undefined);
      const result = await service.verifyEmail('');
      expect(result).toEqual({ ok: false, error: 'Verification not found.' });
    });

    it('should fail on exception', async () => {
      verificationRepository.findOne.mockRejectedValue(new Error());
      const result = await service.verifyEmail('');
      expect(result).toEqual({ ok: false, error: 'Coult not verify email' });
    });
  });
});

// test.todo(name) = it.todo(name)
// 테스트 작성을 계획할 때 test.todo를 사용하십시오. 이 테스트는 마지막에 요약 출력에 강조 표시되어 아직 수행해야 하는 테스트의 수를 알 수 있습니다.
// 테스트 콜백 함수를 제공하면 test.todo에서 오류가 발생합니다.
// 이미 테스트를 구현했는데 테스트가 중단되어 실행하지 않으려면 대신 test.skip을 사용하십시오.
// ```
// const add = (a, b) => a + b;
// test.todo('add should be associative');
// ```
// https://jestjs.io/docs/api#testtodoname

// beforeAll(fn, timeout)
// 모든 테스트가 실행되기 전에 딱 한 번 함수를 실행합니다.
// https://jestjs.io/docs/api#beforeallfn-timeout

// moduleNameMapper
// moduleNameMapper를 사용하여 모듈 경로를 다른 모듈에 매핑할 수 있습니다.
// 기본적으로 사전 설정은 모든 이미지를 이미지 스텁 모듈에 매핑하지만 모듈을 찾을 수 없는 경우 이 구성 옵션이 도움이 될 수 있습니다.
// ```
// {
// "moduleNameMapper": {
// "my-module.js": "/path/to/my-module.js"
// }
// }
// ```
// https://jestjs.io/docs/tutorial-react-native#modulenamemapper
// https://jestjs.io/docs/configuration#modulenamemapper-objectstring-string--arraystring

// Testing: getRepositoryToken()
// 단위 테스트 응용 프로그램에 관해서, 우리는 일반적으로 데이터베이스 연결을 피하고 테스트 스위트를
// 독립적으로 유지하고 실행 프로세스를 최대한 빠르게 유지하기를 원합니다.
// 그러나 우리 클래스는 연결 인스턴스에서 가져온 리포지토리에 의존할 수 있습니다.
// 해결책은 mock 리포지토리를 만드는 것입니다.이를 달성하기 위해 custom providers를 설정합니다.
// 등록된 각 리포지토리는 자동으로 < EntityName > 리포지토리 토큰으로 표시됩니다.여기서 EntityName은 엔터티 클래스의 이름입니다.
// 이제 대체 mockRepository가 UsersRepository로 사용됩니다.
// 클래스가 @InjectRepository() 데코레이터를 사용하여 UsersRepository를 요청할 때마다 Nest는 등록된 mockRepository 객체를 사용합니다.
// https://docs.nestjs.com/techniques/database#testing

// jest.fn(implementation)
// 새로운 mock 함수를 생성합니다.
// 선택적으로 mock implementation을 취합니다.
// ```
// const mockFn = jest.fn();
// mockFn();
// expect(mockFn).toHaveBeenCalled();
// ```
// https://jestjs.io/docs/jest-object#jestfnimplementation

// Record
// 속성 키가 Key이고 속성 값이 Type인 객체 유형을 구성합니다.
// 이 유틸리티는 유형의 속성을 다른 유형에 매핑하는 데 사용할 수 있습니다.
// ```
// interface CatInfo {
// age: number;
// breed: string;
// }
// type CatName = "miffy" | "boris" | "mordred";
// const cats: Record< CatName, CatInfo > = {
// miffy: { age: 10, breed: "Persian" },
// boris: { age: 5, breed: "Maine Coon" },
// mordred: { age: 16, breed: "British Shorthair" },
// };
// cats.boris;
// ```
// https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type

// Keyof Type Operator
// keyof 연산자는 객체 type을 사용하여 해당 키의 문자열 또는 숫자 리터럴 통합을 생성합니다.
// ```
// type Point = { x: number; y: number };
// const hello: keyof Point; // hello에는 x, y만 할당 가능
// ```
// https://www.typescriptlang.org/docs/handbook/2/keyof-types.html

// mockFn.mockResolvedValue(value)
// 비동기(async) 테스트를 할 때, 비동기(async) 함수를 mock하는 데 유용합니다.
// ```
// test('async test', async () => {
// const asyncMock = jest.fn().mockResolvedValue(43);
// await asyncMock(); // 43
// });
// ```
// https://jestjs.io/docs/mock-function-api#mockfnmockresolvedvaluevalue

// coveragePathIgnorePatterns [array< string >]
// Default: ["/node_modules/"]
// 테스트를 실행하기 전에 모든 파일 경로와 일치하는 정규 표현식 패턴 문자열의 배열입니다.
// 파일 경로가 패턴 중 하나와 일치하면 해당 파일을 스킵합니다.
// https://jestjs.io/docs/configuration#coveragepathignorepatterns-arraystring

// collectCoverageFrom [array]
// Default: undefined
// 패턴이 일치하는 파일을 Coverage에 올립니다.
// 적용 범위 정보를 수집해야 하는 파일 집합을 나타내는 glob 패턴의 배열입니다.
//파일이 지정된 glob 패턴과 일치하는 경우 이 파일에 대한 테스트가 없고 테스트 제품군에 필요하지 않은 경우에도
// 해당 파일에 대한 적용 범위 정보가 수집됩니다.

// + service.ts파일만 테스트 하고 싶으신 분들은 collectCoverageFrom를 아래와 같이 지정하시면 됩니다.
// ```
// "collectCoverageFrom": [
// "**/*.service.(t|j)s"
// ]
// ```
// https://jestjs.io/docs/configuration#collectcoveragefrom-array

// .toMatchObject(object)
// .toMatchObject를 사용하여 JavaScript 개체가 개체 속성의 하위 집합과 일치하는지 확인합니다.

// expect.any(constructor)
// expect.any(constructor)는 주어진 생성자로 생성된 모든 것과 일치하거나 전달된 유형의 프리미티브인 경우 일치합니다.
// 리터럴 값 대신 toEqual 또는 toBeCalledWith 내부에서 사용할 수 있습니다.
// 예를 들어, mock 함수가 숫자로 호출되었는지 확인하려면
// ```
// expect(mock).toBeCalledWith(expect.any(Number));
// expect(mock).toBeCalledWith(expect.any(Cat));
// ```
// https://jestjs.io/docs/expect#expectanyconstructor

// mockFn.mockRejectedValue(value)
// 항상 거부하는 비동기 mock 함수를 만드는 데 유용합니다.
// ```
// test('async test', async () => {
// const asyncMock = jest.fn().mockRejectedValue(new Error('Async error'));
// await asyncMock(); // throws "Async error"
// });
// ```
// https://jestjs.io/docs/mock-function-api#mockfnmockrejectedvaluevalue
