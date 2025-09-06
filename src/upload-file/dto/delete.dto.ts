export class DeleteResponseDto {
  message: string;
  bucket: string;
  object: string;
}

export class DeleteFileResultDto {
  filename: string;
  status: 'deleted' | 'error';
  error?: string;
}

export class DeleteMultipleRequestDto {
  bucket: string;
  folder: string;
  filenames: string[];
}

export class DeleteMultipleResponseDto {
  message: string;
  results: DeleteFileResultDto[];
}
