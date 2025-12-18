interface InlineFeedbackProps {
  message: string | null
  type?: 'success' | 'info' | 'warning' | 'error'
}

export function InlineFeedback({ message, type = 'success' }: InlineFeedbackProps) {
  if (!message) return null

  const styles = {
    success: 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300 text-green-800',
    info: 'bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-300 text-blue-800',
    warning: 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300 text-yellow-800',
    error: 'bg-gradient-to-r from-red-50 to-pink-50 border-red-300 text-red-800',
  }

  const icons = {
    success: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    info: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    warning: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  }

  return (
    <div className={`flex items-center gap-3 px-6 py-4 border-2 rounded-xl ${styles[type]} mb-8 shadow-md transition-all animate-in fade-in slide-in-from-top-2 duration-300`}>
      <div className="flex-shrink-0">
        {icons[type]}
      </div>
      <p className="font-semibold">{message}</p>
    </div>
  )
}
