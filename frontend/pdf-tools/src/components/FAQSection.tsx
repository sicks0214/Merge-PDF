'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

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

export function FAQSection() {
  const t = useTranslations('mergePdf.faq');

  const faqs = [
    { question: t('q1.question'), answer: t('q1.answer') },
    { question: t('q2.question'), answer: t('q2.answer') },
    { question: t('q3.question'), answer: t('q3.answer') },
    { question: t('q4.question'), answer: t('q4.answer') },
    { question: t('q5.question'), answer: t('q5.answer') },
    { question: t('q6.question'), answer: t('q6.answer') },
  ];

  return (
    <section className="mt-16">
      <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">{t('title')}</h2>
      <div className="space-y-3 max-w-3xl mx-auto">
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
