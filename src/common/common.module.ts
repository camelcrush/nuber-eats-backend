import { Global, Module } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';
import { PUB_SUB } from './common.constants';

const pubsub = new PubSub();
// [ Pubsub ]
// --------------------------------------------------------------
// import { PubSub } from 'graphql-subscriptions';
// const pubsub = new PubSub();
// const resolvers = {
// Subscription: {
// somethingChanged: {
// subscribe: () => pubsub.asyncIterator("hello"),
// },
// },
// }
// pubsub.publish를 사용할 때마다 우리가 사용하는 전송을 사용하여 publish합니다.
// pubsub.publish("hello", { somethingChanged: { id: "123" }});
// --------------------------------------------------------------
// https://www.apollographql.com/docs/graphql-subscriptions/setup/#pubsub

// [ graphql-redis-subscriptions ]
// https://github.com/davidyaha/graphql-redis-subscriptions
@Global()
@Module({
  providers: [
    {
      provide: PUB_SUB,
      useValue: pubsub,
    },
  ],
  exports: [PUB_SUB],
})
export class CommonModule {}
// [ Global modules ]
// 즉시 사용할 수 있는 모든 제공자 세트(예: 도우미, 데이터베이스 연결 등)를 제공하려면 @Global() 데코레이터를 사용하여 모듈을 전역적으로 만드십시오.
// 또는 forRoot안에서 global: true를 통해서도 전역 모듈로 만들 수 있다. 따로 Import를 안 해주어도 됨, 대신 exports에 추가하고 appModule에도 추가
// -------------------------------------------
// return {
// global:true
// module: JwtModule,
// providers: [JwtService],
// exports: [JwtService],
// };
// -------------------------------------------
// https://docs.nestjs.com/modules#global-modules
