'use client';

import { useCallback, useState, DragEvent } from 'react';
import { useDropzone } from 'react-dropzone';
import { useTranslations } from 'next-intl';
import type { PDFFile } from '@/types';

interface CoreToolAreaProps {
  files: PDFFile[];
  onFilesAdded: (files: File[]) => void;
  onRemoveFile: (id: string) => void;
  onReorderFiles: (files: PDFFile[]) => void;
  onMerge: () => void;
  loading: boolean;
  usePageRange: boolean;
  onPageRangeChange?: (fileId: string, pageRange: string) => void;
}

export function CoreToolArea({
  files,
  onFilesAdded,
  onRemoveFile,
  onReorderFiles,
  onMerge,
  loading,
  usePageRange,
  onPageRangeChange,
}: CoreToolAreaProps) {
  const t = useTranslations('mergePdf');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const pdfFiles = acceptedFiles.filter(f => f.type === 'application/pdf');
    if (pdfFiles.length > 0) {
      onFilesAdded(pdfFiles);
    }
  }, [onFilesAdded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: true,
  });

  // File list drag and drop for reordering
  const handleFileDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleFileDragOver = (e: DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newFiles = [...files];
    const draggedFile = newFiles[draggedIndex];
    newFiles.splice(draggedIndex, 1);
    newFiles.splice(index, 0, draggedFile);

    setDraggedIndex(index);
    onReorderFiles(newFiles);
  };

  const handleFileDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className="w-full">
      {/* Upload Area */}
      {files.length === 0 && (
        <div
          {...getRootProps()}
          className={`relative border-2 border-dashed rounded-2xl py-24 px-16 text-center transition-all duration-300 cursor-pointer ${
            isDragActive
              ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 scale-[1.02]'
              : 'border-gray-300 bg-gradient-to-br from-gray-50 to-white hover:border-blue-400'
          }`}
        >
          <input {...getInputProps()} />
          <div className="relative z-10 flex flex-col items-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl shadow-lg mb-10">
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <span className="inline-block px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold text-lg rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200">
              {t('upload.title')}
            </span>
            <p className="mt-6 text-lg text-gray-700 font-medium">{t('upload.dragDrop')}</p>
            <p className="mt-2 text-sm text-gray-500">{t('upload.hint')}</p>
          </div>
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-6">
          {/* Card Grid Layout */}
          <div className="flex flex-wrap items-start gap-8">
            {files.map((file, index) => (
              <div
                key={file.id}
                draggable
                onDragStart={() => handleFileDragStart(index)}
                onDragOver={(e) => handleFileDragOver(e, index)}
                onDragEnd={handleFileDragEnd}
                className={`relative cursor-move transition-all duration-200 ${
                  draggedIndex === index ? 'opacity-50 scale-95' : ''
                }`}
              >
                {/* Plus badge between cards */}
                {index > 0 && (
                  <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xl font-light z-10">
                    +
                  </div>
                )}

                {/* File Card */}
                <div className="relative bg-white rounded-xl shadow-md border-2 border-gray-200 overflow-hidden w-44 hover:shadow-lg transition-shadow">
                  {/* Thumbnail / Preview Area */}
                  <div className="h-56 bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col items-center justify-center p-4 relative">
                    {file.pageCount === 0 ? (
                      <div className="flex flex-col items-center">
                        <div className="relative mb-3">
                          <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center">
                            <span className="text-2xl font-bold text-orange-500">P</span>
                          </div>
                        </div>
                        <span className="text-xs text-orange-600 font-medium bg-orange-50 px-3 py-1 rounded-full">
                          {t('fileList.converting')}
                        </span>
                      </div>
                    ) : (
                      <div className="w-full h-full bg-white border border-gray-200 rounded-lg overflow-hidden">
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Remove button */}
                  <button
                    onClick={() => onRemoveFile(file.id)}
                    className="absolute top-2 right-2 w-7 h-7 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-red-50 transition-colors z-20"
                  >
                    <svg className="w-4 h-4 text-gray-500 hover:text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>

                  {/* File info footer */}
                  <div className="p-3 bg-white border-t border-gray-100">
                    <p className="text-sm text-gray-800 truncate font-medium" title={file.name}>
                      {file.name}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-gray-500">
                        {file.pageCount > 0 ? `${file.pageCount} ${t('fileList.pages')}` : t('fileList.analyzing')}
                      </p>
                      {file.isEncrypted && (
                        <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full">
                          {t('fileList.encrypted')}
                        </span>
                      )}
                    </div>

                    {/* Page range input (if enabled) */}
                    {usePageRange && onPageRangeChange && (
                      <input
                        type="text"
                        placeholder="e.g. 1-5, all"
                        defaultValue="all"
                        onChange={(e) => onPageRangeChange(file.id, e.target.value)}
                        className="w-full mt-2 px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        onClick={(e) => e.stopPropagation()}
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Add more files card */}
            <div className="relative w-44" {...getRootProps()}>
              {/* Plus badge */}
              <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xl font-light z-10">
                +
              </div>

              <div className="cursor-pointer">
                <input {...getInputProps()} />
                <div className="relative bg-white rounded-xl shadow-md border-2 border-dashed border-gray-300 overflow-hidden w-44 hover:shadow-lg hover:border-blue-400 transition-all">
                  <div className="h-56 bg-gradient-to-b from-blue-50 to-blue-100 flex flex-col items-center justify-center p-4 relative">
                    <div className="w-16 h-16 rounded-full bg-white shadow-md flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                  </div>
                  <div className="p-3 bg-white border-t border-gray-100">
                    <p className="text-sm text-blue-500 font-medium text-center leading-tight">
                      {t('fileList.addMore')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Merge button */}
          <button
            onClick={onMerge}
            disabled={loading || files.length === 0}
            className="w-full py-5 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold text-xl rounded-xl hover:shadow-xl hover:scale-[1.02] disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-200 flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                {t('actions.merging')}
              </>
            ) : (
              <>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                {t('actions.merge')}
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
