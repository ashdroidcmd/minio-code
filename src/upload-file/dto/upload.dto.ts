export class UploadFileInfoDto {
  original: string;
  storedAs: string;
  type: string;
  url: string;
}

export class UploadResponseDto {
  message: string;
  bucket: string;
  // single upload result
  original: string;
  storedAs: string;
  type: string;
  url: string;
}

export class UploadMultipleResponseDto {
  message: string;
  bucket: string;
  // multiple upload results
  files: UploadFileInfoDto[];
}
