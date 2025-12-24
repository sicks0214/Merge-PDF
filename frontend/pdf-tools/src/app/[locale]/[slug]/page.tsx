'use client';

import { useState, useCallback, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Breadcrumb } from '@/components/Breadcrumb';
import { CoreToolArea } from '@/components/CoreToolArea';
import { InlineFeedback } from '@/components/InlineFeedback';
import { UseCaseCards } from '@/components/UseCaseCards';
import { HowToSection } from '@/components/HowToSection';
import { FAQSection } from '@/components/FAQSection';
import { ResultPage } from '@/components/ResultPage';
import { analyzePDF, formatFileSize } from '@/lib/pdfMerger';
import { mergePDFsAPI, fetchPluginConfig } from '@/lib/api';
import type { PDFFile, MergeResult, UseCaseOptions, PluginData } from '@/types';

export default function ToolPage() {
  const params = useParams();
  const locale = params.locale as string;
  const slug = params.slug as string;

  const [pluginData, setPluginData] = useState<PluginData | null>(null);
  const [files, setFiles] = useState<PDFFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [useCaseOptions, setUseCaseOptions] = useState<UseCaseOptions>({
    optimizeForPrint: false,
    keepBookmarks: false,
    usePageRange: false,
  });
  const [mergeResult, setMergeResult] = useState<MergeResult | null>(null);

  // Fetch plugin config
  useEffect(() => {
    async function loadPlugin() {
      try {
        const data = await fetchPluginConfig(slug, locale);
        setPluginData(data);
      } catch (error) {
        console.error('Failed to load plugin:', error);
      } finally {
        setPageLoading(false);
      }
    }
    loadPlugin();
  }, [slug, locale]);

  // Helper to get localized text
  const t = useCallback((key: string): string => {
    if (!pluginData?.ui) return key;
    const keys = key.split('.');
    let value: any = pluginData.ui;
    for (const k of keys) {
      value = value?.[k];
    }
    return typeof value === 'string' ? value : key;
  }, [pluginData]);

  // Breadcrumb items
  const breadcrumbItems = pluginData ? [
    { label: t('breadcrumb.home'), href: '/', external: true },
    { label: t('breadcrumb.pdfTools'), href: `/${locale}` },
    { label: t('breadcrumb.current') },
  ] : [];

  // Handle files added
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
      setFeedback({ message: t('feedback.pdfOnly'), type: 'error' });
      return;
    }

    const analyzedFiles = await Promise.all(
      pdfFiles.map(async (pdfFile) => {
        try {
          const info = await analyzePDF(pdfFile.file);
          return { ...pdfFile, ...info };
        } catch {
          return pdfFile;
        }
      })
    );

    setFiles((prev) => [...prev, ...analyzedFiles]);
    setFeedback(null);
  }, [t]);

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
      setFeedback({ message: t('feedback.printApplied'), type: 'success' });
    } else if (options.keepBookmarks) {
      setFeedback({ message: t('feedback.bookmarksPreserved'), type: 'success' });
    } else if (options.usePageRange) {
      setFeedback({ message: t('feedback.pageRangeEnabled'), type: 'info' });
    }

    setTimeout(() => setFeedback(null), 3000);
  }, [t]);

  const handleMerge = useCallback(async () => {
    if (files.length === 0) {
      setFeedback({ message: t('feedback.uploadPdfFirst'), type: 'error' });
      return;
    }

    const hasEncrypted = files.some((f) => f.isEncrypted);
    if (hasEncrypted) {
      setFeedback({ message: t('feedback.cannotMergeEncrypted'), type: 'error' });
      return;
    }

    setLoading(true);
    setFeedback(null);

    try {
      const blob = await mergePDFsAPI(files, {
        keepBookmarks: useCaseOptions.keepBookmarks,
        optimizeForPrint: useCaseOptions.optimizeForPrint,
        usePageRange: useCaseOptions.usePageRange,
      });

      const totalPages = files.reduce((sum, file) => sum + file.pageCount, 0);
      const baseName = files[0].name.replace('.pdf', '');
      const fileName = `${baseName}-merged.pdf`;

      setMergeResult({
        blob,
        fileName,
        fileSize: formatFileSize(blob.size),
        pageCount: totalPages,
      });

      setFeedback(null);
    } catch (err) {
      setFeedback({
        message: err instanceof Error ? err.message : 'Merge failed. Please try again.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [files, useCaseOptions, t]);

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

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!pluginData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Tool Not Found</h1>
          <p className="text-gray-600">The requested tool does not exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <Breadcrumb items={breadcrumbItems} />

        <header className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
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
