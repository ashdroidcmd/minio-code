import shortUUID from 'short-uuid';

// Generates a unique file name using short UUID
export function generateUniqueFileName(originalName: string): string {
  const id = shortUUID.generate();
  return `${id}-${originalName}`;
}
