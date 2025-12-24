import type { PDFFile, MergeOptions, PluginData } from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

export async function fetchPluginConfig(slug: string, lang: string): Promise<PluginData> {
  const response = await fetch(`${API_BASE}/plugins/${slug}?lang=${lang}`);
  if (!response.ok) {
    throw new Error('Failed to fetch plugin config');
  }
  return response.json();
}

export async function fetchAllPlugins(lang: string): Promise<any[]> {
  const response = await fetch(`${API_BASE}/plugins?lang=${lang}`);
  if (!response.ok) {
    throw new Error('Failed to fetch plugins');
  }
  return response.json();
}

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
