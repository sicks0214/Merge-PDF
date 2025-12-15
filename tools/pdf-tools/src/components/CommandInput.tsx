interface CommandInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function CommandInput({ value, onChange, placeholder }: CommandInputProps) {
  return (
    <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || "1:1-5\n2:all\n--keep-bookmarks"}
        className="w-full h-32 px-4 py-3 text-sm font-mono text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
        spellCheck={false}
      />
    </div>
  )
}
