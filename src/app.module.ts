import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import * as Joi from 'joi';
import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { User } from './users/entities/user.entity';
import { JwtModule } from './jwt/jwt.module';
import { JwtMiddleware } from './jwt/jwt.middleware';
import { Verification } from './users/entities/verification.entity';
import { MailModule } from './mail/mail.module';
import { Restaurant } from './restaurants/entities/restaurant.entity';
import { Category } from './restaurants/entities/category.entity';
import { RestaurantsModule } from './restaurants/restaurants.module';
import { AuthModule } from './auth/auth.module';
import { Dish } from './restaurants/entities/dish.entity';
import { OrdersModule } from './orders/orders.module';
import { Order } from './orders/entities/order.entity';
import { OrderItem } from './orders/entities/order-item.entity';
import { CommonModule } from './common/common.module';
import { PaymentsModule } from './payments/payments.module';
import { Payment } from './payments/entities/payment.entity';
import { ScheduleModule } from '@nestjs/schedule';
import { UploadsModule } from './uploads/uploads.module';

// For Express and Apollo (default)
// npm i @nestjs/graphql @nestjs/apollo graphql apollo-server-express
// 현재 @nestjs/graphql@9.1.1은 GraphQL@16과 호환문제가 있기 때문에 다운그레이드해서 15버전으로 설치해야 합니다.
// npm i @nestjs/graphql graphql@^15 apollo-server-express
// https://docs.nestjs.com/graphql/quick-start

// 개요
// Nest는 GraphQL 애플리케이션을 구축하는 두 가지 방법, 즉 code first 및 schema first을 제공합니다.
// code first 접근 방식에서는 데코레이터와 TypeScript 클래스를 사용하여 해당 GraphQL 스키마를 생성합니다.
// 이 접근 방식은 TypeScript로만 작업하고 언어 구문 간의 컨텍스트 전환을 피하려는 경우에 유용합니다.
// schema first 접근 방식에서 진실의 소스는 GraphQL SDL(스키마 정의 언어) 파일입니다.
// SDL은 서로 다른 플랫폼 간에 스키마 파일을 공유하는 언어에 구애받지 않는 방법입니다.

// GraphQL 및 TypeScript 시작하기
// 패키지가 설치되면 GraphQLModule을 가져와 forRoot() 정적 메서드로 구성할 수 있습니다.
// forRoot()를 통해 설정한 옵션은 ApolloServer 생성자에 전달됩니다.
// https://docs.nestjs.com/graphql/quick-start#getting-started-with-graphql--typescript

// [ Code first (GraphQL스키마를 자동으로 생성) ]
// code first 접근 방식에서는 데코레이터와 TypeScript 클래스를 사용하여 해당 GraphQL 스키마(schema.graphql파일)를 생성합니다.
// code first 접근 방식을 사용하려면 먼저 옵션 객체에 autoSchemaFile 속성을 추가하세요.
// autoSchemaFile 속성 값은 자동으로 생성된 스키마가 생성될 경로입니다.또는 메모리에서 즉석에서 스키마를 생성할 수 있습니다.
// 이를 활성화하려면 autoSchemaFile 속성을 true로 설정하십시오.
// ```
// // 경로 지정시 해당 경로에 schema.graphql파일을 생성
// autoSchemaFile: join(process.cwd(), 'src/schema.graphql')
// // true로 지정시 자동으로 메모리에 생성 (파일은 생성되지 않음)
// autoSchemaFile: true
// ```
// https://docs.nestjs.com/graphql/quick-start#code-first

// [ Schema first (.graphql파일을 직접 생성 및 작성) ]
// Schema first 접근 방식을 사용하려면 먼저 옵션 객체에 typePaths 속성을 추가합니다.
// typePaths 속성은 GraphQLModule이 작성할 GraphQL SDL 스키마 정의 파일을 찾아야 하는 위치를 나타냅니다.
// 이러한 파일은 메모리에 결합됩니다.이를 통해 스키마를 여러 파일로 분할하고 해당 resolver 근처에서 찾을 수 있습니다.
// https://docs.nestjs.com/graphql/quick-start#schema-first

