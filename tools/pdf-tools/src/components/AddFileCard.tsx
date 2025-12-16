interface AddFileCardProps {
  onFilesAdded: (files: FileList) => void
}

export function AddFileCard({ onFilesAdded }: AddFileCardProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesAdded(e.target.files)
    }
  }

  return (
    <div className="relative w-44">
      {/* Plus badge */}
      <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xl font-light z-10">
        +
      </div>

      <label className="block cursor-pointer">
        <input
          type="file"
          accept=".pdf"
          multiple
          onChange={handleInputChange}
          className="hidden"
        />
        <div className="h-72 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center hover:border-blue-400 hover:bg-blue-50 transition-colors">
          <div className="w-12 h-12 rounded-full border-2 border-blue-400 flex items-center justify-center mb-3">
            <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <span className="text-blue-500 font-medium">Add PDF,</span>
        </div>
      </label>
    </div>
  )
}
