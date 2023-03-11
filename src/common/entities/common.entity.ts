import { Field, ObjectType } from '@nestjs/graphql';
import {
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@ObjectType()
export class CoreEntity {
  @PrimaryGeneratedColumn()
  @Field((type) => Number)
  id: number;

  @CreateDateColumn()
  @Field((type) => Date)
  createdAt: Date;

  @UpdateDateColumn()
  @Field((type) => Date)
  updatedAt: Date;
}

// [ TypeORM special columns ]
// 추가 기능을 사용할 수 있는 몇 가지 Special columns들이 있습니다.
// @CreateDateColumn은 엔터티의 삽입 날짜로 자동 설정되는 특수 열입니다. 이 열은 설정할 필요가 없습니다. 자동으로 설정됩니다.
// @UpdateDateColumn은 entity manager 또는 repository의 저장을 호출할 때마다 엔티티의 업데이트 시간으로 자동 설정되는 특수 컬럼입니다.
// 이 열은 설정할 필요가 없습니다. 자동으로 설정됩니다.
// @DeleteDateColumn은 entity manager 또는 repository의 일시 삭제를 호출할 때마다 엔터티의 삭제 시간으로 자동 설정되는 특수 열입니다.
// 이 열은 설정할 필요가 없습니다. 자동으로 설정됩니다.
// @DeleteDateColumn이 설정되면 기본 범위는 "삭제되지 않음"이 됩니다.
// https://typeorm.io/#/entities/special-columns
