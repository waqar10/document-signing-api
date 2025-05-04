import { IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class FieldValueDto {
  @ApiProperty({ example: 'field-id-123' })
  @IsString()
  id: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  value: string;
}

export class SignDocumentDto {
  @ApiProperty({ type: [FieldValueDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FieldValueDto)
  fields: FieldValueDto[];
}




// export class FieldValueDto {
//     id: string;
//     value: string;
//   }
  
//   export class SignDocumentDto {
//     fields: FieldValueDto[];
//   }