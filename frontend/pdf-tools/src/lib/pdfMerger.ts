import { PDFDocument } from 'pdf-lib';

/**
 * Analyze a PDF file to get its metadata
 */
export async function analyzePDF(file: File): Promise<{
  pageCount: number;
  hasBookmarks: boolean;
  isEncrypted: boolean;
}> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer, {
      ignoreEncryption: true,
    });

    const pageCount = pdf.getPageCount();
    const hasBookmarks = false;

    return {
      pageCount,
      hasBookmarks,
      isEncrypted: false,
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes('encrypted')) {
      return {
        pageCount: 0,
        hasBookmarks: false,
        isEncrypted: true,
      };
    }
    throw error;
  }
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