// [ Code first resolver ]
// Code first방식에서 resolver 클래스는 resolver 함수를 정의하고 Query type을 생성합니다.
// 여러 해석기 클래스를 정의할 수 있습니다. Nest는 런타임에 이들을 결합합니다.
// https://docs.nestjs.com/graphql/resolvers#code-first-resolver

// [ TypeORM ]
// TypeORM은 NodeJS, Browser, Cordova, PhoneGap, Ionic, React Native, NativeScript, Expo 및 Electron
// 플랫폼에서 실행할 수 있는 ORM이며 TypeScript 및 JavaScript(ES5, ES6, ES7, ES8)와 함께 사용할 수 있습니다.
// https://github.com/typeorm/typeorm

// [ Database ]
// Nest는 데이터베이스에 구애받지 않으므로 모든 SQL 또는 NoSQL 데이터베이스와 쉽게 통합할 수 있습니다.
// https://docs.nestjs.com/techniques/database

// [ TypeORM Integration ]
// SQL 및 NoSQL 데이터베이스와의 통합을 위해 Nest는 @nestjs/typeorm 패키지를 제공합니다.
// Nest는 TypeScript에서 사용할 수 있는 가장 성숙한 ORM(Object Relational Mapper)이기 때문에 TypeORM을 사용합니다.
// TypeScript로 작성되었기 때문에 Nest 프레임워크와 잘 통합됩니다.

// 설치
// npm install --save @nestjs/typeorm typeorm pg

// Warning
// synchronize: true은 production에서 사용하면 안됩니다.
// 그렇지 않으면 production데이터가 손실될 수 있습니다.

// [ Configuration ]
// 응용 프로그램은 종종 다른 환경에서 실행됩니다. 환경에 따라 다른 구성 설정을 사용해야 합니다.
// Nest에서 이 기술을 사용하는 좋은 방법은 적절한 .env 파일을 로드하는 ConfigService를 노출하는 ConfigModule을 만드는 것입니다.
// npm i @nestjs/config --save
// ```
// "start:dev": "cross-env NODE_ENV=dev nest start --watch",
// "start": "cross-env NODE_ENV=production nest start", => Heroku Deploy 시 자동으로 NODE_ENV="production"으로 설정해 줌.
// ```
// https://docs.nestjs.com/techniques/configuration

// [ cross-env ]
// NODE_ENV=production으로 환경 변수를 설정하면 대부분의 Windows 명령 프롬프트가 질식합니다.
// cross-env를 사용하면 플랫폼에 맞게 환경 변수를 설정하거나 사용하는 것에 대해 걱정하지 않고 단일 명령을 사용할 수 있습니다.
// POSIX 시스템에서 실행되는 것처럼 설정하기만 하면 cross-env가 적절하게 설정합니다.
// npm i cross-env
// https://www.npmjs.com/package/cross-env

// [ Joi ]
// JavaScript용 가장 강력한 스키마 설명 언어 및 데이터 유효성 검사기.
// npm i joi
// https://joi.dev/api/?v=17.4.2
// https://www.npmjs.com/package/joi

// [ Schema validation ]
// Joi 내장 유효성 검사기.Joi를 사용하여 개체 스키마를 정의하고 이에 대해 JavaScript 개체의 유효성을 검사합니다.
// https://docs.nestjs.com/techniques/configuration#schema-validation

