export function HowToSection() {
  return (
    <section className="mt-16 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border-2 border-blue-100 p-10 shadow-lg">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-md">
          <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">How to Merge PDF Files</h2>
        <p className="text-gray-600">Simple steps to combine your documents</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-xl flex items-center justify-center font-bold shadow-md">
              1
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-1">Upload PDF Files</h3>
              <p className="text-gray-600 text-sm">Select or drag and drop multiple PDF files you want to merge.</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-xl flex items-center justify-center font-bold shadow-md">
              2
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-1">Arrange Files</h3>
              <p className="text-gray-600 text-sm">Drag and drop files to reorder them in your desired sequence.</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-xl flex items-center justify-center font-bold shadow-md">
              3
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-1">Choose Options</h3>
              <p className="text-gray-600 text-sm">Optionally select merge options like keeping bookmarks or page ranges.</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-xl flex items-center justify-center font-bold shadow-md">
              4
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-1">Download Result</h3>
              <p className="text-gray-600 text-sm">Click "Merge PDF" and download your combined document instantly.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
