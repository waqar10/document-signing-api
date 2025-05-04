import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendDocumentDto {
  @ApiProperty({ example: 'https://example.com' })
  @IsString()
  baseUrl: string;
}



// export class SendDocumentDto {
//     baseUrl: string;
//   }