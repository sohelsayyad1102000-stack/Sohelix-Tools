import React from 'react';
import { SEO } from '../components/SEO';
import { HelpCircle, ChevronRight } from 'lucide-react';

const faqs = [
  {
    question: "Is Sohelix free to use?",
    answer: "Yes, Sohelix is 100% free to use. There are no hidden fees, no subscriptions, and no premium tiers. All tools are available to everyone at no cost."
  },
  {
    question: "Are my images uploaded or stored on your servers?",
    answer: "No. Sohelix operates entirely client-side. This means all image processing happens directly within your web browser. Your files are never uploaded to our servers, ensuring complete privacy and security."
  },
  {
    question: "How does image compression work without uploading?",
    answer: "We utilize modern web technologies and JavaScript libraries that leverage your device's processing power to compress images locally before you save them."
  },
  {
    question: "Is this tool safe to use for sensitive documents?",
    answer: "Absolutely. Because your files never leave your device and are not transmitted over the internet to our servers, Sohelix is highly secure for processing sensitive or private images."
  },
  {
    question: "What image formats are supported?",
    answer: "Our tools generally support standard web formats including JPG, PNG, WebP, and SVG. Specific tools may have different format requirements, which are detailed on their respective pages."
  },
  {
    question: "Can I use Sohelix on my mobile phone?",
    answer: "Yes! Sohelix is fully responsive and designed to work seamlessly on desktop computers, tablets, and mobile smartphones."
  },
  {
    question: "Is there a file size limit?",
    answer: "Because processing happens on your device, the file size limit is primarily determined by your device's available memory (RAM) and browser capabilities, rather than a hard server limit."
  },
  {
    question: "Do you add watermarks to processed images?",
    answer: "No, we never add our own watermarks to your images. Your processed files remain clean. We do offer a Watermark tool if you wish to add your own custom watermark."
  },
  {
    question: "How can I suggest a new tool?",
    answer: "We love hearing from our users! If you have an idea for a new tool or feature, please reach out to us through our contact page."
  }
];

export const FAQ: React.FC = () => {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-16">
      <SEO 
        title="Frequently Asked Questions - Sohelix"
        description="Find answers to common questions about Sohelix, our free client-side image tools, privacy, and security."
        schema={faqSchema}
      />

      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center p-4 bg-blue-100 dark:bg-blue-900/30 rounded-2xl mb-6 text-blue-600 dark:text-blue-400">
            <HelpCircle className="h-10 w-10" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-6 tracking-tight">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Everything you need to know about using Sohelix.
          </p>
        </div>

        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div key={index} className="group rounded-2xl bg-white p-8 shadow-sm border border-gray-100 transition-all hover:shadow-md dark:bg-gray-900 dark:border-gray-800">
              <div className="flex gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                  <ChevronRight className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    {faq.question}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
