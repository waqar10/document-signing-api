import { 
  Controller, 
  Get, 
  Post, 
  UploadedFile, 
  UseInterceptors, 
  Param, 
  Body, 
  Req, 
  Res, 
  UseGuards,
  NotFoundException,
  BadRequestException
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentsService } from './documents.services';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateDocumentDto } from './dto/create-document.dto';
import { PrepareDocumentDto } from './dto/prepare-document.dto';
import { SendDocumentDto } from './dto/send-document.dto';
import { SignDocumentDto } from './dto/sign-document.dto';

@Controller('documents')
@UseGuards(JwtAuthGuard)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(
    @UploadedFile() file: Express.Multer.File,
    @Body() createDocumentDto: CreateDocumentDto,
    @Req() req: Request & { user: { id: string } }
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    console.log('hereeeeeeeeeeeeeeeeeeeeeee')
    console.log('Authenticated user:', req.user); // Debug log
    return this.documentsService.createDocument(
      req.user.id,
      file,
      createDocumentDto,
    );
  }

  @Get(':id')
  async getDocumentMetadata(@Param('id') id: string, @Req() req) {
    return this.documentsService.getDocumentMetadata(id, req.user.id);
  }

  @Get(':id/download')
  async downloadDocument(@Param('id') id: string, @Req() req, @Res() res) {
    const { stream, filename } = await this.documentsService.downloadDocument(
      id,
      req.user.id,
    );
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    stream.pipe(res);
  }

  @Post(':id/prepare')
  async prepareDocument(
    @Param('id') id: string,
    @Body() prepareDocumentDto: PrepareDocumentDto,
    @Req() req,
  ) {
    return this.documentsService.prepareDocument(
      id,
      req.user.id,
      prepareDocumentDto,
    );
  }

  @Post(':id/send')
  async sendDocument(
    @Param('id') id: string,
    @Body() sendDocumentDto: SendDocumentDto,
    @Req() req,
  ) {
    return this.documentsService.sendDocument(id, req.user.id, sendDocumentDto);
  }

  @Get('sign/:token')
  async getDocumentForSigning(@Param('token') token: string) {
    return this.documentsService.getDocumentForSigning(token);
  }

  @Post('sign/:token')
  async submitSignature(
    @Param('token') token: string,
    @Body() signDocumentDto: SignDocumentDto,
  ) {
    // console.log('DTO check', JSON.stringify(signDocumentDto, null, 2));
    // console.log('Is array?', Array.isArray(signDocumentDto.fields));
    return this.documentsService.submitSignature(token, signDocumentDto);
  }

  @Get(':id/final')
  async getFinalDocument(@Param('id') id: string, @Req() req) {
    return this.documentsService.getFinalDocument(id, req.user.id);
  }
}