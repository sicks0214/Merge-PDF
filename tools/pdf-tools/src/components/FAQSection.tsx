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
  {
    question: 'What file formats are supported?',
    answer: 'Currently, only PDF files are supported. If you need to convert other formats (Word, Excel, images) to PDF first, please use our conversion tools.',
  },
  {
    question: 'How long does it take to merge PDFs?',
    answer: 'Merging is typically very fast, usually completing within a few seconds depending on the file sizes and number of pages.',
  },
]

export function FAQSection() {
  return (
    <section className="max-w-4xl mx-auto mt-12 bg-white rounded-lg border border-gray-200 p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Frequently Asked Questions</h2>
      <div className="space-y-6">
        {faqData.map((faq, index) => (
          <div key={index} className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {faq.question}
            </h3>
            <p className="text-gray-600 leading-relaxed">
              {faq.answer}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-gray-700 text-sm">
          <strong>Still have questions?</strong> Our tool is designed to be simple and intuitive.
          Just upload your files and try it out!
        </p>
      </div>
    </section>
  )
}
