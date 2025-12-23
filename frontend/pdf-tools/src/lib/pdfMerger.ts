/**
 * Analyze a PDF file to get its metadata
 */
export async function analyzePDF(file: File): Promise<{
  pageCount: number;
  hasBookmarks: boolean;
  isEncrypted: boolean;
}> {
  const formData = new FormData();
  formData.append('file', file);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';
  const response = await fetch(`${API_BASE}/pdf/analyze`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to analyze PDF');
  }

  return response.json();
}

/**
 * Download a blob as a file
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  } else if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  } else {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
}
