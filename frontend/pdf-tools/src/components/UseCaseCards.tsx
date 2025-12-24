'use client';

import type { PluginUI } from '@/types';

interface UseCaseOptions {
  optimizeForPrint: boolean;
  keepBookmarks: boolean;
  usePageRange: boolean;
}

interface UseCaseCardsProps {
  options: UseCaseOptions;
  onOptionsChange: (options: UseCaseOptions) => void;
  ui: PluginUI;
}

function CardItem({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-2 rounded-xl overflow-hidden flex-1 border-gray-200 hover:border-blue-300 transition-all duration-200 shadow-sm hover:shadow-md">
      <div className="px-5 py-5 bg-gradient-to-br from-gray-50 to-white">
        {children}
      </div>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

export function UseCaseCards({ options, onOptionsChange, ui }: UseCaseCardsProps) {
  const handleUsePrintSetting = () => {
    onOptionsChange({
      optimizeForPrint: true,
      keepBookmarks: false,
      usePageRange: false,
    });
  };

  const handleUseBookmarksSetting = () => {
    onOptionsChange({
      ...options,
      keepBookmarks: true,
    });
  };

  const handleUsePageRangeSetting = () => {
    onOptionsChange({
      ...options,
      usePageRange: true,
    });
  };

  return (
    <div className="mt-12">
      <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">{ui.useCases?.sectionTitle || 'Use Cases'}</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Use Case 1: Merge PDF for Printing */}
        <CardItem>
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">{ui.useCases?.printing?.title || 'Merge for Printing'}</h2>
            <p className="text-gray-700 text-sm leading-relaxed">{ui.useCases?.printing?.description || ''}</p>
            <ul className="space-y-2 text-gray-700 text-sm">
              <li className="flex items-start gap-2">
                <CheckIcon />
                <span>{ui.useCases?.printing?.features?.["1"] || ''}</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckIcon />
                <span>{ui.useCases?.printing?.features?.["2"] || ''}</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckIcon />
                <span>{ui.useCases?.printing?.features?.["3"] || ''}</span>
              </li>
            </ul>
            <button
              onClick={handleUsePrintSetting}
              className={`w-full px-4 py-2.5 font-semibold rounded-lg transition-all duration-200 text-sm ${
                options.optimizeForPrint
                  ? 'bg-green-500 text-white'
                  : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg hover:scale-105'
              }`}
            >
              {ui.useCases?.printing?.action || 'Use This Setting'}
            </button>
          </div>
        </CardItem>

        {/* Use Case 2: Merge PDF Keep Bookmarks */}
        <CardItem>
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">{ui.useCases?.bookmarks?.title || 'Keep Bookmarks'}</h2>
            <p className="text-gray-700 text-sm leading-relaxed">{ui.useCases?.bookmarks?.description || ''}</p>
            <ul className="space-y-2 text-gray-700 text-sm">
              <li className="flex items-start gap-2">
                <CheckIcon />
                <span>{ui.useCases?.bookmarks?.features?.["1"] || ''}</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckIcon />
                <span>{ui.useCases?.bookmarks?.features?.["2"] || ''}</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckIcon />
                <span>{ui.useCases?.bookmarks?.features?.["3"] || ''}</span>
              </li>
            </ul>
            <button
              onClick={handleUseBookmarksSetting}
              className={`w-full px-4 py-2.5 font-semibold rounded-lg transition-all duration-200 text-sm ${
                options.keepBookmarks
                  ? 'bg-green-500 text-white'
                  : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg hover:scale-105'
              }`}
            >
              {ui.useCases?.bookmarks?.action || 'Use This Setting'}
            </button>
          </div>
        </CardItem>

        {/* Use Case 3: Merge PDF by Page Range */}
        <CardItem>
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">{ui.useCases?.pageRange?.title || 'Page Range'}</h2>
            <p className="text-gray-700 text-sm leading-relaxed">{ui.useCases?.pageRange?.description || ''}</p>
            <ul className="space-y-2 text-gray-700 text-sm">
              <li className="flex items-start gap-2">
                <CheckIcon />
                <span>{ui.useCases?.pageRange?.features?.["1"] || ''}</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckIcon />
                <span>{ui.useCases?.pageRange?.features?.["2"] || ''}</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckIcon />
                <span>{ui.useCases?.pageRange?.features?.["3"] || ''}</span>
              </li>
            </ul>
            <button
              onClick={handleUsePageRangeSetting}
              className={`w-full px-4 py-2.5 font-semibold rounded-lg transition-all duration-200 text-sm ${
                options.usePageRange
                  ? 'bg-green-500 text-white'
                  : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg hover:scale-105'
              }`}
            >
              {ui.useCases?.pageRange?.action || 'Use This Setting'}
            </button>
          </div>
        </CardItem>
      </div>
    </div>
  );
}
