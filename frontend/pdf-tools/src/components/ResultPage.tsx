'use client';

import { useTranslations } from 'next-intl';
import { downloadBlob } from '@/lib/pdfMerger';
import type { MergeResult } from '@/types';

interface ResultPageProps {
  result: MergeResult;
  onReset: () => void;
}

export function ResultPage({ result, onReset }: ResultPageProps) {
  const t = useTranslations('mergePdf');

  const handleDownload = () => {
    downloadBlob(result.blob, result.fileName);
  };

  return (
    <div className="text-center py-8">
      <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full mb-6">
        <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('result.title')}</h2>

      <div className="bg-gray-50 rounded-xl p-6 mb-6 max-w-md mx-auto">
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">{t('result.fileName')}</span>
            <span className="font-medium text-gray-900">{result.fileName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">{t('result.fileSize')}</span>
            <span className="font-medium text-gray-900">{result.fileSize}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">{t('result.pageCount')}</span>
            <span className="font-medium text-gray-900">{result.pageCount}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={handleDownload}
          className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold text-lg rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          {t('actions.download')}
        </button>
        <button
          onClick={onReset}
          className="px-8 py-4 bg-gray-100 text-gray-700 font-bold text-lg rounded-xl hover:bg-gray-200 transition-all duration-200"
        >
          {t('actions.startOver')}
        </button>
      </div>
    </div>
  );
}
