'use client';

import { useState, useCallback, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Breadcrumb } from '@/components/Breadcrumb';
import { CoreToolArea } from '@/components/CoreToolArea';
import { InlineFeedback } from '@/components/InlineFeedback';
import { UseCaseCards } from '@/components/UseCaseCards';
import { HowToSection } from '@/components/HowToSection';
import { FAQSection } from '@/components/FAQSection';
import { ResultPage } from '@/components/ResultPage';
import { formatFileSize } from '@/lib/pdfMerger';
import { callPluginAPI, analyzeFile } from '@/lib/api';
import type { PDFFile, MergeResult, UseCaseOptions, PluginData } from '@/types';

interface ToolClientProps {
  pluginData: PluginData;
  locale: string;
  categoryId: string;
  slug: string;
}

export function ToolClient({ pluginData, locale, categoryId, slug }: ToolClientProps) {
  const category = categoryId.replace('-tools', '');

  const [files, setFiles] = useState<PDFFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [useCaseOptions, setUseCaseOptions] = useState<UseCaseOptions>({
    optimizeForPrint: false,
    keepBookmarks: false,
    usePageRange: false,
  });
  const [mergeResult, setMergeResult] = useState<MergeResult | null>(null);

  const t = useCallback((key: string): string => {
    if (!pluginData?.ui) return key;
    const keys = key.split('.');
    let value: any = pluginData.ui;
    for (const k of keys) {
      value = value?.[k];
    }
    return typeof value === 'string' ? value : key;
  }, [pluginData]);

  const categoryName = categoryId === 'pdf-tools'
    ? (locale === 'zh' ? 'PDF 工具' : 'PDF Tools')
    : categoryId;

  const breadcrumbItems = [
    { label: t('breadcrumb.home') || 'Home', href: `/${locale}`, external: true },
    { label: categoryName, href: `/${locale}/${categoryId}`, external: true },
    { label: t('breadcrumb.current') || t('h1') },
  ];

  const handleFilesAdded = useCallback(async (newFiles: File[]) => {
    const pdfFiles: PDFFile[] = [];

    for (let i = 0; i < newFiles.length; i++) {
      const file = newFiles[i];
      if (file.type !== 'application/pdf') continue;

      pdfFiles.push({
        id: `${Date.now()}-${i}`,
        file,
        name: file.name,
        pageCount: 0,
        hasBookmarks: false,
        isEncrypted: false,
        pageRange: 'all',
      });
    }

    if (pdfFiles.length === 0) {
      setFeedback({ message: t('feedback.pdfOnly') || 'Please upload PDF files only', type: 'error' });
      return;
    }

    const analyzedFiles = await Promise.all(
      pdfFiles.map(async (pdfFile) => {
        try {
          const info = await analyzeFile(category, slug, pdfFile.file);
          return { ...pdfFile, ...info };
        } catch {
          return pdfFile;
        }
      })
    );

    setFiles((prev) => [...prev, ...analyzedFiles]);
    setFeedback(null);
  }, [t, category, slug]);

  const handleRemoveFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const handleReorderFiles = useCallback((newFiles: PDFFile[]) => {
    setFiles(newFiles);
  }, []);

  const handlePageRangeChange = useCallback((fileId: string, pageRange: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === fileId ? { ...f, pageRange } : f))
    );
  }, []);

  const handleUseCaseOptionsChange = useCallback((options: UseCaseOptions) => {
    setUseCaseOptions(options);

    if (options.optimizeForPrint) {
      setFeedback({ message: t('feedback.printApplied') || 'Print optimization applied', type: 'success' });
    } else if (options.keepBookmarks) {
      setFeedback({ message: t('feedback.bookmarksPreserved') || 'Bookmarks will be preserved', type: 'success' });
    } else if (options.usePageRange) {
      setFeedback({ message: t('feedback.pageRangeEnabled') || 'Page range selection enabled', type: 'info' });
    }

    setTimeout(() => setFeedback(null), 3000);
  }, [t]);

  const handleMerge = useCallback(async () => {
    if (files.length === 0) {
      setFeedback({ message: t('feedback.uploadPdfFirst') || 'Please upload PDF files first', type: 'error' });
      return;
    }

    const hasEncrypted = files.some((f) => f.isEncrypted);
    if (hasEncrypted) {
      setFeedback({ message: t('feedback.cannotMergeEncrypted') || 'Cannot process encrypted files', type: 'error' });
      return;
    }

    setLoading(true);
    setFeedback(null);

    try {
      const blob = await callPluginAPI(category, slug, files, {
        keepBookmarks: useCaseOptions.keepBookmarks,
        optimizeForPrint: useCaseOptions.optimizeForPrint,
        usePageRange: useCaseOptions.usePageRange,
      });

      const totalPages = files.reduce((sum, file) => sum + file.pageCount, 0);
      const timestamp = Date.now();
      const fileName = `${slug}-pdf-tools-${timestamp}.pdf`;

      setMergeResult({
        blob,
        fileName,
        fileSize: formatFileSize(blob.size),
        pageCount: totalPages,
      });

      setFeedback(null);
    } catch (err) {
      setFeedback({
        message: err instanceof Error ? err.message : 'Operation failed. Please try again.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [files, useCaseOptions, t, category, slug]);

  const handleReset = useCallback(() => {
    setMergeResult(null);
    setFiles([]);
    setFeedback(null);
  }, []);

  useEffect(() => {
    if (files.length === 0 && feedback?.type === 'success') {
      setFeedback(null);
    }
  }, [files, feedback]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <Breadcrumb items={breadcrumbItems} />

        <header className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
            <span className="text-2xl">{pluginData.ui?.icon || '📄'}</span>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            {t('h1')}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            {t('subtitle')}
            <span className="block mt-2 text-base text-gray-500">{t('features')}</span>
          </p>
        </header>

        <section className="mb-12">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <div className="border-2 border-dashed border-blue-200 rounded-2xl bg-gradient-to-br from-gray-50 to-white min-h-[400px] flex items-center justify-center p-8">
              {mergeResult ? (
                <ResultPage result={mergeResult} onReset={handleReset} ui={pluginData.ui} />
              ) : (
                <CoreToolArea
                  files={files}
                  onFilesAdded={handleFilesAdded}
                  onRemoveFile={handleRemoveFile}
                  onReorderFiles={handleReorderFiles}
                  onMerge={handleMerge}
                  loading={loading}
                  usePageRange={useCaseOptions.usePageRange}
                  onPageRangeChange={handlePageRangeChange}
                  ui={pluginData.ui}
                />
              )}
            </div>
          </div>
        </section>

        {feedback && <InlineFeedback message={feedback.message} type={feedback.type} />}

        <UseCaseCards options={useCaseOptions} onOptionsChange={handleUseCaseOptionsChange} ui={pluginData.ui} />

        <HowToSection ui={pluginData.ui} />

        <FAQSection ui={pluginData.ui} />

        <Footer ui={pluginData.ui} />
      </div>
    </div>
  );
}
