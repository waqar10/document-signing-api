import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { DocumentStorageService } from './document-storage.interface';
import { Readable } from 'stream';

@Injectable()
export class LocalStorageService implements DocumentStorageService {
  constructor(private configService: ConfigService) {}
  
  private getStoragePath() {
    return this.configService.get('STORAGE_PATH') || './storage';
  }

  async upload(file: Express.Multer.File): Promise<string> {
    const storagePath = this.getStoragePath();
    const filename = `${uuidv4()}.pdf`;
    const fullPath = path.join(storagePath, filename);
    
    await fs.promises.mkdir(storagePath, { recursive: true });
    await fs.promises.writeFile(fullPath, file.buffer);
    
    return filename;
  }

  async uploadBuffer(buffer: Buffer, filename: string): Promise<string> {
    const storagePath = this.getStoragePath();
    const fullPath = path.join(storagePath, filename);
    
    await fs.promises.mkdir(storagePath, { recursive: true });
    await fs.promises.writeFile(fullPath, buffer);
    
    return filename;
  }

  async download(filePath: string): Promise<Readable> {
    const storagePath = this.getStoragePath();
    const fullPath = path.join(storagePath, filePath);
    
    if (!fs.existsSync(fullPath)) {
      throw new NotFoundException('File not found');
    }
    
    return fs.createReadStream(fullPath);
  }
}