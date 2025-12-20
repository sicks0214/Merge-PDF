import { PDFDocument } from 'pdf-lib';
import type { PDFFile, MergeOptions } from '@/types';

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

    // pdf-lib doesn't directly support reading bookmarks,
    // but we can check if the document has an outline
    // For now, we'll set this to false as pdf-lib has limited bookmark support
    const hasBookmarks = false;

    return {
      pageCount,
      hasBookmarks,
      isEncrypted: false,
    };
  } catch (error) {
    // If loading fails, the PDF might be encrypted
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
 * Parse page range string into array of page indices (0-based)
 */
export function parsePageRange(range: string, totalPages: number): number[] {
  if (range === 'all' || range === '') {
    return Array.from({ length: totalPages }, (_, i) => i);
  }

  const pages: number[] = [];
  const parts = range.split(',').map(p => p.trim());

  for (const part of parts) {
    if (part.includes('-')) {
      const [start, end] = part.split('-').map(Number);
      for (let i = start - 1; i < Math.min(end, totalPages); i++) {
        if (i >= 0 && !pages.includes(i)) {
          pages.push(i);
        }
      }
    } else {
      const page = parseInt(part, 10) - 1;
      if (page >= 0 && page < totalPages && !pages.includes(page)) {
        pages.push(page);
      }
    }
  }

  return pages.sort((a, b) => a - b);
}

/**
 * Validate page range format
 */
export function validatePageRange(range: string): boolean {
  if (range === 'all' || range === '') return true;
  const pattern = /^(\d+(-\d+)?)(,\s*\d+(-\d+)?)*$/;
  return pattern.test(range);
}

/**
 * Merge multiple PDF files into one
 */
export async function mergePDFs(
  files: PDFFile[],
  options: MergeOptions
): Promise<Uint8Array> {
  const mergedPdf = await PDFDocument.create();
  let totalPagesAdded = 0;

  for (const pdfFile of files) {
    try {
      const arrayBuffer = await pdfFile.file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);

      // Determine which pages to copy
      const pageRange = options.usePageRange ? pdfFile.pageRange : 'all';
      const pageIndices = parsePageRange(pageRange, pdf.getPageCount());

      if (pageIndices.length === 0) {
        continue;
      }

      // Copy the selected pages
      const copiedPages = await mergedPdf.copyPages(pdf, pageIndices);

      for (const page of copiedPages) {
        mergedPdf.addPage(page);
        totalPagesAdded++;
      }
    } catch (error) {
      console.error(`Error processing file ${pdfFile.name}:`, error);
      throw new Error(`Failed to process file: ${pdfFile.name}`);
    }
  }

  if (totalPagesAdded === 0) {
    throw new Error('No pages to merge');
  }

  // Note: pdf-lib has limited support for bookmarks
  // The keepBookmarks option would require additional implementation
  // with a more feature-rich library like pdf.js

  return mergedPdf.save();
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
