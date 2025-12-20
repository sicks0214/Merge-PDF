'use client';

import { useTranslations } from 'next-intl';

export function HowToSection() {
  const t = useTranslations('mergePdf.howTo');

  const steps = [
    { number: 1, title: t('step1.title'), description: t('step1.description') },
    { number: 2, title: t('step2.title'), description: t('step2.description') },
    { number: 3, title: t('step3.title'), description: t('step3.description') },
    { number: 4, title: t('step4.title'), description: t('step4.description') },
  ];

  return (
    <section className="mt-16">
      <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">{t('title')}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {steps.map((step) => (
          <div
            key={step.number}
            className="bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                {step.number}
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
