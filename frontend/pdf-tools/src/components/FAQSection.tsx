'use client';

import { useState } from 'react';
import type { PluginUI } from '@/types';

interface FAQItemProps {
  number: number;
  question: string;
  answer: string;
}

function FAQItem({ number, question, answer }: FAQItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center gap-4 text-left hover:bg-gray-50 transition-colors"
      >
        <span className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
          {number}
        </span>
        <span className="flex-1 font-semibold text-gray-900">{question}</span>
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
        <div className="px-6 pb-4 pt-0">
          <div className="pl-12 text-gray-600">{answer}</div>
        </div>
      )}
    </div>
  );
}

interface FAQSectionProps {
  ui: PluginUI;
}

export function FAQSection({ ui }: FAQSectionProps) {
  const faqItems = ui.faq?.items || [];
  // Handle both array and object formats
  const itemsArray = Array.isArray(faqItems) ? faqItems : Object.values(faqItems);
  const faqs = itemsArray.map((item: any) => ({
    question: item?.question || '',
    answer: item?.answer || '',
  })).filter((faq: any) => faq.question);

  return (
    <section className="mt-16">
      <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">{ui.faq?.title || 'FAQ'}</h2>
      <div className="space-y-3">
        {faqs.map((faq, index) => (
          <FAQItem
            key={index}
            number={index + 1}
            question={faq.question}
            answer={faq.answer}
          />
        ))}
      </div>
    </section>
  );
}
