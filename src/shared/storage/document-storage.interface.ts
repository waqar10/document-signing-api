import { Readable } from 'stream';

export interface DocumentStorageService {
  upload(file: Express.Multer.File): Promise<string>;
  uploadBuffer(buffer: Buffer, filename: string): Promise<string>;
  download(filePath: string): Promise<Readable>;
}