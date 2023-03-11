import {
  Field,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { CoreEntity } from 'src/common/entities/common.entity';
import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { InternalServerErrorException } from '@nestjs/common';
import { IsBoolean, IsEmail, IsEnum, IsString } from 'class-validator';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { Order } from 'src/orders/entities/order.entity';
import { Payment } from 'src/payments/entities/payment.entity';

// Enum은 Typescript가 자체적으로 구현한 코드
// 열거형으로 이름이 있는 상수들의 집합을 정의할 수 있습니다
export enum UserRole {
  Client = 'Client',
  Owner = 'Owner',
  Delivery = 'Delivery',
}

// [ Enums ]
// enum은 특정 허용 값 집합으로 제한되는 특수한 종류의 스칼라입니다.
// 이 유형의 모든 인수가 허용되는 값 중 하나인지 확인
// 필드가 항상 유한한 값 집합 중 하나임을 유형 시스템을 통해 전달

// code first 접근 방식을 사용할 때 TypeScript enum을 생성하여 GraphQL enum type을 정의합니다.
// registerEnumType 함수를 사용하여 AllowedColor enum을 등록합니다.
// ```
// export enum AllowedColor {
// RED,
// GREEN,
// BLUE,
// }
// registerEnumType(AllowedColor, { name: 'AllowedColor' });
// ```
// https://docs.nestjs.com/graphql/unions-and-enums#code-first-1
// https://www.typescriptlang.org/ko/docs/handbook/enums.html

// Graphql에서 사용하려면 registerEnumTpye을 통해 등록해줘야 함
registerEnumType(UserRole, { name: 'UserRole' });

// [ Object types (@ObjectTypes) ]
// GraphQL 스키마의 대부분의 정의는 object types입니다.
// 정의하는 각 object type은 응용 프로그램 클라이언트가 상호 작용해야 하는 도메인 객체를 나타내야 합니다.
// 이 경우 code first 접근 방식을 사용하여 TypeScript 클래스를 사용하여 스키마를 정의하고
// TypeScript 데코레이터를 사용하여 해당 클래스의 field에 주석을 추가합니다.
// https://docs.nestjs.com/graphql/resolvers#object-types

@InputType('UserInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class User extends CoreEntity {
  @Column({ unique: true })
  @Field((type) => String)
  @IsEmail()
  email: string;

  @Column({ select: false })
  @Field((type) => String)
  @IsString()
  password: string;

  @Column({ type: 'enum', enum: UserRole })
  @Field((type) => UserRole)
  @IsEnum(UserRole)
  role: UserRole;

  @Column({ default: false })
  @Field((type) => Boolean)
  @IsBoolean()
  verified: boolean;

  @Field((type) => [Restaurant])
  @OneToMany((type) => Restaurant, (restaurant) => restaurant.owner)
  restaurants: Restaurant[];

  @Field((type) => [Order])
  @OneToMany((type) => Order, (order) => order.customer)
  orders: Order[];

  @Field((type) => [Payment])
  @OneToMany((type) => Payment, (payment) => payment.user, { eager: true })
  payments: Payment[];

  @Field((type) => [Order])
  @OneToMany((type) => Order, (order) => order.driver)
  rides: Order[];

  // @Field((_) => [Episode], { nullable: true })
  //   @OneToMany(() => Episode, (episode) => episode.podcast, {
  //     cascade: true,
  //   })
  //   episodes: Episode[];

  // cascade 옵션이 true 값이면, podcast에 연결된 episode는 save를 하지 않아도 db에 자동으로 저장이 됩니다. 참고: Cascade
  // oneToMany()는 자동적으로 nullable:true임

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword(): Promise<void> {
    if (this.password) {
      try {
        this.password = await bcrypt.hash(this.password, 10);
      } catch (e) {
        console.log(e);
        throw new InternalServerErrorException();
      }
    }
  }
  // [ @BeforeInsert ]
  // 이 엔터티 삽입 전에 이 데코레이터가 적용되는 메서드를 호출합니다.
  // 엔티티에 메소드를 정의하고 @BeforeInsert 데코레이터로 표시하면 TypeORM은 엔티티가 repository/manager save를 사용하여
  // insert되기 전에 이 메서드를 호출합니다.
  // ex) mongoose에서 pre save처럼 DB에 저장되기 전에 실행되는 함수
  // ```
  // @BeforeInsert()
  // updateDates() {
  // this.createdDate = new Date();
  // }
  // ```
  // https://typeorm.io/#/listeners-and-subscribers/beforeinsert

  // [ @BeforeUpdate() ]
  // save()메서드를 사용하여 업데이트되기 전에 실행되는 데코레이터이다.
  // @BeforeUpdate()는 모델에서 정보가 변경된 경우에만 발생한다는 점에 유의하십시오.
  // 모델에서 아무 것도 수정하지 않고 저장을 실행하면 @BeforeUpdate 및 @AfterUpdate가 실행되지 않습니다.
  // 모델에서 변경된 것이 아닌 db에 update query만 보내고 있기 때문에 @BeforeUpdate() 데코레이터가 실행되지 않은 것이다.
  // update()는 단순히 쿼리만 DB에 보내는 것이며, 존재하지 않는 엔티티를 수정할 경우 에러가 나지 않지만 엔테티를 새로 생성하지 않음.
  // 따라서 DB에서 엔티티를 찾고 수정기능이 있는 save()를 써야 함

  // 솔루션을 보면 save 메소드는 Update에서도 이용합니다.
  // save 메소드는 항상 주어진 조건의 entity가 존재하는지 여부를 확인하고 없다면 새로운 엔티티를 만들고, 있다면 해당 엔티티를 업데이트하기 때문입니다.
  // 그래서 솔루션의 코드를 보면 updatePodcast, updateEpisode에서는 해당 엔티티가 있는지 없는지
  // findOne을 이용하여 존재 여부를 체크하는 것을 볼 수 있습니다. 물론 update 메소드를 이용해서도 Update 작업을 할 수 있습니다만,
  // update 메소드는 검색 criteria가 맞는지 여부는 확인 안하기 때문에, 속도는 좀더 빠르지만, 조금더 신중하게 사용할 필요는 있습니다.
  // https://github.com/typeorm/typeorm/blob/master/docs/listeners-and-subscribers.md#beforeupdate

  // save()메서드를 사용하여 업데이트되기 전에 실행되는 데코레이터이다.
  // @BeforeUpdate()는 모델에서 정보가 변경된 경우에만 발생한다는 점에 유의하십시오.
  // 모델에서 아무 것도 수정하지 않고 저장을 실행하면 @BeforeUpdate 및 @AfterUpdate가 실행되지 않습니다.
  // 모델에서 변경된 것이 아닌 db에 update query만 보내고 있기 때문에 @BeforeUpdate() 데코레이터가 실행되지 않은 것이다.
  // https://github.com/typeorm/typeorm/blob/master/docs/listeners-and-subscribers.md#beforeupdate

  async checkPassword(aPassword: string): Promise<boolean> {
    try {
      return await bcrypt.compare(aPassword, this.password);
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException();
    }
  }
}

// [ bcrypt ]
// npm i bcrypt
// npm i @types/bcrypt -D
// https://www.npmjs.com/package/bcrypt

// [ Entity Listeners and Subscribers ]
// 모든 엔터티에는 특정 엔터티 이벤트를 listen하는 커스텀 로직 메서드를 가질 수 있습니다.
// 그래서 listen하려는 이벤트를 메서드에 특별한 데코레이터로 마크해줍니다.
// 주의! listener 내에서 데이터베이스 호출을 수행하지 말고, 대신 subscribers를 선택하십시오.
// https://typeorm.io/#/listeners-and-subscribers
