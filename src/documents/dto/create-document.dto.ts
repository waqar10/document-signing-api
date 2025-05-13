import { IsString, IsNotEmpty } from 'class-validator';

export class CreateDocumentDto {
@IsString()
@IsNotEmpty()
    title: string;
}