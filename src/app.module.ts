import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UploadFileModule } from './upload-file/upload-file.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), UploadFileModule],
})
export class AppModule {}
