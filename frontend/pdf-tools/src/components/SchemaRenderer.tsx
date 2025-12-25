'use client';

import { PluginSchemaOption } from '@/types';

interface SchemaRendererProps {
  options: PluginSchemaOption[];
  values: Record<string, any>;
  onChange: (name: string, value: any) => void;
  locale: string;
}

export function SchemaRenderer({ options, values, onChange, locale }: SchemaRendererProps) {
  if (!options || options.length === 0) return null;

  return (
    <div className="space-y-4">
      {options.map(option => {
        const label = option.label?.[locale] || option.label?.['en'] || option.name;

        switch (option.type) {
          case 'boolean':
            return (
              <label key={option.name} className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={values[option.name] ?? option.default ?? false}
                  onChange={e => onChange(option.name, e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-700 group-hover:text-gray-900">{label}</span>
              </label>
            );

          case 'number':
            return (
              <div key={option.name}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <input
                  type="number"
                  value={values[option.name] ?? option.default ?? ''}
                  min={option.min}
                  max={option.max}
                  onChange={e => onChange(option.name, Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            );

          case 'text':
            return (
              <div key={option.name}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <input
                  type="text"
                  value={values[option.name] ?? option.default ?? ''}
                  placeholder={option.placeholder?.[locale] || option.placeholder?.['en'] || ''}
                  onChange={e => onChange(option.name, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            );

          case 'select':
            return (
              <div key={option.name}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <select
                  value={values[option.name] ?? option.default ?? ''}
                  onChange={e => onChange(option.name, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {option.choices?.map(choice => (
                    <option key={choice.value} value={choice.value}>
                      {choice.label?.[locale] || choice.label?.['en'] || choice.value}
                    </option>
                  ))}
                </select>
              </div>
            );

          default:
            return null;
        }
      })}
    </div>
  );
}
