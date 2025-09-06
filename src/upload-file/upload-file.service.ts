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
  UploadFileInfoDto,
} from './dto/upload.dto';
import {
  DeleteFileResultDto,
  DeleteMultipleRequestDto,
  DeleteMultipleResponseDto,
  DeleteResponseDto,
} from './dto/delete.dto';
import { generateUniqueFileName } from '../helpers/filename.helper';

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

  // Upload Single File
  async uploadFile(
    bucket: string,
    type: string,
    file: Express.Multer.File,
  ): Promise<UploadResponseDto> {
    const buffer = file.buffer;
    const uniqueFileName = generateUniqueFileName(file.originalname);

    try {
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
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to upload file: ${error.message}`,
      );
    }
  }

  // Upload Multiple Files
  async uploadFiles(
    bucket: string,
    type: string,
    files: Express.Multer.File[],
  ): Promise<UploadMultipleResponseDto> {
    const uploadedFiles: UploadFileInfoDto[] = [];

    for (const file of files) {
      const buffer = file.buffer;
      const uniqueFileName = generateUniqueFileName(file.originalname);

      try {
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
      } catch (error) {
        throw new InternalServerErrorException(
          `Failed to upload ${file.originalname}: ${error.message}`,
        );
      }
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

      dataStream.on('error', (error) => {
        console.error('Stream error:', error);
        throw new InternalServerErrorException('Error streaming file');
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
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
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to upload ${error.message}`,
      );
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
      } catch (error) {
        throw new InternalServerErrorException(
          `Failed to upload ${error.message}`,
        );
      }
    }

    return {
      message: '🗑️ Delete operation completed',
      results,
    };
  }
}
