import { useState } from 'react'

export interface UseCaseOptions {
  optimizeForPrint: boolean
  keepBookmarks: boolean
  usePageRange: boolean
}

interface UseCaseAccordionProps {
  options: UseCaseOptions
  onOptionsChange: (options: UseCaseOptions) => void
}

interface AccordionItemProps {
  title: string
  isOpen: boolean
  onToggle: () => void
  children: React.ReactNode
}

function AccordionItem({ title, isOpen, onToggle, children }: AccordionItemProps) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden mb-4">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-6 py-4 bg-white hover:bg-gray-50 transition-colors text-left"
        aria-expanded={isOpen}
      >
        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
        <svg
          className={`w-5 h-5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          {children}
        </div>
      )}
    </div>
  )
}

export function UseCaseAccordion({ options, onOptionsChange }: UseCaseAccordionProps) {
  const [openSection, setOpenSection] = useState<string | null>(null)

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section)
  }

  const handleUsePrintSetting = () => {
    onOptionsChange({
      optimizeForPrint: true,
      keepBookmarks: false,
      usePageRange: false,
    })
  }

  const handleUseBookmarksSetting = () => {
    onOptionsChange({
      ...options,
      keepBookmarks: true,
    })
  }

  const handleUsePageRangeSetting = () => {
    onOptionsChange({
      ...options,
      usePageRange: true,
    })
  }

  return (
    <div className="max-w-4xl mx-auto mt-8">
      {/* Use Case 1: Merge PDF for Printing */}
      <AccordionItem
        title="Merge PDF for Printing"
        isOpen={openSection === 'printing'}
        onToggle={() => toggleSection('printing')}
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Optimize your merged PDF for print output with unified paper size settings.
            This mode ensures all pages are standardized to A4 or Letter format.
          </p>
          <ul className="list-disc list-inside text-gray-600 space-y-1">
            <li>Unified paper size (A4 / Letter)</li>
            <li>Removes blank trailing pages</li>
            <li>Optimized for professional printing</li>
          </ul>
          <button
            onClick={handleUsePrintSetting}
            className="px-6 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors"
          >
            Use this setting
          </button>
        </div>
      </AccordionItem>

      {/* Use Case 2: Merge PDF Keep Bookmarks */}
      <AccordionItem
        title="Merge PDF Keep Bookmarks"
        isOpen={openSection === 'bookmarks'}
        onToggle={() => toggleSection('bookmarks')}
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Preserve the original bookmarks and table of contents from your PDF files.
            Perfect for combining chapters or sections while maintaining navigation structure.
          </p>
          <ul className="list-disc list-inside text-gray-600 space-y-1">
            <li>Preserves original bookmarks from all PDFs</li>
            <li>Creates file-level bookmarks for each source</li>
            <li>Maintains hierarchical structure</li>
          </ul>
          <button
            onClick={handleUseBookmarksSetting}
            className="px-6 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors"
          >
            Use this setting
          </button>
        </div>
      </AccordionItem>

      {/* Use Case 3: Merge PDF by Page Range */}
      <AccordionItem
        title="Merge PDF by Page Range"
        isOpen={openSection === 'pagerange'}
        onToggle={() => toggleSection('pagerange')}
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Select specific pages from each PDF file to include in the merged output.
            Use flexible syntax to define page ranges.
          </p>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-2">Syntax Examples:</h3>
            <ul className="text-sm text-gray-600 space-y-1 font-mono">
              <li><strong>1:all</strong> - All pages from file 1</li>
              <li><strong>2:1-5</strong> - Pages 1 to 5 from file 2</li>
              <li><strong>3:1,3,7-10</strong> - Pages 1, 3, and 7-10 from file 3</li>
            </ul>
          </div>
          <p className="text-sm text-gray-500">
            Note: You can specify page ranges for individual files in the file list above.
          </p>
          <button
            onClick={handleUsePageRangeSetting}
            className="px-6 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors"
          >
            Enable page range mode
          </button>
        </div>
      </AccordionItem>
    </div>
  )
}
