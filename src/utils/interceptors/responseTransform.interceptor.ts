import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        const response = {
          code: context.switchToHttp().getResponse().statusCode,
          status: true,
          message: 'Berhasil memuat permintaan',
        };

        if (data) {
          if (Array.isArray(data)) {
            response['data'] = data;
          } else if (data.totalPages || data.page || data.totalData) {
            response['totalPages'] = data.totalPages;
            response['page'] = data.page;
            response['totalData'] = data.totalData;
            response['data'] = data.data;
          } else {
            response['data'] = data;
          }
        }

        return response;
      }),
    );
  }
}
