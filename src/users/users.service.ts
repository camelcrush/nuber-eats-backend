import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from 'src/jwt/jwt.service';
import { MailService } from 'src/mail/mail.service';
import { Repository } from 'typeorm';
import {
  CreateAccountInput,
  CreateAccountOutput,
} from './dtos/create-account.dto';
import { EditProfileInput, EditProfileOutput } from './dtos/editProfile.dto';
import { LoginInput, LoginOutput } from './dtos/login.dto';
import { UserProfileOutput } from './dtos/user-profile.dto';
import { VerifyEmailOutput } from './dtos/verify-email.dto';
import { User } from './entities/user.entity';
import { Verification } from './entities/verification.entity';

// import { MovieService } from './movie.service';
// constructor(private readonly movieService: MovieService) {}
// The first one is the NestJS way, it will do dependency injection for you.

@Injectable()
export class UsersService {
  // [ constructor ]
  // constructor 메서드는 클래스의 인스턴스 객체를 생성하고 초기화하는 특별한 메서드입니다.
  // 또한 constructor를 사용하면 다른 모든 메서드 호출보다 앞선 시점인 인스턴스 객체를 초기화할 때 수행할 초기화 코드를 정의할 수 있습니다.
  // https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Classes/constructor
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Verification)
    private readonly verifications: Repository<Verification>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}
  async createAccount({
    email,
    password,
    role,
  }: CreateAccountInput): Promise<CreateAccountOutput> {
    try {
      // typeorm 0.3.6 기준으로 말씀드립니다
      // 버전이 올라가면서 where를 명시적으로 써주게 바꼈습니다
      // const exists = await this.users.findOne({ where: { email } });
      const exists = await this.users.findOne({ where: { email } });
      if (exists) {
        return { ok: false, error: 'There is a user with that email already' };
      }
      const user = await this.users.save(
        this.users.create({ email, password, role }),
      );
      const verification = await this.verifications.save(
        this.verifications.create({ user }),
      );
      this.mailService.sendVerificationEmail(user.email, verification.code);
      return { ok: true };
    } catch (e) {
      // make error
      return { ok: false, error: "Couldn't create account" };
    }
  }

  async login({ email, password }: LoginInput): Promise<LoginOutput> {
    try {
      const user = await this.users.findOne({
        where: { email },
        select: ['id', 'password'],
      });
      if (!user) {
        return { ok: false, error: 'User not found' };
      }
      const passwordOk = await user.checkPassword(password);
      if (!passwordOk) {
        return {
          ok: false,
          error: 'Wrong password',
        };
      }
      const token = this.jwtService.sign(user.id);
      return {
        ok: true,
        token,
      };
    } catch (error) {
      return { ok: false, error: "Can't log user in" };
    }
  }

  async findById(id: number): Promise<UserProfileOutput> {
    try {
      const user = await this.users.findOneOrFail({ where: { id } });
      return {
        ok: true,
        user,
      };
    } catch (error) {
      return {
        ok: false,
        error: 'User not found.',
      };
    }
  }

  async editProfile(
    userId: number,
    { email, password }: EditProfileInput,
  ): Promise<EditProfileOutput> {
    try {
      const user = await this.users.findOne({ where: { id: userId } });
      if (email) {
        user.email = email;
        user.verified = false;
        this.verifications.delete({ user: { id: user.id } });
        const verification = await this.verifications.save(
          this.verifications.create({ user }),
        );
        this.mailService.sendVerificationEmail(user.email, verification.code);
      }
      if (password) {
        user.password = password;
      }
      await this.users.save(user);
      return {
        ok: true,
      };
    } catch (error) {
      return { ok: true, error: 'Could not update Profile.' };
    }
  }

  async verifyEmail(code: string): Promise<VerifyEmailOutput> {
    try {
      const verification = await this.verifications.findOne({
        where: { code },
        relations: ['user'],
      });
      if (verification) {
        verification.user.verified = true;
        await this.users.save(verification.user);
        await this.verifications.delete(verification.id);
        return {
          ok: true,
        };
      }
      return { ok: false, error: 'Verification not found.' };
    } catch (error) {
      return { ok: false, error: 'Coult not verify email' };
    }
  }
}

// Prisma에서처럼 TypeORM에서도 관계를 가지고 있는 필드는 TypeORM에 따로 지정하지 않으면 자동으로 해당 필드를 보여주지 않는다.

// [ loadRelationIds: true ]
// true로 설정시 relation id값을 가져온다. (userId: 10)
// 엔터티의 모든 관계 ID를 로드하고 관계 개체가 아닌 관계 값에 매핑합니다.

// [ relations ]
// loadRelationIds를 통해 relation id만 가져올 수도 있고, relations를 통해 해당 필드의 전체 데이터를 가져올 수도 있다.
// ```
// await this.verificationRepository.findOne({ code },{ relations: ['user'] },);
// await userRepository.find({ relations: ["profile"] });
// ```

// [ email verify ]
// 비밀번호를 해시하지 않고 emailVerified를 false에서 true로 업데이트 하는 또 다른 방법입니다.
// 앞서 update()를 실행하게 되면 @BeforeUpdate()데코레이터가 실행되지 않는 것을 이용해서
// 아래와 같이 간단하게 update()메서드를 이용해서 verified를 true로 바꿔줄 수도 있습니다.
// (password컬럼에 select:false를 지정해주지 않아도 됩니다.)
// ex) await this.userRepository.update(foundVerification.user.id, { emailVerified: true });

// [ @Column({ select: false }) ]
// QueryBuilder나 find 실행자(find메서드들)를 통해 해당 엔티티를 가져올 때 해당 column을 항상 선택되어질지 여부를 나타냅니다.
// 기본값은 "true"입니다.
// false로 지정하게 되면 해당 column을 DB로부터 찾아오지 않는다.
// https://typeorm.delightful.studio/interfaces/_decorator_options_columnoptions_.columnoptions.html

// 강의에서는 password를 select: false로 설정하여, password를 findOne에 포함시키지 않았고,
// this.password가 없기에 @BeforeUpdate()가 실행되지 않음
// login의 경우 password가 필요하기에 findOne()에 select 옵션을 사용하였음.
