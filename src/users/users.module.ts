import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Verification } from './entities/verification.entity';
import { UsersResolver } from './users.resolver';
import { UsersService } from './users.service';

// [ Repository Pattern ]
// TypeORM은 repository design pattern,을 지원하므로 각 엔터티에는 자체 저장소가 있습니다.
// 이러한 리포지토리는 데이터베이스 연결에서 얻을 수 있습니다.
// forFeature() 메서드를 사용하여 현재 범위(현재 모듈)에 등록될 저장소를 정의합니다.
// @InjectRepository() 데코레이터를 사용하여 UsersRepository를 UsersService에 주입할 수 있습니다.
// https://docs.nestjs.com/techniques/database#repository-pattern

// [ NestJS Repository ]
// https://docs.nestjs.com/recipes/sql-typeorm
// https://docs.nestjs.com/recipes/mikroorm#repositories

@Module({
  imports: [TypeOrmModule.forFeature([User, Verification])],
  providers: [UsersResolver, UsersService],
  exports: [UsersService],
})
export class UsersModule {}

// [ Active Record ]
// Active Record 패턴은 모델 내에서 데이터베이스에 액세스하는 접근 방식입니다.
// ```
// // example how to save AR entity
// const user = new User();
// user.firstName = "Timber";
// user.isActive = true;
// await user.save();
// const users = await User.find({ skip: 2, take: 5 });
// ```

// [ Data Mapper ]
// Data Mapper는 모델 대신 리포지토리 내의 데이터베이스에 액세스하는 접근 방식입니다.
// 데이터 매퍼 접근 방식을 사용하여 "리포지토리"라는 별도의 클래스에서 모든 쿼리 메서드를 정의하고 리포지토리를 사용하여 객체를 저장, 제거 및 로드합니다.
// 데이터 매퍼에서 엔터티는 매우 멍청합니다.객체는 속성을 정의하고 일부 "더미" 메서드가 있을 수 있습니다.
// ```
// const userRepository = connection.getRepository(User);

// // example how to save DM entity
// const user = new User();
// user.firstName = "Timber";
// user.isActive = true;
// await userRepository.save(user);
// const users = await userRepository.find({ skip: 2, take: 5 });
// ```
// https://typeorm.io/#/active-record-data-mapper
