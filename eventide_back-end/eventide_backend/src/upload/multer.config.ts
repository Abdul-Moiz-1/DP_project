// multer.config.ts
import { diskStorage } from 'multer';
import { extname } from 'path';

export const multerConfig = {
  storage: diskStorage({
    destination: './uploads', // Directory where files will be stored
    filename: (req, file, callback) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const fileExt = extname(file.originalname);
      const fileName = `${file.fieldname}-${uniqueSuffix}${fileExt}`;
      console.log(`[Multer] Generating filename for ${file.originalname}:`, fileName);
      callback(null, fileName);
    },
  }),

  
};

export const fileFilter = (req, file, callback) => {
  console.log(`[Multer] File filter - originalname: ${file.originalname}, mimetype: ${file.mimetype}`);
  // Allow only image files
  if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
    console.log(`[Multer] File rejected - not an image`);
    return callback(new Error('Only image files are allowed'), false);
  }
  console.log(`[Multer] File accepted`);
  callback(null, true);
};



