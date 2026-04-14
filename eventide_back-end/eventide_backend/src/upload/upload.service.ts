import { BadRequestException, Injectable } from '@nestjs/common';
import path, { join } from 'path';

@Injectable()
export class UploadService {
  private getImageUrl(filename: string, req?: any): string {
    let baseUrl = '';
    
    // Try to get the protocol and host from request if available
    if (req) {
      const protocol = req.protocol || 'http';
      const host = req.get('host') || 'localhost:3000';
      baseUrl = `${protocol}://${host}`;
    } else {
      // Fallback to environment variable or default
      baseUrl = process.env.APP_BASE_URL || 'http://localhost:3000';
    }
    
    // Ensure baseUrl has protocol
    if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
      baseUrl = `http://${baseUrl}`;
    }
    
    return `${baseUrl}/uploads/${filename}`;
  }

  handleSingle(file: Express.Multer.File, req?: any) {
    if (!file) {
      throw new BadRequestException('File not found');
    }
    console.log(`File ${file.filename} received`);
    
    const imageUrl = this.getImageUrl(file.filename, req);
    console.log(`Generated image URL: ${imageUrl}`);

    return { file, imageUrl };
  }

  uploadMany(files: Express.Multer.File[], req?: any) {
    if (!files || !Array.isArray(files)) {
      throw new BadRequestException('File(s) not found');
    }

    console.log(`Uploading ${files.length} files`);
    let uploadedFiles: string[] = []
    for (const newFile of files) {
      // Get filename from either filename property or extract from path
      let filename = newFile.filename;
      if (!filename && newFile.path) {
        const pathParts = newFile.path.split(/[\\/]/);
        filename = pathParts[pathParts.length - 1];
      }
      
      console.log(`  Processing file:`, { originalname: newFile.originalname, filename, path: newFile.path });
      
      if (!filename) {
        throw new BadRequestException(`File ${newFile.originalname} has no filename property`);
      }
      
      const url = this.getImageUrl(filename, req);
      console.log(`  - ${newFile.originalname} → ${url}`);
      uploadedFiles.push(url);
    }

    console.log(`Upload complete. Generated ${uploadedFiles.length} URLs`);
    return uploadedFiles;
  }

  getFilePath(filename: string): string {
    return join(process.cwd(), 'uploads', filename);
  }

  getPublicFilePath(filename: string): string {
    return `/uploads/${filename}`;
  }
}
