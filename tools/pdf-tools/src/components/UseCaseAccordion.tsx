export interface UseCaseOptions {
  optimizeForPrint: boolean
  keepBookmarks: boolean
  usePageRange: boolean
}

interface UseCaseAccordionProps {
  options: UseCaseOptions
  onOptionsChange: (options: UseCaseOptions) => void
}

interface CardItemProps {
  children: React.ReactNode
}

function CardItem({ children }: CardItemProps) {
  return (
    <div className="border-2 rounded-xl overflow-hidden flex-1 border-gray-200 hover:border-blue-300 transition-all duration-200 shadow-sm hover:shadow-md">
      <div className="px-5 py-5 bg-gradient-to-br from-gray-50 to-white">
        {children}
      </div>
    </div>
  )
}

export function UseCaseAccordion({ options, onOptionsChange }: UseCaseAccordionProps) {

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
    <div className="mt-12">
      <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Advanced Merge Options</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Use Case 1: Merge PDF for Printing */}
        <CardItem>
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Merge PDF for Printing</h2>

            <p className="text-gray-700 text-sm leading-relaxed">
              Merge PDF for Printing lets you combine multiple PDF files into a single
              document optimized for printing. This option ensures consistent page size
              and layout across all files, making it suitable for professional printing
              and physical distribution.
            </p>

            <ul className="space-y-2 text-gray-700 text-sm">
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Optimized for print output</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Unified paper size and layout</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Ideal for printing and offline use</span>
              </li>
            </ul>
            <button
              onClick={handleUsePrintSetting}
              className="w-full px-4 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-200 text-sm"
            >
              Use this setting
            </button>
          </div>
        </CardItem>

        {/* Use Case 2: Merge PDF Keep Bookmarks */}
        <CardItem>
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Merge PDF Keep Bookmarks</h2>

            <p className="text-gray-700 text-sm leading-relaxed">
              Merge PDF Keep Bookmarks lets you combine multiple PDF files while
              preserving the original bookmarks from each document. This is ideal
              when merging structured PDFs such as reports, manuals, or ebooks,
              ensuring easy navigation in the merged file.
            </p>

            <ul className="space-y-2 text-gray-700 text-sm">
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Preserve original bookmarks</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Maintain document structure</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Ideal for long or structured PDFs</span>
              </li>
            </ul>
            <button
              onClick={handleUseBookmarksSetting}
              className="w-full px-4 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-200 text-sm"
            >
              Use this setting
            </button>
          </div>
        </CardItem>

        {/* Use Case 3: Merge PDF by Page Range */}
        <CardItem>
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Merge PDF by Page Range</h2>

            <p className="text-gray-700 text-sm leading-relaxed">
              Merge PDF by Page Range allows you to select specific pages from each
              PDF file before merging. This option is useful when you only need
              certain sections or chapters from multiple documents in a single PDF,
              helping you create a more focused and lightweight merged file.
            </p>

            <ul className="space-y-2 text-gray-700 text-sm">
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Select custom page ranges (e.g. 1-3, 5, 8-10)</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Merge only required pages from each PDF</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Reduce the final PDF file size</span>
              </li>
            </ul>
            <button
              onClick={handleUsePageRangeSetting}
              className="w-full px-4 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-200 text-sm"
            >
              Apply page range
            </button>
          </div>
        </CardItem>
      </div>
    </div>
  )
}
