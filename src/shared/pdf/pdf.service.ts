import { Injectable } from '@nestjs/common';
import { PDFDocument, rgb } from 'pdf-lib';
import { Field } from '../../documents/entities/field.entity';

@Injectable()
export class PdfService {
  async flattenPdf(originalPdf: Buffer, fields: Field[]): Promise<Buffer> {
    const pdfDoc = await PDFDocument.load(originalPdf);
    const pages = pdfDoc.getPages();

    for (const field of fields) {
      if (field.value && field.page <= pages.length) {
        const page = pages[field.page - 1];
        const { x, y, width, height } = field;

        switch (field.type) {
          case 'signature':
            if (field.value.startsWith('data:image')) {
              try {
                const imageBytes = field.value.split(',')[1];
                const image = await pdfDoc.embedPng(
                  Buffer.from(imageBytes, 'base64'),
                );
                page.drawImage(image, {
                  x,
                  y: page.getHeight() - y - height,
                  width,
                  height,
                });
              } catch (err) {
                console.error('Error embedding signature image:', err);
              }
            }
            break;

          case 'text':
          case 'date':
          case 'initials':
            page.drawText(field.value, {
              x,
              y: page.getHeight() - y - height,
              size: height,
              color: rgb(0, 0, 0),
            });
            break;
        }
      }
    }

    return Buffer.from(await pdfDoc.save());
  }
}