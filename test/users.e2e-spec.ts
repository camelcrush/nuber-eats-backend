import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getConnection } from 'typeorm';

jest.mock('got', () => {
  return {
    post: jest.fn(),
  };
});

const GRAPHQL_ENDPOINT = '/graphql';

describe('UserModule (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    // const dataSource = new DataSource({
    //   type: 'postgres',
    //   host: 'localhost',
    //   port: 5432,
    //   username: 'js',
    //   password: process.env.DB_PASSWORD,
    //   database: 'nuber-eats-test',
    // });
    // await dataSource.initialize();
    // await dataSource.driver.connect();
    // await dataSource.dropDatabase();
    await getConnection().dropDatabase();
    await app.close();
  });

  describe('createAccount', () => {
    const EMAIL = 'new@naver.com';
    it('should create an account', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `mutation{
        createAccount(input:{
          email:"${EMAIL}",
          password:"12345",
          role:Client
        }){
          ok,
          error
        }
      }`,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.createAccount.ok).toBe(true);
          expect(res.body.data.createAccount.error).toBe(null);
        });
    });

    it('should fail if account already exists', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `mutation{
        createAccount(input:{
          email:"${EMAIL}",
          password:"12345",
          role:Client
        }){
          ok,
          error
        }
      }`,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.createAccount.ok).toBe(false);
          expect(res.body.data.createAccount.error).toBe(
            'There is a user with that email already',
          );
        });
    });
  });

  it.todo('userProfile');
  it.todo('login');
  it.todo('me');
  it.todo('verifyEmail');
  it.todo('editProfile');
});
