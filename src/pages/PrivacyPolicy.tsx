import React from 'react';
import { Helmet } from 'react-helmet-async';

export const PrivacyPolicy: React.FC = () => {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8 prose prose-blue dark:prose-invert">
      <Helmet>
        <title>Privacy Policy - Sohelix</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <h1>Privacy Policy</h1>
      <p>Last updated: {new Date().toLocaleDateString()}</p>
      <p>At Sohelix, your privacy is our priority. Because our tools operate 100% client-side, your images and files are never uploaded to our servers. All processing happens locally within your web browser.</p>
      <h2>Data Collection</h2>
      <p>We do not collect, store, or transmit any of the files you process using our tools. We may use standard analytics tools to understand website traffic and usage patterns, which collect anonymous data such as browser type and pages visited.</p>
      <h2>Cookies</h2>
      <p>We may use cookies to enhance your experience, such as remembering your dark mode preference.</p>
      <h2>Changes to This Policy</h2>
      <p>We may update our Privacy Policy from time to time. Any changes will be posted on this page.</p>
    </div>
  );
};
