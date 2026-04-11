import React from 'react';
import { Helmet } from 'react-helmet-async';

export const Disclaimer: React.FC = () => {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8 prose prose-blue dark:prose-invert">
      <Helmet>
        <title>Disclaimer - Sohelix</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <h1>Disclaimer</h1>
      <p>Last updated: {new Date().toLocaleDateString()}</p>
      <p>The information provided by Sohelix on our website is for general informational purposes only. All information on the site is provided in good faith, however we make no representation or warranty of any kind, express or implied, regarding the accuracy, adequacy, validity, reliability, availability or completeness of any information on the site.</p>
      <p>Under no circumstance shall we have any liability to you for any loss or damage of any kind incurred as a result of the use of the site or reliance on any information provided on the site. Your use of the site and your reliance on any information on the site is solely at your own risk.</p>
    </div>
  );
};
