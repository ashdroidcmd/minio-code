import {
  Controller,
  Post,
  Param,
  UploadedFile,
  UseInterceptors,
  UploadedFiles,
  Get,
  Res,
  Delete,
  Body,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { UploadFileService } from './upload-file.service';
import { UploadMultipleResponseDto, UploadResponseDto } from './dto/upload.dto';
import {
  DeleteMultipleRequestDto,
  DeleteMultipleResponseDto,
  DeleteResponseDto,
} from './dto/delete.dto';

@Controller('files')
export class UploadController {
  constructor(private readonly uploadFileService: UploadFileService) {}

  // Upload Single File
  @Post('upload/:bucket/:type')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @Param('bucket') bucket: string,
    @Param('type') type: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UploadResponseDto> {
    return this.uploadFileService.uploadFile(bucket, type, file);
  }

  // Upload Multiple File
  @Post('upload-multiple/:bucket/:type')
  @UseInterceptors(FilesInterceptor('files', 30))
  async uploadFiles(
    @Param('bucket') bucket: string,
    @Param('type') type: string,
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<UploadMultipleResponseDto> {
    return this.uploadFileService.uploadFiles(bucket, type, files);
  }

  // Get File
  @Get(':bucket/:folder/:filename')
  async getFile(
    @Param('bucket') bucket: string,
    @Param('folder') folder: string,
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    return this.uploadFileService.getFile(bucket, folder, filename, res);
  }

  // Delete File
  @Delete(':bucket/:folder/:filename')
  async deleteFile(
    @Param('bucket') bucket: string,
    @Param('folder') folder: string,
    @Param('filename') filename: string,
  ): Promise<DeleteResponseDto> {
    return this.uploadFileService.deleteFile(bucket, folder, filename);
  }

  // Delete Multiple
  @Delete('delete-multiple')
  async deleteFiles(
    @Body() dto: DeleteMultipleRequestDto,
  ): Promise<DeleteMultipleResponseDto> {
    return this.uploadFileService.deleteFiles(dto);
  }
}
