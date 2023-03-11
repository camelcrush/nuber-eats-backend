import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { UsersService } from 'src/users/users.service';
import { JwtService } from './jwt.service';

@Injectable()
export class JwtMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UsersService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    if ('x-jwt' in req.headers) {
      const token = req.headers['x-jwt'];
      try {
        const decoded = this.jwtService.verify(token.toString());
        if (typeof decoded === 'object' && decoded.hasOwnProperty('id')) {
          const { user, ok } = await this.userService.findById(decoded['id']);
          if (ok) {
            req['user'] = user;
          }
        }
      } catch (e) {
        console.log(e);
      }
    }
    next();
  }
}
// [ jwt.verify(token, secretOrPublicKey, [options, callback]) ]
// ex) var decoded = jwt.verify(token, 'shhhhh');
// https://www.npmjs.com/package/jsonwebtoken#jwtverifytoken-secretorpublickey-options-callback

// [ jwt.decode(token [, options]) ]
// 서명이 유효한지 확인하지 않고 디코딩된 페이로드를 반환합니다.
// 주의! 이것은 서명이 유효한지 여부를 확인하지 않습니다. 신뢰할 수 없는 메시지에는 이것을 사용하지 마십시오. 대신 jwt.verify를 사용하고 싶을 것입니다.
// https://www.npmjs.com/package/jsonwebtoken#jwtdecodetoken--options

// 현재 여기서 JwtMiddleware가 하는 역할
// 1. request headers안에 token을 가져온다.
// 2. 가져온 token을 jwt.verify()를 이용해서 토큰을 검증하고 payload를 반환한다.
// 3. 반환한 payload를 이용해서 유저를 찾는다.
// 4. 유저를 찾았다면 찾은 유저의 정보를 req에 다시 넣어 다음 미들웨어에 전달한다.
