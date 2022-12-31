import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { UsersModule } from 'src/users/users.module';
import { AuthGuard } from './auth.guard';

@Module({
  imports: [UsersModule],
  // Global 가드는 모든 컨트롤러와 모든 route handler에 대해 전체 애플리케이션에서 사용됩니다.
  // dependency injection 관점에서, 모듈 외부에서 등록된 전역 가드(위의 예에서와 같이 useGlobalGuards() 사용)는 dependency injection을 할 수 없습니다.
  // 이는 이것이 모든 모듈의 context 외부에서 수행되기 때문입니다. 이 문제를 해결하기 위해 다음 구성을 사용하여 모든 모듈에서 직접 가드를 설정할 수 있습니다.
  providers: [{ provide: APP_GUARD, useClass: AuthGuard }],
})
export class AuthModule {}
