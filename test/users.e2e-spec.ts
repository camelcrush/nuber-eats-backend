import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource, getConnection, Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Verification } from 'src/users/entities/verification.entity';
// jest-e2e.json에서 moduleNameMapper 설정
// moduleNameMapper [object< string, string | array< string>>]
// ```
// {
// "moduleNameMapper": {
// "^image![a-zA-Z0-9$_-]+$": "GlobalImageStub",
// "^[./a-zA-Z0-9$_-]+\\.png$": "/RelativeImageStub.js",
// "module_name_(.*)": "/substituted_module_$1.js",
// "assets/(.*)": [
// "/images/$1",
// "/photos/$1",
// "/recipes/$1"
// ]
// }
// }
// ```
// https://jestjs.io/docs/configuration#modulenamemapper-objectstring-string--arraystring

// End-to-end testing

// Jest did not exit one second after the test run has completed.와 같은 에러가 뜬다면
//  app.close()를 통해 테스트가 끝나고 난 후, app을 종료시켜주기
// ```
// afterAll(async () => {
// await app.close();
// });
// ```
// https://docs.nestjs.com/fundamentals/testing#end-to-end-testing

// getConnection()
// connection 관리자에서 connection을 가져옵니다. connection 이름이 지정되지 않은 경우 "default" connection이 검색됩니다.
// https://orkhan.gitbook.io/typeorm/docs/connection-api#connection-api

// Connection이란?
// Connection은 특정 데이터베이스에 대한 단일 데이터베이스 ORM 연결

// dropDatabase()
// 데이터베이스와 모든 데이터를 삭제합니다. 이 방법을 사용하면 모든 데이터베이스 테이블과 해당 데이터가 지워지므로
// 프로덕션 환경에서는 이 방법에 주의하십시오. 데이터베이스 연결이 완료된 후에만 사용할 수 있습니다.
// ex) await connection.dropDatabase();

jest.mock('got', () => {
  return {
    post: jest.fn(),
  };
});

const GRAPHQL_ENDPOINT = '/graphql';

const testUser = {
  email: 'new@naver.com',
  password: '12345',
};

