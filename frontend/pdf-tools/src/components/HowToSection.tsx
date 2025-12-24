'use client';

import type { PluginUI } from '@/types';

interface HowToSectionProps {
  ui: PluginUI;
}

export function HowToSection({ ui }: HowToSectionProps) {
  const steps = [
    { number: 1, title: ui.howTo?.step1?.title || 'Step 1', description: ui.howTo?.step1?.description || '' },
    { number: 2, title: ui.howTo?.step2?.title || 'Step 2', description: ui.howTo?.step2?.description || '' },
    { number: 3, title: ui.howTo?.step3?.title || 'Step 3', description: ui.howTo?.step3?.description || '' },
    { number: 4, title: ui.howTo?.step4?.title || 'Step 4', description: ui.howTo?.step4?.description || '' },
  ];

  return (
    <section className="mt-16">
      <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">{ui.howTo?.title || 'How to Use'}</h2>
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
