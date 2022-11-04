import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Welcome to the API REST for new courses functionality by Agustín Prado.';
  }
}
