import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { User } from '../entities/user.entity';

// [ Input Type (@InputType) ]
// Mutation이 객체를 argument로 취해야 하는 경우 Input type을 만들 수 있습니다.
// Input type은 argument로 전달할 수 있는 특수한 유형의 객체이다.
// ```
// @InputType()
// export class UpvotePostInput {
// @Field()
// postId: number;
// }
// ```
// https://docs.nestjs.com/graphql/mutations#code-first

// [ Input Type과 ArgsType의 차이점 ]
// @InputType사용 : 하나의 객체러 묶어서 이름 명명 가능
// @Args('createRestaurantInput') createRestaurantInput: CreateRestaurantInput

// @ArgsType사용
// @Args() createRestaurantInput: CreateRestaurantInput

@InputType()
export class LoginInput extends PickType(User, ['email', 'password']) {}

@ObjectType()
export class LoginOutput extends CoreOutput {
  @Field((type) => String, { nullable: true })
  token?: string;
}

// [ Mapped types ]
// npm i @nestjs/mapped-types 또는 npm i @nestjs/graphql,
// npm i --save @nestjs/swagger를 통해 PartialType을 가져올 수 있습니다.

// Partial
// input validation types(DTO라고도 함)을 빌드할 때 동일한 유형에 대한 create 및 update 변형을 빌드하는 것이 종종 유용합니다.
// 예를 들어, create에는 모든 필드가 필요할 수 있지만 update는 모든 필드를 선택 사항으로 만들 수 있습니다.
// Nest는 이 작업을 더 쉽게 만들고 상용구를 최소화하기 위해 PartialType() 유틸리티 함수를 제공합니다.
// PartialType() 함수는 입력 유형의 모든 속성이 선택 사항으로 설정된 유형(클래스)을 반환합니다.
// https://docs.nestjs.com/openapi/mapped-types#partial
