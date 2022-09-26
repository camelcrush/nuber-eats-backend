import { Args, Query, Resolver } from '@nestjs/graphql';
import { Restaurant } from './entities/restaurant.entity';

@Resolver((of) => Restaurant)
export class RestaurantResolver {
  @Query((returns) => [Restaurant])
  isPizzaGood(@Args('veganOnly') veganOnly: boolean): Restaurant[] {
    return [];
  }
}
