import { SetMetadata } from '@nestjs/common';
import { UserRole } from 'src/users/entities/user.entity';

// [ typeof, keyof]
// typeof는 javacripty, keyof는 typescript
// typeof: 대상의 type을 제공
// typeof enum은 대상의 객체의 타입을 반환한다 여기서는 {Client: string, Owner: string, Delivery: string}
// keyof: Object의 key들의 lieteral 값들을 가져온다, keyof typeof를 하게 되면 "Client"|"Owner"|"Delivery"를 반환

// RoleType은 keyof typeof로 지정 해 놓을 수 있습니다.
// keyof 연산자는 피연산자의 키타입에 해당하는 타입을 리턴해줍니다.
// 이를테면, let person: Person { name: 'Jarid', age: 35} 라는 오브젝트에서 let personProp: keyof Person;으로 정의하면
// personProp이 가질 수 있는 값은 Person의 key 값이 ”name”|”age”가 됩니다.
// 위 코드를 이해하시려면 먼저 Union of literal types이라는 개념을 이해하면 좋은데,
// type Greeting = 'Hello';에서 Greeting 타입은 'Hello' 하나만 가능하지만,
// type Greeting = 'Hello'|'Hi'|'Welcome'; 에서 Greeting 타입은 'Hello', 'Hi', 'Welcome' 이 세가지 값을 가질 수 있습니다.
// enum에서도 union of literal types를 이용할 수 있습니다.
// enum을 union of literal types로 만들기 위해 사용하는 것이 keyof typeof 입니다.
// 위코드에서는 추가적으로 'Any'까지 타입이 추가시켰으므로, keyof typeof UserRole | 'Any'로 사용한 것입니다.
export type AllowedRoles = keyof typeof UserRole | 'Any';

export const Role = (roles: AllowedRoles[]) => SetMetadata('roles', roles);

// [ Custom Decorator ]
// Setting roles per handler(핸들러별 역할 설정): @SetMetadata()
// 예를 들어 CatsController는 다른 route에 대해 다른 권한 체계를 가질 수 있습니다.
// 일부는 관리자만 사용할 수 있고 다른 일부는 모든 사람에게 공개될 수 있습니다.
// 유연하고 재사용 가능한 방식으로 role을 route에 사용하려면 어떻게 해야 합니까?
// 여기서 custom metadata가 작동합니다. Nest는 @SetMetadata() 데코레이터를 통해 라우트 핸들러에 커스텀 메타데이터를 붙이는 기능을 제공합니다.
// ex) @SetMetadata('role', Role.Owner)
// key - 메타데이터가 저장되는 키를 정의하는 값
// value - 키와 연결될 메타데이터

// route에서 직접 @SetMetadata()를 사용하는 것은 좋은 습관이 아닙니다. 대신 아래와 같이 자신만의 데코레이터를 만듭니다.
// ```
// import { SetMetadata } from '@nestjs/common';
// export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
// ```
// https://docs.nestjs.com/guards#setting-roles-per-handler