describe('UserModule (e2e)', () => {
  let app: INestApplication;
  let usersRepository: Repository<User>;
  let verificationsRepository: Repository<Verification>;
  let jwtToken: string;

  const baseTest = () => request(app.getHttpServer()).post(GRAPHQL_ENDPOINT);
  const publicTest = (query: string) => baseTest().send({ query });
  const privateTest = (query: string) =>
    baseTest().set('x-jwt', jwtToken).send({ query });

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    usersRepository = moduleFixture.get<Repository<User>>(
      getRepositoryToken(User),
    );
    verificationsRepository = moduleFixture.get<Repository<Verification>>(
      getRepositoryToken(Verification),
    );
    await app.init();
  });

  afterAll(async () => {
    const dataSource = new DataSource({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'js',
      password: process.env.DB_PASSWORD,
      database: 'nuber-eats-test',
    });
    const connection = await dataSource.initialize();
    await connection.dropDatabase();
    await connection.destroy();
    // getConnection()이 depercated됨에 따라 위 방식으로 변경
    // await getConnection().dropDatabase();
    await app.close();
  });

  describe('createAccount', () => {
    it('should create an account', () => {
      return publicTest(`mutation{
        createAccount(input:{
          email:"${testUser.email}",
          password:"${testUser.password}",
          role:Client
        }){
          ok,
          error
        }
      }`)
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                createAccount: { ok, error },
              },
            },
          } = res;
          expect(ok).toBe(true);
          expect(error).toBe(null);
        });
    });

    it('should fail if account already exists', () => {
      return publicTest(`mutation{
        createAccount(input:{
          email:"${testUser.email}",
          password:"${testUser.password}",
          role:Client
        }){
          ok,
          error
        }
      }`)
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                createAccount: { ok, error },
              },
            },
          } = res;
          expect(ok).toBe(false);
          expect(error).toBe('There is a user with that email already');
        });
    });
  });

  describe('login', () => {
    it('should log in with correct credentials', () => {
      return publicTest(`
      mutation{
        login(input:{
          email:"${testUser.email}",
          password:"${testUser.password}",
        }){
          ok,
          error,
          token
        }
      }`)
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: { login },
            },
          } = res;
          expect(login.ok).toBe(true);
          expect(login.error).toBe(null);
          expect(login.token).toEqual(expect.any(String));
          jwtToken = login.token;
        });
    });

    it('should not be able to login with wrong credentials', () => {
      return publicTest(`
      mutation{
        login(input:{
          email:"${testUser.email}",
          password:"123",
        }){
          ok,
          error,
          token
        }
      }`)
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: { login },
            },
          } = res;
          expect(login.ok).toBe(false);
          expect(login.error).toBe('Wrong password');
          expect(login.token).toBe(null);
        });
    });
  });

  describe('userProfile', () => {
    let userId: number;
    beforeAll(async () => {
      const [user] = await usersRepository.find();
      userId = user.id;
    });

    it('should see a user profile', () => {
      return privateTest(`
      {
        userProfile(id:${userId}){
          ok
          error
          user{
            id
          }
        }
      }`)
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                userProfile: {
                  ok,
                  error,
                  user: { id },
                },
              },
            },
          } = res;
          expect(ok).toBe(true);
          expect(error).toBe(null);
          expect(id).toBe(userId);
        });
    });
    it('should not find a profile', () => {
      return privateTest(`
      {
        userProfile(id:555){
          ok
          error
          user{
            id
          }
        }
      }`)
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                userProfile: { ok, error, user },
              },
            },
          } = res;
          expect(ok).toBe(false);
          expect(error).toBe('User not found.');
          expect(user).toBe(null);
        });
    });
  });

  describe('me', () => {
    it('should find my profile', () => {
      return privateTest(`
      {
        me{
          email
        }
      }`)
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                me: { email },
              },
            },
          } = res;
          expect(email).toBe(testUser.email);
        });
    });

    it('should not allow logged out user', () => {
      return publicTest(`
      {
        me{
          email
        }
      }`)
        .expect(200)
        .expect((res) => {
          const {
            body: { errors },
          } = res;
          const [error] = errors;
          expect(error.message).toBe('Forbidden resource');
        });
    });
  });

  describe('editProfile', () => {
    const NEW_EMAIL = 'dkxm09277@new.com';
    it('should change email', () => {
      return privateTest(`
      mutation {
        editProfile(input: { email: "${NEW_EMAIL}" }) {
          ok
          error
        }
      }
      `)
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                editProfile: { ok, error },
              },
            },
          } = res;
          expect(ok).toBe(true);
          expect(error).toBe(null);
        });
    });
    it('should have new email', () => {
      return privateTest(`
      {
        me{
          email
        }
      }`)
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                me: { email },
              },
            },
          } = res;
          expect(email).toBe(NEW_EMAIL);
        });
    });
  });

  describe('verifyEmail', () => {
    let verificationCode: string;
    beforeAll(async () => {
      const [verification] = await verificationsRepository.find();
      verificationCode = verification.code;
    });
    it('should verify email', () => {
      return publicTest(`
      mutation {
        verifyEmail(input: { code: "${verificationCode}" }) {
          ok
          error
        }
      }
      `)
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                verifyEmail: { ok, error },
              },
            },
          } = res;
          expect(ok).toBe(true);
          expect(error).toBe(null);
        });
    });
    it('should fail on verification code not found', () => {
      return publicTest(`
      mutation {
        verifyEmail(input: { code: "xxxxxx" }) {
          ok
          error
        }
      }
      `)
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                verifyEmail: { ok, error },
              },
            },
          } = res;
          expect(ok).toBe(false);
          expect(error).toBe('Verification not found.');
        });
    });
  });
});
