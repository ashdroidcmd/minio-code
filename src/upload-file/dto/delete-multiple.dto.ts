export class DeleteMultipleRequestDto {
  bucket: string;
  folder: string;
  filenames: string[];
}

export class DeleteFileResultDto {
  filename: string;
  status: 'deleted' | 'error';
  error?: string;
}

export class DeleteMultipleResponseDto {
  message: string;
  results: DeleteFileResultDto[];
}
