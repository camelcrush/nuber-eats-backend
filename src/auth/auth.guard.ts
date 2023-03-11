import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtService } from 'src/jwt/jwt.service';
import { UsersService } from 'src/users/users.service';
import { AllowedRoles } from './role.decorator';

// authentication: 토큰의 유효성 확인
// authorization: 유저가 어떤 일을 하기 전에 그 일을 할 수 있는 권한이 있는지 확인

// [ Authentication & Authorization 순서 ]
// (Authentication) JWT Middleware에서 Request header로부터 토큰을 받아 jwt.verify()와 userService를 통해 유저를 찾고, User를 req['user'] = user 로 정보 추가
// req['user']에 저장된 user를 Apollo server 혹은 Graphql Context에 저장
// (Authorization) Guard에서 canActivate()를 통해 request를 진행할지 중단할지를 결정하는데, Context 값을 읽지만 여기서는 Nest Context이기 때문에 Graphql Context로 변환해줘야 함
// AuthUser Decorator를 통해 Nest Context를 gqlContext로 변환하고 resolver에 user를 리턴함

// [ Guards ]
// 가드는 CanActivate 인터페이스를 구현하는 @Injectable() 데코레이터로 주석이 달린 클래스입니다.
// 런타임에 존재하는 특정 조건에 따라 주어진 요청이 경로 핸들러에 의해 처리되는지 여부를 결정합니다.
// 이것을 흔히 권한 부여라고 합니다.권한 부여는 일반적으로 기존 Express 애플리케이션의 미들웨어에 의해 처리되었습니다.
// 그러나 미들웨어는 본질적으로 멍청합니다.next() 함수를 호출한 후 어떤 핸들러가 실행될지 모릅니다.
// Guards는 ExecutionContext 인스턴스에 액세스할 수 있으므로 다음에 실행될 항목을 정확히 알고 있습니다.
// 토큰을 추출 및 검증하고 추출된 정보를 사용하여 요청을 진행할 수 있는지 여부를 결정합니다.
// https://docs.nestjs.com/guards

// [ @UseGuard() (Binding guards) ]
// 파이프 및 예외 필터와 마찬가지로 가드는 컨트롤러 범위, 메서드 범위 또는 전역 범위일 수 있습니다.
// resolver에서 @UseGuards(AuthGuard) 데코레이터를 사용하여 컨트롤러 범위 가드를 설정합니다.
// https://docs.nestjs.com/guards#binding-guards

// [ GqlExecutionContext (Execution context) ]
// GraphQL은 들어오는 요청에서 다른 유형의 데이터를 수신하기 때문에 가드와 인터셉터 모두에서 수신하는 실행 컨텍스트는 GraphQL과 REST에서 다소 다릅니다.
// GraphQL resolver에는 root, args, context, and info와 같은 고유한 인수 집합이 있습니다.
// 따라서 가드와 인터셉터는 일반 ExecutionContext를 GqlExecutionContext로 변환해야 합니다.
// ex) const ctx = GqlExecutionContext.create(context);
// https://docs.nestjs.com/graphql/other-features#execution-context

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly userService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext) {
    // [ Putting it all together ]
    // 이제 뒤로 돌아가서 이것을 RolesGuard와 연결해 보겠습니다.
    // 현재 사용자에게 할당된 role을 처리 중인 현재 route에 필요한 실제 role과 비교하여 반환 값을 조건부로 만들고 싶습니다.
    // 경로의 역할(사용자 지정 메타데이터)에 액세스하기 위해 Reflector프레임워크에서 즉시 제공
    // https://docs.nestjs.com/guards#putting-it-all-together

    // Metadata가 설정되어있지 않으면 public(누구나 접근 가능)
    // Metadata가 설정되어있으면 private(특정 role만 접근 가능하도록 제한)
    const roles = this.reflector.get<AllowedRoles>(
      'roles',
      context.getHandler(),
    );
    if (!roles) {
      return true;
    }
    // REST인 Context를 Gql Context로 변환하는 과정
    const gqlContext = GqlExecutionContext.create(context).getContext();
    const token = gqlContext.token;
    // JWT Middleware 임무를 대신 수행 : Middleware는 웹소켓 환경에서 제 역할을 못함
    if (token) {
      const decoded = this.jwtService.verify(token.toString());
      if (typeof decoded === 'object' && decoded.hasOwnProperty('id')) {
        const { user } = await this.userService.findById(decoded['id']);
        if (user) {
          // gqlContext에 유저를 추가해주어야 authUser()에서 유저를 찾을 수 있음
          // Guard는 Decorator보다 먼저 실행됨
          gqlContext['user'] = user;
          if (roles.includes('Any')) {
            return true;
          }
          return roles.includes(user.role);
        }
      }
    }
    return false;
  }
}
