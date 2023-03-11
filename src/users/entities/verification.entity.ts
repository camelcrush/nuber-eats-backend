import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { v4 as uuidv4 } from 'uuid';
import { CoreEntity } from 'src/common/entities/common.entity';
import { BeforeInsert, Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { User } from './user.entity';

@InputType({ isAbstract: true })
@ObjectType()
@Entity()
export class Verification extends CoreEntity {
  @Column()
  @Field((type) => String)
  code: string;

  @OneToOne((type) => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;
  // [ One-to-one relations (1:1관계) ]
  // 일대일 관계는 A가 B의 인스턴스를 하나만 포함하고 B가 A의 인스턴스를 하나만 포함하는 관계입니다.
  //예를 들어 사용자 및 프로필 엔터티를 보면, 사용자는 하나의 프로필만 가질 수 있으며, 프로필은 하나의 사용자만 가질 수 있습니다.

  // 프로필에 @OneToOne을 추가하고 대상 관계 유형을 프로필로 지정했습니다.
  // 또한 relation의 한쪽에만 설정해야 하는 @JoinColumn() 을 추가했습니다. (@JoinColumn()은 필수로 지정해야 함)
  // @JoinColumn()을 설정한 쪽의 테이블에는 해당되는 엔터티 테이블에 대한 relation id와 foreign keys가 포함됩니다.
  // @JoinColumn은 관계의 한 쪽, 즉 데이터베이스 테이블에 foreign key가 있어야 하는 쪽에만 설정해야 합니다.

  // 요약: Verification을 통해 그 안에 User에 접근해서 User의 emailVerified를 false에서 true로 바꿀 것이기 때문에
  // Verification쪽에 @JoinColumn()을 추가하고 user를 통해 생성한 foreign key인 userId을 추가하도록 한 것이다.
  // ```
  // @OneToOne(() => Profile)
  // @JoinColumn()
  // profile: Profile;

  // 위와 같이 설정시 데이터베이스에는 profile에 대한 foreign key가 생김
  // profileId | int(11) | FOREIGN KEY
  // ```
  // https://typeorm.io/#/one-to-one-relations
  @BeforeInsert()
  createCode(): void {
    this.code = uuidv4();
  }
}
// [ uuid ]
// npm i uuid
// ```
// import { v4 as uuidv4 } from 'uuid';
// uuidv4(); // ⇨ '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d'
// ```
// https://www.npmjs.com/package/uuid

// uuid 앞에 4개 문자만 추출해서 저장하기
// uuidv4().substring(0, 4).toUpperCase() // CF26

// Verification엔티티를 생성하고 난 후 user에 위에서 생성한 User 엔티티를 넣을 때 주의할 점은
// await this.userRepository.save(createdUser)를 통해 모델을 DB에 완전히 저장한 후 넣어줘야 한다.
// 그렇지 않으면 user에 User데이터가 제대로 들어가지 않고, null값이 들어가게 된다.
// ```
// await this.verificationRepository.create({
// code: '',
// user: createdUser,
// });
// ```

// 자바스크립트로 랜덤 문자열 추출하기
// Math.random().toString(36).substring(2)
