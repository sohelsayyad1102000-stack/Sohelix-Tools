import React from 'react';
import { Helmet } from 'react-helmet-async';

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
    answer: "We utilize modern web technologies and JavaScript libraries (like browser-image-compression) that leverage your device's processing power to compress images locally before you save them."
  },
  {
    question: "Is this tool safe to use for sensitive documents?",
    answer: "Absolutely. Because your files never leave your device and are not transmitted over the internet to our servers, Sohelix is highly secure for processing sensitive or private images."
  },
  {
    question: "What image formats are supported?",
    answer: "Our tools generally support standard web formats including JPG, PNG, and WebP. Specific tools may have different format requirements, which are detailed on their respective pages."
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
  }
];

export const FAQ: React.FC = () => {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <Helmet>
        <title>Frequently Asked Questions - Sohelix</title>
        <meta name="description" content="Find answers to common questions about Sohelix, our free client-side image tools, privacy, and security." />
      </Helmet>

      <div className="text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
          Frequently Asked Questions
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-xl text-gray-500 dark:text-gray-400">
          Everything you need to know about using Sohelix.
        </p>
      </div>

      <div className="mt-12 space-y-8">
        {faqs.map((faq, index) => (
          <div key={index} className="rounded-2xl bg-white p-8 shadow-sm dark:bg-gray-900">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {faq.question}
            </h2>
            <p className="mt-4 text-gray-600 dark:text-gray-400 leading-relaxed">
              {faq.answer}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
