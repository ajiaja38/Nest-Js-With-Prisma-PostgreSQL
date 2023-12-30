import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { jwtConstant } from '../constant';
import { JwtPayloadInterface } from '../interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstant.accessTokenSecret,
    });
  }

  async validate(payload: JwtPayloadInterface) {
    if (!payload) {
      throw new UnauthorizedException('Access Denied');
    }

    return payload;
  }
}
