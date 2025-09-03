import { Module } from '@nestjs/common';
import { UploadController } from './upload-file.controller';
import { UploadFileService } from './upload-file.service';

@Module({
  controllers: [UploadController],
  providers: [UploadFileService],
})
export class UploadFileModule {}
