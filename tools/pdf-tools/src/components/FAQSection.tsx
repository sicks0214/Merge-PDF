import { useState } from 'react'

interface FAQItem {
  question: string
  answer: string
}

const faqData: FAQItem[] = [
  {
    question: 'Is Merge PDF free?',
    answer: 'Yes, this tool is completely free to use. You can merge unlimited PDF files without any charges or subscriptions.',
  },
  {
    question: 'Are my files secure?',
    answer: 'All files are processed securely on our servers and are automatically deleted after processing. We do not store, share, or access your documents.',
  },
  {
    question: 'Can I merge large PDF files?',
    answer: 'Yes, you can merge large PDF files within reasonable size limits. The tool supports files up to several hundred megabytes each.',
  },
  {
    question: 'Can I merge encrypted PDF files?',
    answer: 'Currently, encrypted or password-protected PDF files cannot be merged. Please remove the password protection before uploading.',
  },
  {
    question: 'Will bookmarks be preserved in the merged PDF?',
    answer: 'Yes, if you enable the "Keep Bookmarks" option, all bookmarks from the original PDFs will be preserved and adjusted to reflect the new page numbers.',
  },
  {
    question: 'Can I select specific pages from each PDF?',
    answer: 'Yes, you can use the "Merge PDF by Page Range" feature to select specific pages from each file using syntax like "1-5" or "1,3,7-10".',
  },
]

function FAQItemComponent({ faq, index }: { faq: FAQItem; index: number }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 hover:border-blue-300 transition-all overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-start justify-between p-5 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-start gap-4 flex-1">
          <span className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-lg flex items-center justify-center font-bold text-sm">
            {index + 1}
          </span>
          <span className="font-semibold text-gray-900 flex-1 pr-4">{faq.question}</span>
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="px-5 pb-5 pl-[4.5rem]">
          <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
        </div>
      )}
    </div>
  )
}

export function FAQSection() {
  return (
    <section className="mt-16">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-md">
          <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Frequently Asked Questions</h2>
        <p className="text-gray-600">Everything you need to know about merging PDFs</p>
      </div>
      <div className="space-y-4">
        {faqData.map((faq, index) => (
          <FAQItemComponent key={index} faq={faq} index={index} />
        ))}
      </div>

      <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-2xl">
        <div className="flex items-start gap-4">
          <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="font-bold text-gray-900 mb-1">Still have questions?</p>
            <p className="text-gray-700 text-sm">
              Our tool is designed to be simple and intuitive. Just upload your files and try it out!
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
