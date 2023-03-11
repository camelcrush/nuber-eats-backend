import { Inject, Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { JwtModuleOptions } from './jwt.interfaces';

// [ Authentication ]
// 인증은 대부분의 애플리케이션에서 필수적인 부분입니다.Passport는 커뮤니티에서 잘 알려져 있고 많은 프로덕션 애플리케이션에서
// 성공적으로 사용되는 가장 인기 있는 node.js 인증 라이브러리입니다.
// @nestjs/passport 모듈을 사용하여 이 라이브러리를 Nest 애플리케이션과 통합하는 것은 간단합니다.
// https://docs.nestjs.com/security/authentication

@Injectable()
export class JwtService {
  constructor(
    @Inject(CONFIG_OPTIONS) private readonly options: JwtModuleOptions,
  ) {}
  sign(userId: number): string {
    return jwt.sign({ id: userId }, this.options.privateKey);
  }

  verify(token: string) {
    return jwt.verify(token, this.options.privateKey);
  }
}

// [ jsonwebtoken ]
// npm i jsonwebtoken
// npm i @types/jsonwebtoken -D
// ```
// import * as jwt from 'jsonwebtoken';
// jwt.sign({ foo: 'bar' }, privateKey, { algorithm: 'RS256'});
// ```
// https://www.npmjs.com/package/jsonwebtoken

// * 동적 모듈 만들기 연습을 위하여 위 방법을 썼으나 아래 방법으로 config값을 가져와 jwtServcie를 구현하면 됨
// Config가 필요한 서비스에서 Constructor에서 private readonly config:ConfigService로 불러와 사용할 수 있음
// ConfigService.get(path)
// ConfigService는 .env파일을 로드해옵니다.
// path를 기반으로 configuration 값(custom configuration 또는 환경 변수)을 가져옵니다.
// (점 표기법을 사용하여 "database.host"와 같은 중첩 개체를 탐색할 수 있음)

// WARN [DependenciesScanner] In the next major version, Nest will not allow classes annotated with
//  @Injectable(), @Catch(), and @Controller() decorators to appear in the "imports" array of a module.
// 위와 같은 경고가 뜨시는 분들은 ConfigService를 users.module.ts에 imports가 아닌 providers에 넣어주시면 됩니다.
// (isGlobal:true로 설정했기 때문에 넣어주지 않아도 정상 실행)

// randomkeygen
// https://randomkeygen.com/

// jwt토큰 확인
// https://jwt.io/
