import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LocalStorageService } from './storage/local-storage.service';
import { PdfService } from './pdf/pdf.service';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'DocumentStorageService',
      useClass: LocalStorageService,
    },
    PdfService,
  ],
  exports: ['DocumentStorageService', PdfService],
})
export class SharedModule {}