import { Body, Controller, Post } from '@nestjs/common';

@Controller('payments')
export class PaymentsController {
  @Post('')
  processPaddlePayment(@Body() body) {
    console.log(body);
    return { ok: true };
  }
}
// [ Param decorators ]
// Nest는 HTTP 라우트 핸들러와 함께 사용할 수 있는 유용한 매개변수 데코레이터 세트를 제공합니다.
// 다음은 제공된 데코레이터와 이들이 나타내는 일반 Express(또는 Fastify) 객체의 목록입니다.

// NestJS
// @Param(param?: string)
// @Body(param?: string)
// @Query(param?: string)

// ExpressJS
// req.params / req.params[param]
// req.body / req.body[param]
// req.query / req.query[param]
// https://docs.nestjs.com/custom-decorators#param-decorators

// @Controller('movies')
// export class MoviesController {
//   @Get()
//   getAll() {
//     return 'This will return all movies';
//   }
//   @Get('search')
//   search(@Query('year') seachingYear: string) {
//     return `We are searching for a movie made after: ${seachingYear}`;
//   }

//   @Get(':id')
//   getOne(@Param('id') movieId: string) {
//     return `This will return one movie with the id: ${movieId}`;
//   }

//   @Post()
//   create(@Body() movieData) {
//     return movieData;
//   }

//   @Delete(':id')
//   remove(@Param('id') movieId: string) {
//     return `This will delete a movie with the id: ${movieId}`;
//   }

//  Patch: 일부분만 업데이트
//   @Patch(':id')
//   patch(@Param('id') movieId: string, @Body() updateData) {
//     return {
//       updatedMovie: movieId,
//       ...updateData,
//     };
//   }
// }

// Test
// npx ngrok
// npx ngrok http 4000
