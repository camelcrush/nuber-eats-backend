import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { CoreEntity } from 'src/common/entities/common.entity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, ManyToOne, RelationId } from 'typeorm';

@InputType('PaymentInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Payment extends CoreEntity {
  @Field((type) => String)
  @Column()
  transactionId: string;

  @Field((type) => User)
  @ManyToOne((type) => User, (user) => user.payments)
  user: User;

  @RelationId((payment: Payment) => payment.user)
  userId: number;

  @Field((type) => Restaurant)
  @ManyToOne((type) => Restaurant)
  restaurant: Restaurant;

  @Field((type) => Int)
  @RelationId((payment: Payment) => payment.restaurant)
  restaurantId: number;
}

// [ Many-to-one / one-to-many relations ]
// @OneToMany는 @ManyToOne 없이 존재할 수 없습니다.
// @OneToMany를 사용하려면 @ManyToOne이 필요합니다.
// 그러나 역은 필요하지 않습니다. @ManyToOne 관계에만 관심이 있다면 관련 엔터티에 @OneToMany 없이 관계를 정의할 수 있습니다.
// @ManyToOne을 설정한 위치: 관련 엔터티에는 "relation ID"와 foreign key가 있습니다.
// ----------------------------------------------------
// @ManyToOne(() => User, (user) => user.photos)
// user: User

// @OneToMany(() => Photo, (photo) => photo.user)
// photos: Photo[]
// ----------------------------------------------------
// https://typeorm.io/many-to-one-one-to-many-relations
