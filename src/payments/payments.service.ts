import { Injectable } from '@nestjs/common';
import { Cron, Interval, SchedulerRegistry, Timeout } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { User } from 'src/users/entities/user.entity';
import { Equal, LessThan, Repository } from 'typeorm';
import {
  CreatePaymentInput,
  CreatePaymentOutput,
} from './dtos/create-payment.dto';
import { GetPaymentsOutput } from './dtos/get-payments.dto';
import { Payment } from './entities/payment.entity';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private readonly payments: Repository<Payment>,
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
    private schedulerRegistry: SchedulerRegistry,
  ) {}

  async createPayment(
    owner: User,
    { transactionId, restaurantId }: CreatePaymentInput,
  ): Promise<CreatePaymentOutput> {
    try {
      const restaurant = await this.restaurants.findOne({
        where: { id: restaurantId },
      });
      if (!restaurant) {
        return {
          ok: false,
          error: 'Restaurant not found',
        };
      }
      if (restaurant.ownerId !== owner.id) {
        return {
          ok: false,
          error: 'Not authorized',
        };
      }
      await this.payments.save(
        this.payments.create({
          transactionId,
          user: owner,
          restaurant,
        }),
      );
      restaurant.isPromoted = true;
      const date = new Date();
      date.setDate(date.getDate() + 7);
      restaurant.promotedUntil = date;
      this.restaurants.save(restaurant);
      // [ Date.prototype.setDate() ]
      // setDate() 메서드는 현재 설정된 월의 시작 부분을 기준으로 Date 객체의 날짜를 설정합니다.
      // ---------------------------------------------------
      // var theBigDay = new Date(1962, 6, 7); // 1962-07-07
      // theBigDay.setDate(24); // 1962-07-24
      // theBigDay.setDate(32); // 1962-08-01
      // theBigDay.setDate(22); // 1962-07-22
      // ---------------------------------------------------
      // https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Global_Objects/Date/setDate
      return {
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not create payment',
      };
    }
  }

  async getPayments(user: User): Promise<GetPaymentsOutput> {
    try {
      const payments = await this.payments.find({
        where: { user: Equal(user) },
      });
      return {
        ok: true,
        payments,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not load payments',
      };
    }
  }

  @Cron('0 0 0 * * *')
  async checkPromotedRestaurant() {
    const restaurants = await this.restaurants.find({
      where: {
        isPromoted: true,
        promotedUntil: LessThan(new Date()),
      },
    });
    // [ Advanced options ]
    // TypeORM은 더 복잡한 비교를 할 때, 사용할 수 있는 많은 내장 연산자를 제공합니다.
    // (Not, LessThan, LessThanOrEqual, MoreThan, Equal, Like, Between등)
    // -----------------------------------------------
    // await this.restaurantsRepository.find({
    // isPromoted: true,
    // promotedUntilDate: LessThan(new Date()),
    // });
    // -----------------------------------------------
    // https://orkhan.gitbook.io/typeorm/docs/find-options#advanced-options
    restaurants.forEach(async (restaurant) => {
      restaurant.isPromoted = false;
      restaurant.promotedUntil = null;
      await this.restaurants.save(restaurant);
    });
  }
}
// [ Task Scheduling ]
// Task Scheduling을 사용하면 고정된 날짜/시간, 반복 간격 또는 지정된 간격마다 특정 메서드나 함수를 한 번 실행되도록 예약할 수 있습니다.
// Node.js의 경우 cron과 유사한 기능을 애뮬레이트하는 여러 패키지가 있는데, Nest는 인기있는 Node.js node-cron 패키지와
//  통합되는 @nestjs/schedule 패키지를 제공합니다.
// https://docs.nestjs.com/techniques/task-scheduling

// 패키지 설치
// npm install --save @nestjs/schedule
// npm install --save-dev @types/cron

// Cron 패턴(순서)
// 초, 분, 시, 일, 월, 요일

// Declarative intervals
// 메서드가 (반복적으로) 지정된 간격으로 실행되어야 한다고 선언하려면 메서드 정의에 @Interval() 데코레이터를 접두어로 붙입니다.
// 간격 값을 밀리초 단위의 숫자로 데코레이터에 전달합니다.
// https://docs.nestjs.com/techniques/task-scheduling#declarative-intervals

// Declarative timeouts
// 메서드가 지정된 시간에 한 번 실행되어야 한다고 선언하려면 메서드 정의 앞에 @Timeout() 데코레이터를 붙입니다.
// 오프셋(밀리 초)을 전달합니다.
// https://docs.nestjs.com/techniques/task-scheduling#declarative-timeouts

// Dynamic cron jobs
// SchedulerRegistry API를 사용하여 코드의 어느 곳에서나 name으로 CronJob 인스턴스에 대한 참조를 가져옵니다.
// 먼저 표준 constructor injection을 사용하여 SchedulerRegistry를 주입합니다.
// https://docs.nestjs.com/techniques/task-scheduling#dynamic-cron-jobs

// [ 비교 ]
// @Cron('30 * * * * *', {
//   name: 'myJob',
// })
// checkForPayments() {
//   console.log('Checking for payments....(cron)');
//   const job = this.schedulerRegistry.getCronJob('myJob');
//   job.stop();
// }

// @Interval(5000)
// checkForPaymentsI() {
//   console.log('Checking for payments....(interval)');
// }

// @Timeout(20000)
// afterStarts() {
//   console.log('Congrats!');
// }
