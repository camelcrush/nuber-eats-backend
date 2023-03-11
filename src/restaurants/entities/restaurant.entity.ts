import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsBoolean, IsOptional, IsString, Length } from 'class-validator';
import { CoreEntity } from 'src/common/entities/common.entity';
import { Order } from 'src/orders/entities/order.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, ManyToOne, OneToMany, RelationId } from 'typeorm';
import { Category } from './category.entity';
import { Dish } from './dish.entity';

// @IsOptional : validator를 위한 데코레이터로 default value를 가진 요소는 API에 전달되지 않게 되고
//               전달되지 않는 요소는 validator가 검사하지 않게 한다.
// @Column : typeORM을 위한 데코레이터로 DB에 저장될 default value를 default 요소로 정의한다.
// @Field : GraphQL을 위한 데코레이터로 API에 요소를 전달 하지 않을때 default value를 전달할 값을 정의한다.
// They are different, Column is for the DB and the other Field for GraphQL.

@InputType('RestaurantInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Restaurant extends CoreEntity {
  @Field((type) => String)
  @Column()
  @IsString()
  @Length(5)
  name: string;

  @Field((type) => String)
  @Column()
  @IsString()
  coverImg: string;

  @Field((type) => String)
  @Column()
  @IsString()
  address: string;

  @Field((type) => Category, { nullable: true })
  @ManyToOne((type) => Category, (category) => category.restaurants, {
    nullable: true,
    onDelete: 'SET NULL',
    eager: true,
  })
  category: Category;

  @Field((type) => User)
  @ManyToOne((type) => User, (user) => user.restaurants, {
    onDelete: 'CASCADE',
  })
  owner: User;

  @RelationId((restaurant: Restaurant) => restaurant.owner)
  ownerId: number;

  @Field((type) => [Dish])
  @OneToMany((type) => Dish, (dish) => dish.restaurant)
  menu: Dish[];

  @Field((type) => [Order])
  @OneToMany((type) => Order, (order) => order.restaurant)
  orders: Order[];

  @Field((type) => Boolean)
  @Column({ default: false })
  isPromoted: boolean;

  @Field((type) => Date, { nullable: true })
  @Column({ nullable: true })
  promotedUntil?: Date;
}

// [ Many-to-one / one-to-many relations ]

// 다대일/일대다 관계는 A가 B의 여러 인스턴스를 포함하지만 B는 A의 인스턴스를 하나만 포함하는 관계입니다.
// User 및 Photo 엔터티를 예로 들어 보겠습니다. 사용자는 여러 장의 사진을 가질 수 있지만 각 사진은 한 명의 사용자만 소유합니다.

// @OneToMany(): 일대다 관계에서 '다'에 속할 때 사용
// (DB에 해당 컬럼은 저장되지 않음)
// @ManyToOne(): 일대다 관계에서 '일'에 속할 때 사용
// (DB에 user면 userId로 id값만 저장됨)
// ```
// @Entity()
// export class Photo {
// @ManyToOne(() => User, user => user.photos)
// user: User;
// }
// @Entity()
// export class User {
// @OneToMany(() => Photo, photo => photo.user)
// photos: Photo[];
// }
// ```
// https://typeorm.io/#/many-to-one-one-to-many-relations

// @OneToMany() / @ManyToOne()에서는 @JoinColumn()을 생략할 수 있습니다.
// @OneToMany()는 @ManyToOne()이 없으면 안 됩니다 하지만 반대로 @ManyToOne()은 @OneToMany()이 없이도 정의할 수 있습니다.
// @ManyToOne()을 설정한 테이블에는 relation id가 외래 키를 가지고 있게 됩니다.

// [ nullable?: boolean; ]
// relation column 값이 null을 허용할 수 있는지 여부를 나타냅니다.

// [ Relation options ]
// onDelete: "RESTRICT"|"CASCADE"|"SET NULL"
// 참조된 객체가 삭제될 때, 외래 키(foreign key)가 어떻게 작동해야 하는지 지정한다.
// https://orkhan.gitbook.io/typeorm/docs/relations#relation-options

// [ @RelationId ]
// 속성에 특정 relation의 id를 로드합니다. 예를 들어 Post 엔터티에 Many-to-one이 있는 경우
// 새 속성을 @RelationId로 표시하여 새 Relation ID를 가질 수 있습니다.
// 이 기능은 many-to-many를 포함한 모든 종류의 관계에서 작동합니다. Relation ID는 표현용으로만 사용됩니다.
// 값을 연결할 때 기본 relation가 추가/제거/변경되지 않습니다.
// ' ' '
// @Entity()
// export class Post {

// @ManyToOne(type => Category)
// category: Category;

// @RelationId((post: Post) => post.category) // you need to specify target relation
// categoryId: number;
// }
// ' ' '
// https://github.com/typeorm/typeorm/blob/master/docs/decorator-reference.md#relationid

// + RelationId를 사용해도 되고, 아니면 레스토랑을 찾아올 때 아래와 같이 레스토랑의 owner가 로그인한 사용자인 레스토랑만을 찾아올 수도 있습니다.
// ' ' '
// const foundRestaurant: Restaurant | undefined = await this.restaurantsRepository.findOne({
// id: restaurantId,
// owner: loggedInUser,
// });
// ' ' '

// [ relations?: string[]; ]
// 로드해야 하는 엔티티의 관계를 나타냅니다. relation인 owner를 가져옵니다.
// ex) await this.restaurantsRepository.findOne({ id: restaurantId }, { relations: ['owner'] });

// [ loadRelationIds: boolean | object ]
// true로 설정하면 엔티티의 모든 relation ID를 로드하고 relation 객체가 아닌 관계 값에 매핑합니다. relation인 owner의 아이디만 로드해옵니다.
// ex) loadRelationIds: true
// ex) { loadRelationIds: { relations: ['owner'] } },
// '''
// loadRelationIds?: boolean | {
// relations?: string[];
// disableMixedMap?: boolean;
// };
// '''
// https://typeorm.delightful.studio/interfaces/_find_options_findmanyoptions_.findmanyoptions.html#loadrelationids
