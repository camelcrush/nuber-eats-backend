import {
  Field,
  Float,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { IsEnum, IsNumber } from 'class-validator';
import { CoreEntity } from 'src/common/entities/common.entity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  RelationId,
} from 'typeorm';
import { OrderItem } from './order-item.entity';

export enum OrderStatus {
  Pending = 'Pending',
  Cooking = 'Cooking',
  Cooked = 'Cooked',
  PickedUp = 'PickedUp',
  Delivered = 'Delivered',
}

registerEnumType(OrderStatus, { name: 'OrderStatus' });

@InputType('OrderInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Order extends CoreEntity {
  @Field((type) => User, { nullable: true })
  @ManyToOne((type) => User, (user) => user.orders, {
    onDelete: 'SET NULL',
    nullable: true,
    eager: true,
  })
  customer?: User;
  // [ Eager relations ]
  // Eager relation은 데이터베이스에서 엔티티를 로드할 때마다 자동으로 relation 필드들을 로드합니다. (eager: true를 추가)
  // eager:true일 때는 Pagination을 할 수 없음
  // ----------------------------------------------------------------
  // @ManyToMany(type => Category, category => category.questions, {
  // eager: true
  // })
  // @JoinTable()
  // categories: Category[];
  // -----------------------------------------------------------------
  // https://orkhan.gitbook.io/typeorm/docs/eager-and-lazy-relations#eager-relations

  // [ Lazy relations ]
  // Lazy relation은 해당 필드에 접근하면 로드됩니다. Lazy relation은 타입으로 Promise를 가져야 합니다.
  // Promise에 값을 저장하고 로드할 때도 Promise를 반환합니다.
  // ---------------------------------------------------------------------
  // @ManyToMany(type => Question, question => question.categories)
  // questions: Promise< Question[]>;

  // @ManyToMany(type => Category, category => category.questions)
  // @JoinTable()
  // categories: Promise< Category[]>;

  // const question = await connection.getRepository(Question).findOne(1);
  // const categories = await question.categories;
  // -----------------------------------------------------------------------
  // https://orkhan.gitbook.io/typeorm/docs/eager-and-lazy-relations#lazy-relations

  @RelationId((order: Order) => order.customer)
  customerId: number;

  @Field((type) => User, { nullable: true })
  @ManyToOne((type) => User, (user) => user.rides, {
    onDelete: 'SET NULL',
    nullable: true,
    eager: true,
  })
  driver?: User;

  @RelationId((order: Order) => order.driver)
  driverId: number;

  @Field((type) => Restaurant, { nullable: true })
  @ManyToOne((type) => Restaurant, (restaurant) => restaurant.orders, {
    onDelete: 'SET NULL',
    nullable: true,
    eager: true,
  })
  restaurant?: Restaurant;

  @Field((type) => [OrderItem])
  @ManyToMany((type) => OrderItem, { eager: true })
  @JoinTable()
  items: OrderItem[];
  // [ Many-to-many relations ]
  // 다대다 관계는 A가 B의 여러 인스턴스를 포함하고 B가 A의 여러 인스턴스를 포함하는 관계입니다.
  // Question 및 Category 엔터티를 예로 들어 보겠습니다.
  // Question에는 여러 Category가 있을 수 있으며 각 Category에는 여러 Question이 있을 수 있습니다.
  // @ManyToMany 관계에는 @JoinTable()이 필요합니다. @JoinTable은 관계의 한쪽(소유) 쪽에 넣어야 합니다.
  // -----------------------------------
  // @ManyToMany(() => Category)
  // @JoinTable()
  // categories: Category[]
  // -----------------------------------
  // https://typeorm.io/#/many-to-many-relations
  // https://orkhan.gitbook.io/typeorm/docs/many-to-many-relations
  @Field((type) => Float, { nullable: true })
  @Column({ nullable: true })
  @IsNumber()
  total: number;

  @Field((type) => OrderStatus)
  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.Pending })
  @IsEnum(OrderStatus)
  status: OrderStatus;
}
