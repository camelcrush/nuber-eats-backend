import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { Role } from 'src/auth/role.decorator';
import { User } from 'src/users/entities/user.entity';
import {
  CreatePaymentInput,
  CreatePaymentOutput,
} from './dtos/create-payment.dto';
import { GetPaymentsOutput } from './dtos/get-payments.dto';
import { Payment } from './entities/payment.entity';
import { PaymentService } from './payments.service';

@Resolver((of) => Payment)
export class PaymentResolver {
  constructor(private readonly paymentService: PaymentService) {}

  @Mutation((returns) => CreatePaymentOutput)
  @Role(['Owner'])
  createPayment(
    @AuthUser() owner: User,
    @Args('input') createPaymentInput: CreatePaymentInput,
  ): Promise<CreatePaymentOutput> {
    return this.paymentService.createPayment(owner, createPaymentInput);
  }

  @Query((returns) => GetPaymentsOutput)
  @Role(['Owner'])
  getPayments(@AuthUser() user: User): Promise<GetPaymentsOutput> {
    return this.paymentService.getPayments(user);
  }
}
// [ Paddle ]
// (소프트웨어 회사를 위한 결제 인프라)
// 오직 소프트웨어와 디지털 내용물만 거래 가능한 온라인 결제 처리
// 체크아웃에서 글로벌 판매세 준수에 이르기까지 전 세계 기업은 Paddle을 사용하여 지불 스택을 단순화합니다.
// https://paddle.com

// [ Stripe ]
// 인터넷 비즈니스를 위한 온라인 결제 처리 (한국 지원X, 실제 회사 필요)
// https://stripe.com

// [ Braintree ]
// PayPal, Venmo(미국), 신용카드 및 직불카드, Apple Pay 및 Google Pay와 같은 인기 디지털 지갑을
// 하나의 원활한 통합으로 제공하는 유일한 결제 플랫폼으로 더 많은 구매자에게 도달하고 더 많은 전환을 유도하세요.
// https://www.braintreepayments.com/
