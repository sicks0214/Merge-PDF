import type { PDFFile, MergeOptions } from '@/types';

// 生产环境通过 Nginx 代理，开发环境直接访问后端
const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

export async function mergePDFsAPI(
  files: PDFFile[],
  options: MergeOptions
): Promise<Blob> {
  const formData = new FormData();

  files.forEach((pdfFile) => {
    formData.append('files', pdfFile.file);
  });

  formData.append('options', JSON.stringify(options));

  if (options.usePageRange) {
    const pageRanges = files.map(f => f.pageRange || 'all');
    formData.append('pageRanges', JSON.stringify(pageRanges));
  }

  const response = await fetch(`${API_BASE}/pdf/merge`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Merge failed' }));
    throw new Error(error.message || 'Merge failed');
  }

  return response.blob();
}
