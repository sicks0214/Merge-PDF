'use client';

import type { PluginUI, PluginSchemaOption } from '@/types';

interface UseCaseCardsProps {
  schemaOptions: PluginSchemaOption[];
  options: Record<string, any>;
  onOptionsChange: (options: Record<string, any>) => void;
  ui: PluginUI;
  locale: string;
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

export function UseCaseCards({ schemaOptions, options, onOptionsChange, ui, locale }: UseCaseCardsProps) {
  const useCaseOptions = schemaOptions.filter(opt => opt.useCaseKey);

  if (useCaseOptions.length === 0) return null;

  const handleOptionClick = (optionName: string) => {
    const newOptions: Record<string, any> = {};
    useCaseOptions.forEach(opt => {
      newOptions[opt.name] = opt.name === optionName;
    });
    onOptionsChange({ ...options, ...newOptions });
  };

  const getLocalizedText = (obj: any) => {
    if (!obj) return '';
    if (typeof obj === 'string') return obj;  // Already localized by backend
    return obj[locale] || obj['en'] || '';
  };

  return (
    <div className="mt-12">
      <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
        {getLocalizedText(ui.useCases?.sectionTitle) || 'Use Cases'}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {useCaseOptions.map(opt => {
          const useCaseData = ui.useCases?.[opt.useCaseKey!];
          if (!useCaseData) return null;

          const features = useCaseData.features || {};
          const featureKeys = Object.keys(features).sort();

          return (
            <CardItem key={opt.name}>
              <div className="space-y-4">
                <h3 className="text-xl font-bold" style={{ color: '#111827' }}>
                  {getLocalizedText(useCaseData.title)}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: '#374151' }}>
                  {getLocalizedText(useCaseData.description)}
                </p>
                <ul className="space-y-2 text-sm">
                  {featureKeys.map(key => (
                    <li key={key} className="flex items-start gap-2">
                      <CheckIcon />
                      <span style={{ color: '#374151' }}>{getLocalizedText(features[key])}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleOptionClick(opt.name)}
                  className={`w-full px-4 py-2.5 font-semibold rounded-lg transition-all duration-200 text-sm ${
                    options[opt.name]
                      ? 'bg-green-500 text-white'
                      : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg hover:scale-105'
                  }`}
                >
                  {getLocalizedText(useCaseData.action) || 'Use This Setting'}
                </button>
              </div>
            </CardItem>
          );
        })}
      </div>
    </div>
  );
}
