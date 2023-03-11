import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

// [ Heroku ]
// https://dashboard.heroku.com/apps

// Heroku CLI
// https://devcenter.heroku.com/articles/heroku-cli

// Heroku CLI 설치 (Mac)
// brew tap heroku/brew && brew install heroku

// heroku git:remote -a 프로젝트명
// git push heroku master

// Procfile format
// Procfile은 각각 다음 형식으로 개별 라인에 프로세스 유형을 선언합니다.
// process type: command
// process type: web, worker, urgentworker, clock 등과 같은 명령의 영숫자 이름입니다.
// command: rake jobs:work와 같이 시작 시 프로세스 유형의 모든 dyno가 실행해야 하는 명령을 나타냅니다.
// https://devcenter.heroku.com/articles/procfile#procfile-format

// Heroku Add-ons
// 앱을 개발, 확장 및 운영하기 위한 도구 및 서비스입니다.
// https://elements.heroku.com/addons

// Heroku Postgres
// PostgreSQL을 기반으로 하는 안정적이고 강력한 서비스로서의 데이터베이스
// https://elements.heroku.com/addons/heroku-postgresql

// DB_PASSWORD 타입 에러 해결 방법
// DB_PASSWORD의 타입을 Joi를 통해 숫자로 설정했었다면 헤로쿠에 Config Var로 DB_PASSWORD를 설정한 후에는 문자로 다시 변경해주셔야 합니다.
// DB_PASSWORD: Joi.string().required(),

// Can't find a module 에러 해결 방법
// heroku logs --tail에서 모듈을 찾지 못한다는 에러가 있다면 헤로쿠 Config Vars에 NPM_CONFIG_PRODUCTION을 false로 설정해주시면 됩니다.

// ERROR [ExceptionHandler] no pg_hba.conf entry for host "", user "", database "", SSL off. 에러 해결 방법
// 헤로쿠 Config Vars에 PGSSLMODE를 no-verify로 설정해주시면 됩니다.
// 또는 heroku cli를 통해 heroku config:set PGSSLMODE=no-verify 설정해주셔도 됩니다.
// https://stackoverflow.com/questions/66086508/nestjs-typeormmodule-unable-to-connect-to-the-database

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  // S3 파일 업로드 할 때 Cross-Origin 권한 문제 해결을 위해 추가
  app.enableCors();
  // process.env.Port : Heroku에서 제공하는 Port
  await app.listen(process.env.PORT || 4000);
}
bootstrap();

// 내장 ValidationPipe사용을 위한 class-validator, class-transformer설치
// npm i --save class-validator class-transformer
// class validator
// https://github.com/typestack/class-validator
// https://www.npmjs.com/package/class-validator

// [ Validation ]
// 웹 애플리케이션으로 전송되는 데이터의 검증을 도와줍니다.
// 들어오는 요청을 자동으로 검증하기 위해 Nest는 즉시 사용할 수 있는 여러 파이프를 제공합니다.
// ValidationPipe는 강력한 클래스 유효성 검사기 패키지와 선언적 유효성 검사 데코레이터를 사용합니다.
//  ValidationPipe는 들어오는 모든 클라이언트 페이로드에 대해 유효성 검사 규칙을 적용하는 편리한 접근 방식을 제공합니다.
// https://docs.nestjs.com/techniques/validation

// 자동 검증
// 애플리케이션 수준에서 ValidationPipe를 바인딩하는 것으로 시작하겠습니다.
// 따라서 모든 엔드포인트가 잘못된 데이터를 수신하지 못하도록 보호됩니다.
// https://docs.nestjs.com/techniques/validation

// whitelist
// true로 설정하면 유효성 검사기는 class-validator의 유효성 검사 데코레이터를 적어도 하나라도 사용하지 않은 모든 속성 객체를 제거합니다.
// 제거한 후 유효한 데이터만 저장

// forbidNonWhitelisted
// true로 설정하면 화이트리스트에 없는 속성을 제거하는 대신 유효성 검사기가 예외를 throw합니다.

// transform (자동 형변환)
// 네트워크를 통해 들어오는 payload는 일반 JavaScript 객체입니다.
// ValidationPipe는 payload를 DTO 클래스에 따라 유형이 지정된 객체로 자동 변환할 수 있습니다.
// 자동 변환을 활성화하려면 transform을 true로 설정하십시오. 이 동작을 전역적으로 활성화하려면 전역 파이프에서 옵션을 설정합니다.
// url id값은 기본적으로 string인데 true로 설정해놓으면 number로 변환해서 받을 수 있음
// -----------------------------------
// app.useGlobalPipes(
// new ValidationPipe({
// transform: true,
// }),
// );
// -----------------------------------
// https://docs.nestjs.com/techniques/validation#transform-payload-objects

// forbidNonWhitelisted 옵션은 whitelist에서 유효한 속성이 아닌 것을 제외하는 것 대신에 에러를 날려주는 것이기 때문에,
//  먼저 whitelist 옵션이 true로 되어있어야 사용 가능한 옵션입니다.
// 즉, forbidNonWhitelisted를 사용하기 위해서는 whitelist가 먼저 true가 되어야 합니다.

// Performance (Fastify)
// 기본적으로 Nest는 Express 프레임워크를 사용합니다.
// 앞서 언급했듯이 Nest는 Fastify와 같은 다른 라이브러리와의 호환성도 제공합니다.
// Fastify는 Express와 유사한 방식으로 설계 문제를 해결하기 때문에 Nest에 대한 좋은 대안 프레임워크를 제공합니다.
// fastify는 Express보다 훨씬 빠르며 거의 2배 더 나은 벤치마크 결과를 달성합니다.
// https://docs.nestjs.com/techniques/performance#performance-fastify

// Request, Response Object (비추천)
// -----------------------------------
// @Request(), @Req()
// req
// @Response(), @Res()
// res
// -----------------------------------
// https://docs.nestjs.com/controllers#request-object
