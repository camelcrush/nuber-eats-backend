import { DynamicModule, Global, Module } from '@nestjs/common';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { JwtModuleOptions } from './jwt.interfaces';
import { JwtService } from './jwt.service';

@Module({})
@Global()
export class JwtModule {
  static forRoot(options: JwtModuleOptions): DynamicModule {
    return {
      module: JwtModule,
      // forRoot로부터 받은 moduleOptions Args를 Service에 넘겨주는 방법
      // Service에서..
      //constructor(
      // @Inject(CONFIG_OPTIONS) private readonly options: JwtModuleOptions,
      // ) {}
      providers: [
        {
          provide: CONFIG_OPTIONS,
          useValue: options,
        },
        {
          provide: JwtService,
          useClass: JwtService,
        },
        JwtService,
      ],
      exports: [JwtService],
    };
  }
}

// [ NestJS에서의 Modules 개념 ]
// 모듈은 @Module() 데코레이터로 주석이 달린 클래스입니다.
// @Module() 데코레이터는 Nest가 애플리케이션 구조를 구성하는 데 사용하는 메타데이터를 제공합니다.
// https://docs.nestjs.com/modules

// [ Dynamic modules ]
// Nest 모듈 시스템에는 동적 모듈이라는 강력한 기능이 포함되어 있습니다.
// 이 기능을 사용하면 커스터마이징 가능한 모듈을 쉽게 만들 수 있게 합니다.
// 커스터마이징 가능한 모듈은 provider를 등록하고 동적으로 구성할 수 있습니다.
// forRoot()릉 통해 설정값을 정한 동적 모듈을 리턴하고 결과적으로는 JwtModule.forRoot()라는 정적 모듈이 됨
// https://docs.nestjs.com/fundamentals/dynamic-modules#dynamic-modules
// https://docs.nestjs.com/modules#dynamic-modules

// Static Module (정적 모듈)
// 어떠한 설정도 적용되어 있지 않은 모듈

// Dynamic Module (동적 모듈)
// 설정이 적용되어 있거나 설정을 적용할 수 있는 모듈

// [ Global modules ]
// 즉시 사용할 수 있는 모든 제공자 세트(예: 도우미, 데이터베이스 연결 등)를 제공하려면 @Global() 데코레이터를 사용하여 모듈을 전역적으로 만드십시오.
// 또는 forRoot안에서 global: true를 통해서도 전역 모듈로 만들 수 있다. 따로 Import를 안 해주어도 됨, 대신 exports에 추가하고 appModule에도 추가
// -------------------------------
// return {
// global:true
// module: JwtModule,
// providers: [JwtService],
// exports: [JwtService],
// };
// -------------------------------
// https://docs.nestjs.com/modules#global-modules

// [ Standard providers ]
// 아래 코드는 providers: [CatsService]의 축약형입니다.
// -------------------------------
// providers: [
// { provide: CatsService, useClass: CatsService },
// ];
// -------------------------------
// https://docs.nestjs.com/fundamentals/custom-providers#standard-providers

// [ useClass (Class providers) ]
// provider의 타입 (주입되야 할 인스턴스 클래스 이름)
// 프로바이더로 사용할 클래스?
// useClass 구문을 사용하면 토큰이 해결해야 하는 클래스를 동적으로 결정할 수 있습니다.
// 예를 들어 추상(또는 기본) ConfigService 클래스가 있다고 가정합니다.
// 현재 환경에 따라 Nest가 구성 서비스의 다른 구현을 제공하기를 바랍니다.
// -------------------------------
// useClass:
// process.env.NODE_ENV === 'development'
// ? DevelopmentConfigService
// : ProductionConfigService,
// -------------------------------
// https://docs.nestjs.com/fundamentals/custom-providers#class-providers-useclass

// [ useValue (Value providers) ]
// 주입한 provider의 인스턴스
// useValue 구문은 상수 값을 주입하거나 외부 라이브러리를 Nest 컨테이너에 넣거나 실제 구현을 모의 객체로 교체하는 데 유용합니다.
// https://docs.nestjs.com/fundamentals/custom-providers#value-providers-usevalue
