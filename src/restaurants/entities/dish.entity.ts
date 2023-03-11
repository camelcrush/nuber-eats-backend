import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { IsNumber, IsString, Length } from 'class-validator';
import { CoreEntity } from 'src/common/entities/common.entity';
import { Column, Entity, ManyToOne, RelationId } from 'typeorm';
import { Restaurant } from './restaurant.entity';

@InputType('DishChoiceInputType', { isAbstract: true })
@ObjectType()
export class DishOptionChoice {
  @Field((type) => String)
  name: string;

  @Field((type) => Int, { nullable: true })
  extra?: number;
}

@InputType('DishOptionInputType', { isAbstract: true })
@ObjectType()
export class DishOption {
  @Field((type) => String)
  name: string;

  @Field((type) => [DishOptionChoice], { nullable: true })
  choices?: DishOptionChoice[];

  @Field((type) => Int, { nullable: true })
  extra?: number;
}

@InputType('DishInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Dish extends CoreEntity {
  @Field((type) => String)
  @Column()
  @IsString()
  @Length(5)
  name: string;

  @Field((type) => Int)
  @Column()
  @IsNumber()
  price: number;

  @Field((type) => String, { nullable: true })
  @Column({ nullable: true })
  @IsString()
  photo?: string;

  @Field((type) => String)
  @Column()
  @IsString()
  @Length(5, 140)
  description: string;

  @Field((type) => Restaurant)
  @ManyToOne((type) => Restaurant, (restaurant) => restaurant.menu, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  restaurant: Restaurant;

  //  ManyToOne 일때 nullable: true 기본값 인듯 싶습니다.
  // { onDelete: 'CASCADE', nullable: false },
  // 주었을때 restaurant 값이 없으면 error 발생합니다.

  @RelationId((dish: Dish) => dish.restaurant)
  restaurantId: number;

  @Field((type) => [DishOption], { nullable: true })
  @Column({ type: 'json', nullable: true })
  options?: DishOption[];
}
// [ Column Types ]
// TypeORM은 가장 일반적으로 사용되는 데이터베이스 지원 Column type을 모두 지원합니다.
// Column type은 데이터베이스 유형에 따라 다릅니다. 이는 데이터베이스 스키마가 어떻게 생겼는지에 대해 더 많은 유연성을 제공합니다.
//  Column type을 @Column의 첫 번째 매개변수로 지정하거나 @Column의 column 옵션에서 지정할 수 있습니다.
// ```
// @Column("int")
// @Column({ type: "int" })
// @Column("varchar", { length: 200 })
// @Column({ type: "int", width: 200 })
// ```
// https://orkhan.gitbook.io/typeorm/docs/entities#column-types
