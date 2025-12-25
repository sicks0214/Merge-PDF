import type { PDFFile, MergeOptions, PluginData, PluginListItem } from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

export async function fetchPluginConfig(slug: string, lang: string): Promise<PluginData> {
  const response = await fetch(`${API_BASE}/plugins/${slug}?lang=${lang}`);
  if (!response.ok) {
    throw new Error('Failed to fetch plugin config');
  }
  return response.json();
}

export async function fetchAllPlugins(lang: string): Promise<PluginListItem[]> {
  const response = await fetch(`${API_BASE}/plugins?lang=${lang}`);
  if (!response.ok) {
    throw new Error('Failed to fetch plugins');
  }
  return response.json();
}

export async function callPluginAPI(
  category: string,
  slug: string,
  files: PDFFile[],
  options: Record<string, any>
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

  const response = await fetch(`${API_BASE}/${category}/${slug}`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Operation failed' }));
    throw new Error(error.message || 'Operation failed');
  }

  return response.blob();
}

export async function analyzeFile(
  category: string,
  slug: string,
  file: File
): Promise<{ pageCount: number; hasBookmarks: boolean; isEncrypted: boolean }> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE}/${category}/${slug}/analyze`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Analysis failed');
  }

  return response.json();
}

// Legacy function for backward compatibility
export async function mergePDFsAPI(
  files: PDFFile[],
  options: MergeOptions
): Promise<Blob> {
  return callPluginAPI('pdf', 'merge', files, options);
}
