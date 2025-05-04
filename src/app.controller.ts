import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {

  @Get()
  getRoot() {
    return {
      message: 'Welcome to the Document Signing API',
      status: 'running',
      timestamp: new Date().toISOString()
    };
  }
}
