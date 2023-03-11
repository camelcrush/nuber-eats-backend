import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Equal, Like, Raw, Repository } from 'typeorm';
import { AllCategoriesOutput } from './dtos/all-categories.dto';
import { CategoryInput, CategoryOutput } from './dtos/category.dto';
import { CreateDishInput, CreateDishOutput } from './dtos/create-dish.dto';
import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
} from './dtos/create-restaurant.dto';
import { DeleteDishInput, DeleteDishOutput } from './dtos/delete-dish.dto';
import {
  DeleteRestaurantInput,
  DeleteRestaurantOutput,
} from './dtos/delete-restaurant.dto';
import { EditDishInput, EditDishOutput } from './dtos/edit-dish.dto';
import {
  EditRestaurantInput,
  EditRestaurantOutput,
} from './dtos/edit-restaurant.dto';
import {
  MyRestaurantInput,
  MyRestaurantOutput,
} from './dtos/my-restaurant.dto';
import { MyRestaurantsOutput } from './dtos/my-restaurants.dto';
import { RestaurantInput, RestaurantOutput } from './dtos/restaurant.dto';
import { RestaurantsInput, RestaurantsOutput } from './dtos/restaurants.dto';
import {
  SearchRestaurantInput,
  SearchRestaurantOutput,
} from './dtos/search-restaurant.dto';
import { Category } from './entities/category.entity';
import { Dish } from './entities/dish.entity';
import { Restaurant } from './entities/restaurant.entity';
import { CategoryRepository } from './repositories/category.repository';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
    @InjectRepository(Dish)
    private readonly dishes: Repository<Dish>,
    @InjectRepository(CategoryRepository)
    private readonly categories: CategoryRepository,
  ) {}
  // [ create() ]
  // 엔티티 생성
  // 새 엔티티 인스턴스를 만들고 이 개체의 모든 엔터티 속성을 새 엔티티에 복사합니다. 엔터티 스키마에 있는 속성만 복사합니다.

  // [ save() ]
  // 엔티티를 데이터베이스에 저장 또는 업데이트
  // 데이터베이스에 지정된 모든 엔터티를 저장합니다. 엔티티가 데이터베이스에 없으면 삽입하고, 그렇지 않으면 업데이트합니다.

  // [ update() ]
  // 엔티티를 부분적으로 업데이트합니다. 엔티티는 주어진 조건으로 찾을 수 있습니다.
  // save 메소드와 달리 캐스케이드, 관계 및 기타 작업이 포함되지 않은 기본 작업을 실행합니다. 빠르고 효율적인 UPDATE 쿼리를 실행합니다.
  // 데이터베이스에 엔티티가 있는지 확인하지 않습니다.
  // update()는 단순히 쿼리만 DB에 보내는 것이며, 존재하지 않는 엔티티를 수정할 경우 에러가 나지 않지만 엔테티를 새로 생성하지 않음.
  // 일반적으로 엔티티를 확인하고 업데이트 수행하는 기능은 save([{}])를 쓰고 있음.

  // update()메서드 반환값: UpdateResult
  // UpdateQueryBuilder 실행에 의해 반환된 결과 객체입니다.
  // https://typeorm.io/#/undefined/save-a-one-to-one-relation
  async createRestaurant(
    owner: User,
    createRestaurantInput: CreateRestaurantInput,
  ): Promise<CreateRestaurantOutput> {
    try {
      const newRestaurant = this.restaurants.create(createRestaurantInput);
      newRestaurant.owner = owner;
      let category = await this.categories.getOrCreate(
        createRestaurantInput.categoryName,
      );
      newRestaurant.category = category;
      await this.restaurants.save(newRestaurant);
      return {
        ok: true,
        restaurantId: newRestaurant.id,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not create restaurant',
      };
    }
  }

  async editRestaurant(
    owner: User,
    editRestaurantInput: EditRestaurantInput,
  ): Promise<EditRestaurantOutput> {
    try {
      const restaurant = await this.restaurants.findOne({
        where: { id: editRestaurantInput.restaurantId },
      });
      if (!restaurant) {
        return {
          ok: false,
          error: 'Restaurant not found',
        };
      }
      if (owner.id !== restaurant.ownerId) {
        return {
          ok: false,
          error: 'Not authorized',
        };
      }
      let category: Category = null;
      if (editRestaurantInput.categoryName) {
        category = await this.categories.getOrCreate(
          editRestaurantInput.categoryName,
        );
      }
      await this.restaurants.save([
        {
          id: editRestaurantInput.restaurantId,
          ...editRestaurantInput,
          ...(category && { category }),
        },
      ]);
      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error: 'Could not edit Restaurant',
      };
    }
  }

  async deleteRestaurant(
    owner: User,
    { restaurantId }: DeleteRestaurantInput,
  ): Promise<DeleteRestaurantOutput> {
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
      if (owner.id !== restaurant.ownerId) {
        return {
          ok: false,
          error: 'Not authorized',
        };
      }
      await this.restaurants.delete(restaurantId);
      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error: 'Could not delete Restaurant',
      };
    }
  }

  async allCategories(): Promise<AllCategoriesOutput> {
    try {
      const categories = await this.categories.find();
      return {
        ok: true,
        categories,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not load categories',
      };
    }
  }

  countRestaurants(category: Category) {
    // return this.restaurants.countBy({ category: Equal(category) });
    return this.restaurants.count({ where: { category: Equal(category) } });
  }

  async findCategoryBySlug({
    slug,
    page,
  }: CategoryInput): Promise<CategoryOutput> {
    try {
      const category = await this.categories.findOne({
        where: { slug },
      });
      if (!category) {
        return {
          ok: false,
          error: 'Category not found',
        };
      }
      // relations: ['restaurant']
      // categories.findOne()에서 relations를 추가하지 않는 이유
      // restaurant가 300개라면? 그래서 Pagination개념 추가
      const restaurants = await this.restaurants.find({
        where: { category: Equal(category) },
        take: 9,
        skip: (page - 1) * 9,
        order: {
          isPromoted: 'DESC',
        },
      });
      // [ order ]
      // 데이터를 가져올 때 내림차순 또는 오름차순으로 가져오도록 순서를 지정한다.
      // ASC(Ascending): 오름차순, 숫자 -1
      // DESC(Descending): 내림차순, 숫자 1
      // -----------------------------------
      // userRepository.find({
      // order: {
      // name: "ASC",
      // id: "DESC",
      // },
      // });
      // -----------------------------------
      // https://orkhan.gitbook.io/typeorm/docs/find-options
      const totalResults = await this.countRestaurants(category);
      return {
        ok: true,
        restaurants,
        category,
        totalPages: Math.ceil(totalResults / 9),
        totalResults,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not load category',
      };
    }
  }
  // [ find ]
  // where: 엔티티를 쿼리할 조건
  // skip: 스킵할 엔티티 갯수
  // take: 가져올 엔티티 갯수
  // ----------------------------------------------------------------
  // userRepository.find({
  // where: { project: { name: "TypeORM", initials: "TORM" } },
  // relations: ["project"],
  // });
  // userRepository.find({
  // order: {
  // columnName: "ASC",
  // },
  // skip: 0,
  // take: 10,
  // });
  // ----------------------------------------------------------------
  // https://typeorm.io/#/find-options/basic-options
  // https://github.com/typeorm/typeorm/blob/master/docs/find-options.md#basic-options

  // [ TypeORM Cursor Pagination ]
  // https://www.npmjs.com/package/typeorm-cursor-pagination
  async allRestaurants({ page }: RestaurantsInput): Promise<RestaurantsOutput> {
    try {
      const [restaurnats, totalResults] = await this.restaurants.findAndCount({
        take: 9,
        skip: (page - 1) * 9,
        order: {
          isPromoted: 'DESC',
        },
      });
      // [ findAndCount() ]
      // 주어진 기준과 일치하는 모든 엔티티를 카운트하고, 찾아옵니다.
      // ex) const [allPhotos, photosCount] = await photoRepository.findAndCount();
      // findAndCount(options?: FindManyOptions)
      return {
        ok: true,
        results: restaurnats,
        totalPages: Math.ceil(totalResults / 9),
        totalResults,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not load restaurants',
      };
    }
  }

  async findRestaurantById({
    restaurantId,
  }: RestaurantInput): Promise<RestaurantOutput> {
    try {
      const restaurant = await this.restaurants.findOne({
        where: { id: restaurantId },
        relations: ['menu'],
      });
      if (!restaurant) {
        return {
          ok: false,
          error: 'Restaurant not found',
        };
      }
      return {
        ok: true,
        restaurant,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not find restaurant',
      };
    }
  }

  async searchRestaurantByName({
    query,
    page,
  }: SearchRestaurantInput): Promise<SearchRestaurantOutput> {
    try {
      const [restaurants, totalResults] = await this.restaurants.findAndCount({
        where: {
          name: Raw((name) => `${name} ILIKE '%${query}%'`),
        },
        take: 9,
        skip: (page - 1) * 9,
      });
      return {
        ok: true,
        restaurants,
        totalResults,
        totalPages: Math.ceil(totalResults / 9),
      };
    } catch {
      return {
        ok: false,
        error: 'Could not search for restaurants',
      };
    }
  }
  // [ TypeORM 대신 직접 SQL로 데이터 가져오기 ]
  // [ Like ] : 대소문자 구분 있음
  // ----------------------------------------------------------------
  // import { Like } from "typeorm";
  // const loadedPosts = await connection.getRepository(Post).find({
  // title: Like("%out #%"),
  // });
  // 위의 코드는 아래 쿼리를 실행합니다.
  // SELECT * FROM "post" WHERE "title" LIKE '%out #%'
  // ----------------------------------------------------------------
  // https://orkhan.gitbook.io/typeorm/docs/find-options#advanced-options
  // https://github.com/typeorm/typeorm/blob/master/docs/find-options.md#advanced-options

  // [ SQL - LIKE Clause ]
  // SQL LIKE 절은 wildcard 연산자를 사용하여 값을 유사한 값과 비교하는 데 사용됩니다.
  // 퍼센트 기호(%)는 0, 하나 또는 여러 문자를 나타냅니다. 밑줄(_)은 단일 숫자 또는 문자를 나타냅니다.
  // 이러한 기호는 조합하여 사용할 수 있습니다.
  // 예시
  // WHERE SALARY LIKE '200%' : 200으로 시작하는 모든 값을 찾습니다.
  // WHERE SALARY LIKE '%200%': 어느 위치든 200이 있는 값을 찾습니다.
  // WHERE SALARY LIKE '_00%': 두 번째 및 세 번째 위치에 00이 있는 값을 찾습니다.
  // WHERE SALARY LIKE '%2': 2로 끝나는 값을 찾습니다.
  // https://www.tutorialspoint.com/sql/sql-like-clause.htm

  // [ ILike ] : 대소문자 구분 없음
  // 현재는 문제없이 ILike사용 가능합니다.
  // ILike(`%${restaurantName}%`)
  // ----------------------------------------------------------------
  // import { ILike } from "typeorm";
  // const loadedPosts = await connection.getRepository(Post).find({
  // title: ILike("%out #%"),
  // });
  // ----------------------------------------------------------------
  // https://orkhan.gitbook.io/typeorm/docs/find-options

  // [ Raw ]
  // Raw((name) => `${name} ILIKE '%${restaurantName}%'`)
  // ----------------------------------------------------------------
  // import { Raw } from "typeorm";
  // const loadedPosts = await connection.getRepository(Post).find({
  // likes: Raw("dislikes - 4"),
  // });
  // const loadedPosts = await connection.getRepository(Post).find({
  // currentDate: Raw((alias) => `${alias} > NOW()`),
  // });
  // ----------------------------------------------------------------
  async createDish(
    owner: User,
    createDishInput: CreateDishInput,
  ): Promise<CreateDishOutput> {
    try {
      const restaurant = await this.restaurants.findOne({
        where: { id: createDishInput.restaurantId },
      });
      if (!restaurant) {
        return {
          ok: false,
          error: 'Restaurant not found',
        };
      }
      if (owner.id !== restaurant.ownerId) {
        return {
          ok: false,
          error: 'Not authorized',
        };
      }
      await this.dishes.save(
        this.dishes.create({ ...createDishInput, restaurant }),
      );
      return {
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not create dish',
      };
    }
  }

  async editDish(
    owner: User,
    editDishInput: EditDishInput,
  ): Promise<EditDishOutput> {
    try {
      const dish = await this.dishes.findOne({
        where: { id: editDishInput.dishId },
        relations: ['restaurant'],
      });
      if (!dish) {
        return {
          ok: false,
          error: 'Dish not found',
        };
      }
      if (dish.restaurant.ownerId !== owner.id) {
        return {
          ok: false,
          error: 'Not authorized',
        };
      }
      await this.dishes.save([{ id: editDishInput.dishId, ...editDishInput }]);
      return {
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not edit dish',
      };
    }
  }

  async deleteDish(
    owner: User,
    { dishId }: DeleteDishInput,
  ): Promise<DeleteDishOutput> {
    try {
      const dish = await this.dishes.findOne({
        where: { id: dishId },
        relations: ['restaurant'],
      });
      if (!dish) {
        return {
          ok: false,
          error: 'Dish not found',
        };
      }
      if (dish.restaurant.ownerId !== owner.id) {
        return {
          ok: false,
          error: 'Not authorized',
        };
      }
      await this.dishes.delete(dishId);
      return {
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not delete dish',
      };
    }
  }

  async myRestaurants(owner: User): Promise<MyRestaurantsOutput> {
    try {
      const restaurants = await this.restaurants.find({
        where: { owner: Equal(owner) },
      });
      return {
        ok: true,
        restaurants,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not find restaurnats',
      };
    }
  }

  async myRestaurant(
    owner: User,
    { id }: MyRestaurantInput,
  ): Promise<MyRestaurantOutput> {
    try {
      const restaurant = await this.restaurants.findOne({
        where: { id, owner: Equal(owner) },
        relations: ['menu', 'orders'],
      });
      return {
        ok: true,
        restaurant,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not find restaurant',
      };
    }
  }
}