// [ validationOptions ]
// allowUnknown: 환경 변수에 알 수 없는 키를 허용할지 여부를 제어합니다.기본값은 true입니다.
// abortEarly: true인 경우 첫 번째 오류에서 유효성 검사를 중지합니다. 거짓이면 모든 오류를 반환합니다. 기본값은 false입니다.

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'dev' ? '.env.dev' : '.env.test',
      ignoreEnvFile: process.env.NODE_ENV === 'production',
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('dev', 'production', 'test').required(),
        DB_HOST: Joi.string(),
        DB_PORT: Joi.string(),
        DB_USERNAME: Joi.string(),
        DB_PASSWORD: Joi.string(),
        DB_DATABASE: Joi.string(),
        PRIVATE_KEY: Joi.string().required(),
        MAILGUN_API_KEY: Joi.string().required(),
        MAILGUN_DOMAIN: Joi.string().required(),
        MAILGUN_FROM_EMAIL: Joi.string().required(),
        AWS_ACCESS_KEY: Joi.string().required(),
        AWS_SECRET_KEY: Joi.string().required(),
      }),
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      // process.env.DATABASE_URL : Heroku에서 제공하는 DATABASE_URL
      ...(process.env.DATABASE_URL
        ? { url: process.env.DATABASE_URL }
        : {
            host: process.env.DB_HOST,
            port: +process.env.DB_PORT,
            username: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
          }),
      synchronize: process.env.NODE_ENV !== 'production',
      logging:
        process.env.NODE_ENV !== 'production' &&
        process.env.NODE_ENV !== 'test',
      entities: [
        User,
        Verification,
        Restaurant,
        Category,
        Dish,
        Order,
        OrderItem,
        Payment,
      ],
    }),
    // [ graphql-subscriptions ]
    // GraphQL subscriptions은 GraphQL에서 subscriptions을 구현하기 위해 Redis와 같은 pubsub 시스템과
    //  GraphQL을 연결할 수 있는 간단한 npm 패키지입니다.
    // 모든 GraphQL 클라이언트 및 서버(Apollo뿐만 아니라)와 함께 사용할 수 있습니다.
    // npm i graphql-subscriptions
    // https://www.npmjs.com/package/graphql-subscriptions

    // [ Subscriptions 활성화 ]
    // subscriptions을 활성화하려면 installSubscriptionHandlers 속성을 true로 설정하십시오.
    // ex) installSubscriptionHandlers: true
    // https://docs.nestjs.com/graphql/subscriptions
    GraphQLModule.forRoot<ApolloDriverConfig>({
      // subscription 설정 및 connection에 토큰 전달
      // 강의대로 하니 context의 connection을 못 받아옵니다.
      // 다른사람 코드를 참조해 아래와 같이 작성해 테스트해보니 잘 작동됩니다. 참고하시면 될 것 같습니다. (패키지 추가로 설치할 필요없습니다.)
      // ------------------------------------
      // GraphQLModule.forRoot({
      // subscriptions: {
      // 'subscriptions-transport-ws': {
      // onConnect: (connectionParams: any) => ({
      // token: connectionParams['x-jwt'],
      // }),
      // },
      // },
      // autoSchemaFile: true,
      // context: ({ req }) => ({ token: req.headers['x-jwt'] }), //http와 ws 따로 설정한다.
      // }),
      // ------------------------------------
      // [ WebSocket을 통한 인증 ]
      // 사용자가 인증되었는지 확인하는 것은 subscriptions 옵션에서 지정할 수 있는 onConnect 콜백 함수 내에서 수행되어야 합니다.
      // onConnect는 첫 번째 인수로 SubscriptionClient에 전달된 connectionParams를 받습니다.
      // https://docs.nestjs.com/graphql/subscriptions#authentication-over-websocket

      // deprecated되는 것들이 왜 이렇게 많은지..
      // @nestjs/graphql 10.1.3
      // graphql 16.6.0
      // 기준으로 저는 아래와 같이 작성하였습니다.
      // ------------------------------------
      // GraphQLModule.forRoot({
      // driver: ApolloDriver,
      // autoSchemaFile: true,
      // subscriptions: {
      // 'graphql-ws': {
      // onConnect: (context: Context) => {
      // const { connectionParams, extra } = context;
      // extra.token = connectionParams['x-jwt'];
      // },
      // },
      // },
      // context: ({ req, extra }) => {
      // return { token: req ? req.headers['x-jwt'] : extra.token };
      // },
      // })
      // ------------------------------------
      subscriptions: {
        'subscriptions-transport-ws': {
          onConnect: (connectionParams) => {
            const token = connectionParams['x-jwt'];
            return { token };
          },
        },
      },
      playground: process.env.NODE_ENV !== 'production',
      driver: ApolloDriver,
      autoSchemaFile: true,
      // http request 설정 및 context에 토큰 전달
      context: ({ req }) => ({ token: req.headers['x-jwt'] }),
      // [ Context ]
      // 각 request에 대해 request context를 사용할 수 있습니다. context가 함수로 정의되면 각 request마다 호출되고 req 속성에 request 객체를 받습니다.
      // ------------------------------
      // context: async ({ req }) => {
      // return {
      // myProperty: true
      // };
      // },
      // ------------------------------
      // https://github.com/apollographql/apollo-server#context

      // [ @Context() ]
      // ex) @Context() context로 context를 가져오거나
      // @Context("loggedInUser") loggedInUser로 context안에 loggedInUser가 있다면 바로 가져올 수도 있습니다.
      // ----------------------------------
      // @Context(param?: string) // NestJS
      // context / context[param] // Apollo
      // ----------------------------------
      // https://docs.nestjs.com/graphql/resolvers#graphql-argument-decorators
    }),
    ScheduleModule.forRoot(),
    JwtModule.forRoot({
      privateKey: process.env.PRIVATE_KEY,
    }),
    MailModule.forRoot({
      apiKey: process.env.MAILGUN_API_KEY,
      domain: process.env.MAILGUN_DOMAIN,
      fromEmail: process.env.MAILGUN_FROM_EMAIL,
    }),
    AuthModule,
    UsersModule,
    RestaurantsModule,
    OrdersModule,
    CommonModule,
    PaymentsModule,
    UploadsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

