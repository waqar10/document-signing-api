import { IsString, IsEmail, IsInt, IsArray, IsIn, IsNumber, IsBoolean, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class SignerDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  order: number;
}

export class FieldDto {
  @ApiProperty({ enum: ['signature', 'date', 'initials', 'text'], example: 'signature' })
  @IsIn(['signature', 'date', 'initials', 'text'])
  type: 'signature' | 'date' | 'initials' | 'text';

  @ApiProperty({ example: 1 })
  @IsInt()
  page: number;

  @ApiProperty({ example: 100 })
  @IsNumber()
  x: number;

  @ApiProperty({ example: 150 })
  @IsNumber()
  y: number;

  @ApiProperty({ example: 200 })
  @IsNumber()
  width: number;

  @ApiProperty({ example: 50 })
  @IsNumber()
  height: number;

  @IsNumber()
  signerOrder: number;

  @ApiProperty({ example: true })
  @IsBoolean()
  required: boolean;
}

export class PrepareDocumentDto {
  @ApiProperty({ type: [SignerDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SignerDto)
  signers: SignerDto[];

  @ApiProperty({ type: [FieldDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FieldDto)
  fields: FieldDto[];
}





// export class SignerDto {
//     name: string;
//     email: string;
//     order: number;
//   }
  
//   export class FieldDto {
//     type: 'signature' | 'date' | 'initials' | 'text';
//     page: number;
//     x: number;
//     y: number;
//     width: number;
//     height: number;
//     signerId: string;
//     required: boolean;
//   }
  
//   export class PrepareDocumentDto {
//     signers: SignerDto[];
//     fields: FieldDto[];
//   }