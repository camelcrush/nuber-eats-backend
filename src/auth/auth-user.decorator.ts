import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const AuthUser = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const gqlContext = GqlExecutionContext.create(context).getContext();
    const user = gqlContext['user'];
    return user;
  },
);

// [ Custom Decorators ]
// 나만의 커스텀 데코레이터를 만들 수 있습니다. node.js 세계에서는 request 객체에 속성을 첨부하는 것이 일반적입니다.
// 코드를 더 읽기 쉽고 투명하게 만들기 위해 @User() 데코레이터를 만들고 모든 컨트롤러에서 재사용할 수 있습니다.
// 예시
// ```
// import { createParamDecorator, ExecutionContext } from '@nestjs/common';
// export const User = createParamDecorator(
// (data: unknown, ctx: ExecutionContext) => {
// const request = ctx.switchToHttp().getRequest();
// return request.user;
// },
// );
// ```
// https://docs.nestjs.com/graphql/other-features#custom-decorators
// https://docs.nestjs.com/custom-decorators
