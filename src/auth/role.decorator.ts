import { SetMetadata } from '@nestjs/common';
import { UserRole } from 'src/users/entities/user.entity';

// typeof는 javacripty, keyof는 typescript
// typeof: 대상의 type을 제공
// typeof enum은 대상의 객체의 타입을 반환한다 여기서는 {Client: string, Owner: string, Delivery: string}
// keyof: Object의 key들의 lieteral 값들을 가져온다, keyof typeof를 하게 되면 "Client"|"Owner"|"Delivery"를 반환
export type AllowedRoles = keyof typeof UserRole | 'Any';

// Custom Decorator
// Nest는 @SetMetadata() 데코레이터를 통해 라우트 핸들러에 커스텀 메타데이터를 붙이는 기능을 제공합니다.
// ex) @SetMetadata('role', Role.Owner)
// key - 메타데이터가 저장되는 키를 정의하는 값
// value - 키와 연결될 메타데이터
export const Role = (roles: AllowedRoles[]) => SetMetadata('roles', roles);
