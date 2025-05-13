import {
    Inject,
    Injectable,
    NotFoundException,
    BadRequestException,
  } from '@nestjs/common';
  import { Readable } from 'stream';
  import { InjectRepository } from '@nestjs/typeorm';
  import { Repository } from 'typeorm';
  import { Document } from './entities/document.entity';
  import { Signer } from './entities/signer.entity';
  import { Field } from './entities/field.entity';
  import { DocumentStorageService } from '../shared/storage/document-storage.interface';
  import { PdfService } from '../shared/pdf/pdf.service';
  import { v4 as uuidv4 } from 'uuid';
  import { CreateDocumentDto } from './dto/create-document.dto';
  import { PrepareDocumentDto } from './dto/prepare-document.dto';
  import { SendDocumentDto } from './dto/send-document.dto';
  import { SignDocumentDto } from './dto/sign-document.dto';
import { User } from 'src/users/entities/user.entity';
  
  @Injectable()
  export class DocumentsService {
    constructor(
      @InjectRepository(Document)
      private documentsRepository: Repository<Document>,
      @InjectRepository(Signer)
      private signersRepository: Repository<Signer>,
      @InjectRepository(Field)
      private fieldsRepository: Repository<Field>,
      @Inject('DocumentStorageService')
      private storageService: DocumentStorageService,
      private pdfService: PdfService,
    ) {}
  
    async createDocument(
      userId: string,
      file: Express.Multer.File,
      createDocumentDto: CreateDocumentDto,
    ) {
      const document = new Document();
    //   document.userId = userId;
      document.title = createDocumentDto.title;
      document.originalFilename = file.originalname;
      document.user = { id: userId } as User;
      document.pdfData = file.buffer;

      // const storagePath = await this.storageService.upload(file);
      // document.storagePath = storagePath;
  
      const docs = await this.documentsRepository.save(document);
      return {
        id: docs.id,
        title: docs.title,
        status: docs.status,
        originalFilename: docs.originalFilename,
        createdAt: docs.createdAt,
        updatedAt: docs.updatedAt,
      };
      
    }
  
    async getDocumentMetadata(id: string, userId: string) {
      const document = await this.documentsRepository.findOne({
        where: { id, userId },
        relations: ['signers', 'fields'],
      });
      if (!document) {
        throw new NotFoundException('Document not found');
      }
      return document;
    }
  
    async downloadDocument(id: string, userId: string) {
      const document = await this.documentsRepository.findOne({
        where: { id, userId },
      });
      if (!document || !document.pdfData) {
        throw new NotFoundException('Document not found');
      }
  
      const stream = await Readable.from(document.pdfData); 
      return { stream, filename: document.originalFilename };
    }
  
    // async prepareDocument(
    //   documentId: string,
    //   userId: string,
    //   prepareDocumentDto: PrepareDocumentDto,
    // ) {
    //   const document = await this.documentsRepository.findOne({
    //     where: { id: documentId, userId },
    //   });
    //   if (!document) {
    //     throw new NotFoundException('Document not found');
    //   }
  
    //   await this.documentsRepository.manager.transaction(async (manager) => {
    //     await manager.delete(Signer, { documentId });
    //     await manager.delete(Field, { documentId });
  
    //     const signers = prepareDocumentDto.signers.map((signerDto) => {
    //       const signer = new Signer();
    //       signer.documentId = documentId;
    //       signer.name = signerDto.name;
    //       signer.email = signerDto.email;
    //       signer.token = uuidv4();
    //       signer.order = signerDto.order;
    //       return signer;
    //     });
    //     await manager.save(Signer, signers);
  
    //     const fields = prepareDocumentDto.fields.map((fieldDto) => {
    //       const field = new Field();
    //       field.documentId = documentId;
    //       field.type = fieldDto.type;
    //       field.page = fieldDto.page;
    //       field.x = fieldDto.x;
    //       field.y = fieldDto.y;
    //       field.width = fieldDto.width;
    //       field.height = fieldDto.height;
    //       field.signerId = fieldDto.signerId;
    //       field.required = fieldDto.required;
    //       return field;
    //     });
    //     await manager.save(Field, fields);
    //   });
  
    //   return this.getDocumentMetadata(documentId, userId);
    // }
    async prepareDocument(
      documentId: string,
      userId: string,
      prepareDocumentDto: PrepareDocumentDto,
    ) {
      const document = await this.documentsRepository.findOne({
        where: { id: documentId, userId },
      });
      if (!document) {
        throw new NotFoundException('Document not found');
      }
    
      await this.documentsRepository.manager.transaction(async (manager) => {
        await manager.delete(Field, { documentId });
        await manager.delete(Signer, { documentId });
    
        // Save signers first
        const signerEntities = prepareDocumentDto.signers.map((signerDto) => {
          const signer = new Signer();
          signer.documentId = documentId;
          signer.name = signerDto.name;
          signer.email = signerDto.email;
          signer.token = uuidv4();
          signer.order = signerDto.order;
          return signer;
        });
        const savedSigners = await manager.save(Signer, signerEntities);
    
        // Map signerId from something reliable (like `order` or `email`)
        const signerMap = new Map<number, string>(); // or Map<string, string> if using email
        for (const signer of savedSigners) {
          signerMap.set(signer.order, signer.id);
        }
    
        const fields = prepareDocumentDto.fields.map((fieldDto) => {
          const field = new Field();
          field.documentId = documentId;
          field.type = fieldDto.type;
          field.page = fieldDto.page;
          field.x = fieldDto.x;
          field.y = fieldDto.y;
          field.width = fieldDto.width;
          field.height = fieldDto.height;
          field.required = fieldDto.required;
    
          const signerId = signerMap.get(fieldDto.signerOrder);
          if (!signerId) {
            throw new BadRequestException(
              `No matching signer found for order ${fieldDto.signerOrder}`,
            );
          }
          field.signerId = signerId;
          return field;
        });
    
        await manager.save(Field, fields);
      });
    
      return this.getDocumentMetadata(documentId, userId);
    }
    
  
    async sendDocument(
      documentId: string,
      userId: string,
      sendDocumentDto: SendDocumentDto,
    ) {
      const document = await this.documentsRepository.findOne({
        where: { id: documentId, userId },
        relations: ['signers'],
      });
      if (!document) {
        throw new NotFoundException('Document not found');
      }
  
      document.status = 'sent';
      await this.documentsRepository.save(document);
  
      document.signers.forEach((signer) => {
        const signUrl = `${sendDocumentDto.baseUrl}/sign/${signer.token}`;
        console.log(`Sending email to ${signer.email} with sign URL: ${signUrl}`);
      });
  
      return document;
    }
  
    async getDocumentForSigning(token: string) {
      const signer = await this.signersRepository.findOne({
        where: { token },
        relations: ['document', 'fields'],
      });
      if (!signer) {
        throw new NotFoundException('Signer not found');
      }
  
      // const stream = await this.storageService.download(signer.document.storagePath);
      const pdfBuffer = await signer.document.pdfData;
  
      return {
        document: {
          id: signer.document.id,
          title: signer.document.title,
          pdfBase64: pdfBuffer.toString('base64'),
        },
        fields: signer.fields,
      };
    }
  
    async submitSignature(token: string, signDocumentDto: SignDocumentDto) {
      // if (!Array.isArray(signDocumentDto.fields)) {
      //   throw new BadRequestException('Expected fields to be an array');
      // }
      
      const signer = await this.signersRepository.findOne({
        where: { token },
        relations: ['document', 'fields'],
      });
      if (!signer) {
        throw new NotFoundException('Signer not found');
      }
      // console.log('fieldss', signDocumentDto.fields.map((field) => field.id));
      await this.documentsRepository.manager.transaction(async (manager) => {
        for (const fieldData of signDocumentDto.fields) {
          const field = signer.fields.find((f) => f.id === fieldData.id);
          if (field) {
            field.value = fieldData.value;
            field.signedAt = new Date();
            await manager.save(Field, field);
          }
        }
        
        const allRequiredSigned = signer.fields.every(
          (f) => !f.required || (f.required && f.value),
        );
      
          if (allRequiredSigned) {
            signer.status = 'completed';
            await manager.save(Signer, signer);
      
            const allSigners = await manager.find(Signer, {
              where: { documentId: signer.documentId },
            });
            const allCompleted = allSigners.every((s) => s.status === 'completed');
      
            if (allCompleted) {
              const document = await manager.findOne(Document, {
                where: { id: signer.documentId },
                relations: ['fields'],
              });
              if (!document) {
                throw new NotFoundException('Document not found');
              }

              const flattenedPdf = await this.pdfService.flattenPdf(
                document.pdfData,
                document.fields,
              );

              document.status = 'completed';
              document.flattenedPdfData = flattenedPdf;
              await manager.save(Document, document);
            }
          }
        });
      
        return { success: true };
      }
  
    async getFinalDocument(documentId: string, userId: string) {
      const document = await this.documentsRepository.findOne({
        where: { id: documentId, userId },
        relations: ['signers', 'fields'],
      });
      if (!document) {
        throw new NotFoundException('Document not found');
      }
  
      if (document.status !== 'completed') {
        throw new BadRequestException('Document not fully signed yet');
      }
  
      // const originalStream = await this.storageService.download(
      //   document.storagePath,
      // );
      // const originalBuffer = await this.streamToBuffer(originalStream);
      // const flattenedPdf = await this.pdfService.flattenPdf(
      //   originalBuffer,
      //   document.fields,
      // );
  
      // const flattenedPath = await this.storageService.uploadBuffer(
      //   flattenedPdf,
      //   `flattened_${documentId}.pdf`,
      // );
      // document.flattenedPath = flattenedPath;
      // await this.documentsRepository.save(document);
  
      return {
        document,
        flattenedPdf: document.flattenedPdfData.toString('base64'),
      };
    }
  
    // private async streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
    //   return new Promise((resolve, reject) => {
    //     const chunks: Buffer[] = [];
    //     stream.on('data', (chunk) => chunks.push(chunk));
    //     stream.on('error', reject);
    //     stream.on('end', () => resolve(Buffer.concat(chunks)));
    //   });
    // }
  }