// [ AppModule에 MiddlewareConsumer 설정 ]
// export class AppModule implements NestModule {
//   configure(consumer: MiddlewareConsumer) {
//     consumer.apply(JwtMiddleware).forRoutes({
//       path: '/graphql', --> *
//       method: RequestMethod.POST, --> All
//     });
//   }
// }
// ** JwtMiddleware는 Http에서만 작동하며, 웹소켓에서 기능을 못하기에 대신 Guard를 사용함
// Guard는 Http, Websocket 등 모두 동작함.

// [ Middleware ]
// 미들웨어는 라우트 핸들러 전에 호출되는 함수입니다. 미들웨어 함수는 request 및 response 객체에 접근할 수 있으며
// 애플리케이션의 request-response 주기에 있는 next() 미들웨어 함수에 접근할 수 있습니다.
// next 미들웨어 함수는 일반적으로 next라는 변수로 표시됩니다.
// Nest 미들웨어는 기본적으로 익스프레스 미들웨어와 동일합니다.
// 함수 또는 @Injectable() 데코레이터가 있는 클래스에서 사용자 지정 Nest 미들웨어를 구현합니다.
// https://docs.nestjs.com/middleware#middleware

// [ Applying middleware (미들웨어 적용) ]
// @Module() 데코레이터에는 미들웨어가 들어갈 자리가 없습니다. 대신 모듈 클래스의 configure() 메서드를 사용하여 설정합니다.
// 미들웨어를 포함하는 모듈은 NestModule 인터페이스를 implement해야 합니다.
// https://docs.nestjs.com/middleware#applying-middleware

// [ Middleware consumer ]
// MiddlewareConsumer는 도우미 클래스입니다. 미들웨어를 관리하는 몇 가지 기본 제공 방법을 제공합니다.
// forRoutes() 메서드는 단일 문자열, 여러 문자열, RouteInfo 객체, 컨트롤러 클래스 및 여러 컨트롤러 클래스를 사용할 수 있습니다.
// 대부분의 경우 쉼표로 구분된 컨트롤러 목록을 전달할 것입니다.

// apply()
// apply() 메서드는 단일 미들웨어를 사용하거나 여러 인수를 사용하여 여러 미들웨어를 지정할 수 있습니다.

// exclude()
// 지정한 경로에서 미들웨어의 실행을 제외합니다.

// forRoutes()
// 전달된 경로 또는 컨트롤러에서 미들웨어를 실행합니다. 클래스를 전달하면 Nest는 이 컨트롤러 내에 정의된 모든 경로에 미들웨어를 실행합니다.
// https://docs.nestjs.com/middleware#middleware-consumer

// 위의 경우는 NestJS의 방식이고,, 아니면 main.ts에서 app.use(jwtMiddleWare)로 사용 가능
// 이 때 jwtMiddleWare는 함수형 MiddleWare만 가능
// 그러나 jwtService에서 usersRepository를 사용하기 위해 NestJS방식을 사용해야 함
