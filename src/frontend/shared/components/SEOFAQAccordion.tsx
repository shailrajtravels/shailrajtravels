import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { SchemaMarkup } from '@/frontend/shared/components/SchemaMarkup';
import { generateFAQSchema } from '@/backend/shared/schema-generators';

export interface FAQ {
  question: string;
  answer: string;
}

interface SEOFAQAccordionProps {
  faqs: FAQ[];
}

export function SEOFAQAccordion({ faqs }: SEOFAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-8">
      <SchemaMarkup schema={generateFAQSchema(faqs)} />
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div key={index} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            <button
              className="w-full px-6 py-4 flex items-center justify-between bg-white hover:bg-gray-50 focus:outline-none transition-colors"
              onClick={() => toggle(index)}
              aria-expanded={openIndex === index}
            >
              <h3 className="font-semibold text-left text-brand-blue-deep pr-4 text-lg">
                {faq.question}
              </h3>
              {openIndex === index ? (
                <ChevronUp className="w-5 h-5 text-brand-orange shrink-0" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400 shrink-0" />
              )}
            </button>
            {openIndex === index && (
              <div className="px-6 py-5 bg-white border-t border-gray-100 text-gray-700 leading-relaxed">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
