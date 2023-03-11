import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { CoreEntity } from 'src/common/entities/common.entity';
import { Dish, DishOptionChoice } from 'src/restaurants/entities/dish.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

// Order Entity에서 Dishes: Dish[]를 하지 않은 이유는
// 유저는 Dish가 가진 옵션 중 하나만 택해야 하는데 Dish로 하면 모든 옵션이 들어가야 함
// 그래서 주문용 Entity인 OrderItem으로 만들어서 하나의 옵션만 선택하게끔 만듦

@InputType('OrderItemOptionInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class OrderItemOption {
  @Field((type) => String)
  name: string;

  @Field((type) => String, { nullable: true })
  choice?: string;
}

@InputType('OrderItemInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class OrderItem extends CoreEntity {
  @Field((type) => Dish)
  @ManyToOne((type) => Dish, {
    nullable: true,
    onDelete: 'CASCADE',
    eager: true,
  })
  dish: Dish;

  @Field((type) => [OrderItemOption], { nullable: true })
  @Column({ type: 'json', nullable: true })
  options?: OrderItemOption[];
}
