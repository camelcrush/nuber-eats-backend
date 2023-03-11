import { EntityRepository, Repository } from 'typeorm';
import { Category } from '../entities/category.entity';

@EntityRepository(Category)
export class CategoryRepository extends Repository<Category> {
  async getOrCreate(name: string): Promise<Category> {
    const categoryName = name.trim().toLowerCase();
    const categorySlug = categoryName.replace(/ /g, '-');
    let category = await this.findOne({
      where: { slug: categorySlug },
    });
    if (!category) {
      category = await this.save(
        this.create({ slug: categorySlug, name: categoryName }),
      );
    }
    return category;
  }
}

// [ 정규표현식 테스트 ]
// / /g: 모든 스페이스 제거
// https://www.regexpal.com/

// [ String.prototype.replaceAll() ]
// 정규표현식을 사용해도 되고 replaceAll()을 사용해도 됩니다.
// "hi how are you".replaceAll(" ","-") // 'hi-how-are-you'
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replaceAll

// [ Custom repositories ]
// 데이터베이스 작업을 위한 메소드를 포함해야 하는 사용자 정의 리포지토리를 생성할 수 있습니다.
// 일반적으로 사용자 지정 리포지토리는 단일 엔티티에 대해 생성되고 특정 쿼리를 포함합니다.
// 예를 들어, 주어진 성과 이름으로 사용자를 검색하는 findByName(firstName: string, lastName: string)이라는 메서드가 있다고 가정해 봅시다.
//  이 방법의 가장 좋은 위치는 Repository이므로 userRepository.findByName(...)과 같이 호출할 수 있습니다.
// ```
// import {EntityRepository, Repository} from "typeorm";
// import {User} from "../entity/User";

// @EntityRepository(User)
// export class UserRepository extends Repository {

// findByName(firstName: string, lastName: string) {
// return this.findOne({ firstName, lastName });
// }
// }
// ```
// https://typeorm.io/#/custom-repository

// I solved the deprecation problem with this reference.
// https://gist.github.com/rhutchison/a530d89c37f1978a48dcee4bf2418cb7
// 함수를 이용해서 해결 할 수도 있네요.

// deprecated 문제 관련해서 스택오버플로우에 좋은 답변이 있어서 공유해요
// https://stackoverflow.com/questions/71557301/how-to-workraound-this-typeorm-error-entityrepository-is-deprecated-use-repo
// +1 for https://stackoverflow.com/a/72533424
