/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Client } from 'minio';
import {
  UploadMultipleResponseDto,
  UploadResponseDto,
} from './dto/upload-response.dto';
import { UploadFileInfoDto } from './dto/upload-file-info.dto';
import { DeleteResponseDto } from './dto/delete-response.dto';
import {
  DeleteFileResultDto,
  DeleteMultipleRequestDto,
  DeleteMultipleResponseDto,
} from './dto/delete-multiple.dto';

@Injectable()
export class UploadFileService {
  private readonly minioClient: Client;

  constructor() {
    this.minioClient = new Client({
      endPoint: process.env.ENDPOINT ?? 'localhost',
      port: parseInt(process.env.MINIO_PORT ?? '9000', 10),
      useSSL: process.env.MINIO_SSL === 'true',
      accessKey: process.env.ACCESS_KEY ?? 'minio',
      secretKey: process.env.SECRET_KEY ?? 'minio123',
    });
  }

  // Generate Unique File Name
  private generateUniqueFileName(originalName: string): string {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const dateTime = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
      now.getDate(),
    )}-${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
    return `${dateTime}-${originalName}`;
  }

  // Upload Single File
  async uploadFile(
    bucket: string,
    type: string,
    file: Express.Multer.File,
  ): Promise<UploadResponseDto> {
    const buffer = file.buffer;
    const uniqueFileName = this.generateUniqueFileName(file.originalname);

    await this.minioClient.putObject(
      bucket,
      `${type}/${uniqueFileName}`,
      buffer,
      buffer.length,
      { 'Content-Type': file.mimetype },
    );

    return {
      message: '✅ File uploaded successfully',
      bucket,
      original: file.originalname,
      storedAs: uniqueFileName,
      type: file.mimetype,
      url: `https://${process.env.ENDPOINT}/${bucket}/${type}/${uniqueFileName}`,
    };
  }

  // Upload Multiple File
  async uploadFiles(
    bucket: string,
    type: string,
    files: Express.Multer.File[],
  ): Promise<UploadMultipleResponseDto> {
    // 👇 tell TS what this is
    const uploadedFiles: UploadFileInfoDto[] = [];

    for (const file of files) {
      const buffer = file.buffer;
      const uniqueFileName = this.generateUniqueFileName(file.originalname);

      await this.minioClient.putObject(
        bucket,
        `${type}/${uniqueFileName}`,
        buffer,
        buffer.length,
        { 'Content-Type': file.mimetype },
      );

      uploadedFiles.push({
        original: file.originalname,
        storedAs: uniqueFileName,
        type: file.mimetype,
        url: `https://${process.env.ENDPOINT}/${bucket}/${type}/${uniqueFileName}`,
      });
    }

    return {
      message: '✅ Files uploaded successfully',
      bucket,
      files: uploadedFiles,
    };
  }

  // Get Files
  async getFile(bucket: string, folder: string, filename: string, res: any) {
    if (!bucket || !folder || !filename) {
      throw new BadRequestException('Missing required parameters');
    }

    const objectName = `${folder}/${filename}`;

    try {
      const dataStream = await this.minioClient.getObject(bucket, objectName);

      // Pipe the stream directly to response
      dataStream.pipe(res);

      dataStream.on('error', (err) => {
        console.error('Stream error:', err);
        throw new InternalServerErrorException('Error streaming file');
      });
    } catch (err) {
      console.error('MinIO error:', err);
      throw new InternalServerErrorException(err.message);
    }
  }

  // Delete File
  async deleteFile(
    bucket: string,
    folder: string,
    filename: string,
  ): Promise<DeleteResponseDto> {
    if (!bucket || !folder || !filename) {
      throw new BadRequestException('Missing required parameters');
    }

    const objectName = `${folder}/${filename}`;

    try {
      await this.minioClient.removeObject(bucket, objectName);

      return {
        message: '🗑️ File deleted successfully',
        bucket,
        object: objectName,
      };
    } catch (err) {
      console.error('❌ Delete error:', err);
      throw new InternalServerErrorException('Delete failed: ' + err.message);
    }
  }

  // Delete Multiple Files
  async deleteFiles(
    dto: DeleteMultipleRequestDto,
  ): Promise<DeleteMultipleResponseDto> {
    const { bucket, folder, filenames } = dto;

    if (!bucket || !folder || !filenames || !Array.isArray(filenames)) {
      throw new BadRequestException(
        'bucket, folder, and filenames[] are required',
      );
    }

    const results: DeleteFileResultDto[] = [];

    for (const filename of filenames) {
      const objectName = `${folder}/${filename}`;
      try {
        await this.minioClient.removeObject(bucket, objectName);
        results.push({ filename, status: 'deleted' });
      } catch (err) {
        console.error(`❌ Error deleting: ${filename}`, err.message);
        results.push({ filename, status: 'error', error: err.message });
      }
    }

    return {
      message: '🗑️ Delete operation completed',
      results,
    };
  }
}
