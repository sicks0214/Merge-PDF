export function HowToSection() {
  return (
    <section className="max-w-4xl mx-auto mt-12 bg-white rounded-lg border border-gray-200 p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">How to Merge PDF Files</h2>
      <ol className="space-y-4 text-gray-700">
        <li className="flex gap-4">
          <span className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold">
            1
          </span>
          <div>
            <strong className="text-gray-800">Upload multiple PDF files</strong>
            <p className="text-gray-600 mt-1">
              Click the upload area or drag and drop your PDF files. You can upload multiple files at once.
            </p>
          </div>
        </li>
        <li className="flex gap-4">
          <span className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold">
            2
          </span>
          <div>
            <strong className="text-gray-800">Arrange files in the desired order</strong>
            <p className="text-gray-600 mt-1">
              Drag and drop files to reorder them. The merged PDF will follow this sequence.
            </p>
          </div>
        </li>
        <li className="flex gap-4">
          <span className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold">
            3
          </span>
          <div>
            <strong className="text-gray-800">Choose merge options if needed</strong>
            <p className="text-gray-600 mt-1">
              Expand the use case sections below to configure printing optimization, bookmark preservation, or page range selection.
            </p>
          </div>
        </li>
        <li className="flex gap-4">
          <span className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold">
            4
          </span>
          <div>
            <strong className="text-gray-800">Click "Merge PDF" to download the result</strong>
            <p className="text-gray-600 mt-1">
              The merged PDF will be generated and automatically downloaded to your device.
            </p>
          </div>
        </li>
      </ol>

      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-2">Pro Tip</h3>
        <p className="text-blue-700 text-sm">
          You can merge PDF files with different page sizes, orientations, and content types.
          The tool automatically handles various PDF formats and preserves document quality.
        </p>
      </div>
    </section>
  )
}
