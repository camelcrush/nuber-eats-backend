import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { UsersModule } from 'src/users/users.module';
import { AuthGuard } from './auth.guard';

@Module({
  imports: [UsersModule],
  providers: [{ provide: APP_GUARD, useClass: AuthGuard }],
})
export class AuthModule {}

// Global 가드는 모든 컨트롤러와 모든 route handler에 대해 전체 애플리케이션에서 사용됩니다.
// dependency injection 관점에서, 모듈 외부에서 등록된 전역 가드(위의 예에서와 같이 useGlobalGuards() 사용)는
// dependency injection을 할 수 없습니다. 이는 이것이 모든 모듈의 context 외부에서 수행되기 때문입니다.
// 이 문제를 해결하기 위해 다음 구성을 사용하여 모든 모듈에서 직접 가드를 설정할 수 있습니다.

// app.module.ts
// import { Module } from '@nestjs/common';
// import { APP_GUARD } from '@nestjs/core';
// @Module({
// providers: [
// {
// provide: APP_GUARD,
// useClass: RolesGuard,
// },
// ],
// })
// export class AppModule {}
// https://docs.nestjs.com/guards#binding-guards

// Metadata가 설정되어있지 않으면 public(누구나 접근 가능)
// Metadata가 설정되어있으면 private(특정 role만 접근 가능하도록 제한)

// [ Putting it all together ]
// 이제 뒤로 돌아가서 이것을 RolesGuard와 연결해 보겠습니다.
//현재 사용자에게 할당된 role을 처리 중인 현재 route에 필요한 실제 role과 비교하여 반환 값을 조건부로 만들고 싶습니다.
// https://docs.nestjs.com/guards#putting-it-all-together
