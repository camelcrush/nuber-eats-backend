import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { User } from '../entities/user.entity';

@InputType()
export class CreateAccountInput extends PickType(User, [
  'email',
  'password',
  'role',
]) {}

@ObjectType()
export class CreateAccountOutput extends CoreOutput {}

// [ Mapped types ]
// 이 장은 code first 접근 방식에만 적용됩니다.
// CRUD(Create/Read/Update/Delete)와 같은 기능을 구축할 때 기본 엔터티 유형에 대한 변형을 구성하는 것이 종종 유용합니다.
// Nest는 이 작업을 보다 편리하게 하기 위해 유형 변환을 수행하는 여러 유틸리티 함수를 제공합니다.

// Mapped types들을 사용하기 위해서는 @InputType데코레이터로 선언되야 하고, 따로 지정하지 않으면 부모 클래스와 동일한 데코레이터를 사용한다.
// 부모 클래스와 자식 클래스가 다른 경우(예: 부모가 @ObjectType으로 선언된 경우) 두 번째 인수로 InputType을 전달해서
// 자식 클래스에게 @InputType데코레이터를 사용하도록 한다.
// ```
// @InputType()
// export class UpdateUserInput extends PartialType(User, InputType) {}
// ```
// https://docs.nestjs.com/graphql/mapped-types

// @InputType({ isAbstract: true })을 Entity에 지정하게 되면 현재 클래스를 GraphQL스키마에 추가하지 않고,
// 어딘가에 복사해서 쓰는 용도로만 사용하도록 지정한다.
