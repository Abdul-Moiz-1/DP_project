import { Controller, Post, Req, UploadedFile, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { FileUploadInterceptor } from './file-upload.interceptor';
import { UploadService } from './upload.service';
import { FilesValidationPipe } from 'src/common/pipes/multiple-files-validation.pipe';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('upload')
export class UploadController {

    constructor(private readonly uploadService: UploadService){}


  @Post('single')
  @UseInterceptors(FileUploadInterceptor)
  uploadSingle(
    @Req() req: any,
    @UploadedFile()
    file: Express.Multer.File,
  ) {
    return this.uploadService.handleSingle(file);
  }


  @Post('many')
  @UseInterceptors(FilesInterceptor('files', 5))  // up to 5 files under “files”
  uploadMany(
    @Req() req: any,
    @UploadedFiles(
      new FilesValidationPipe({
        maxSize: 2 * 1024 * 1024,
        allowedTypes: ['image/png', 'image/jpeg'],
      }),
    )
    files: Express.Multer.File[],
  ) {
    return this.uploadService.uploadMany(files);
  }
}
