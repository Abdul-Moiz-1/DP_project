import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import { DataSource } from 'typeorm';

async function runEnumMigrations() {
  if (!process.env.DATABASE_URL) return;
  const ds = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  try {
    await ds.initialize();
    const enumExists = await ds.query(
      `SELECT 1 FROM pg_type WHERE typname = 'user_role_enum'`,
    );
    if (enumExists.length > 0) {
      const values: { enumlabel: string }[] = await ds.query(
        `SELECT enumlabel FROM pg_enum WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role_enum')`,
      );
      const labels = values.map((v) => v.enumlabel);
      if (labels.includes('ATTENDEE') && !labels.includes('USER')) {
        await ds.query(`ALTER TYPE user_role_enum RENAME VALUE 'ATTENDEE' TO 'USER'`);
        console.log('[Migration] Renamed enum value ATTENDEE -> USER');
      }
      if (!labels.includes('ADMIN')) {
        await ds.query(`ALTER TYPE user_role_enum ADD VALUE IF NOT EXISTS 'ADMIN'`);
        console.log('[Migration] Added enum value ADMIN');
      }
    }
    const eventEnumExists = await ds.query(
      `SELECT 1 FROM pg_type WHERE typname = 'event_status_enum'`,
    );
    if (eventEnumExists.length === 0) {
      console.log('[Migration] event_status_enum will be created by TypeORM synchronize');
    }
  } catch (err) {
    console.warn('[Migration] Pre-startup migration warning:', err.message);
  } finally {
    if (ds.isInitialized) await ds.destroy();
  }
}

async function bootstrap() {
  await runEnumMigrations();
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // app.useStaticAssets(join(__dirname, '..', 'uploads'));


 
  app.enableCors({
    origin: 'http://localhost:5173', // your frontend URL
    credentials: true, // needed for cookies
  });
   app.use(cookieParser());

   // Serve static assets
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
  prefix: "/uploads/", // for global directory like /backend/aladin/uploads
  });

  console.log('Serving uploads from:', join(process.cwd(), 'uploads'));



  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle("Eventide API")
    .setDescription("API for the eventide event management platform")
    .setVersion('1.0')
    .addBearerAuth()
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api', app, document);



  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  await app.listen(3000);
  // console.log(process.env.DATABASE_URL);
  console.log(`Server running on localhost:3000`)
  console.log("Swagger docs available at localhost:3000/api")
}
bootstrap();
