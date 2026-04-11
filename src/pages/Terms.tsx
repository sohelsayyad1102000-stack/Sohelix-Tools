import React from 'react';
import { Helmet } from 'react-helmet-async';

export const Terms: React.FC = () => {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8 prose prose-blue dark:prose-invert">
      <Helmet>
        <title>Terms of Service - Sohelix</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <h1>Terms of Service</h1>
      <p>Last updated: {new Date().toLocaleDateString()}</p>
      <h2>Acceptance of Terms</h2>
      <p>By accessing and using Sohelix, you accept and agree to be bound by the terms and provision of this agreement.</p>
      <h2>Use of Service</h2>
      <p>Sohelix provides free online image processing tools. You agree to use these tools only for lawful purposes and in a way that does not infringe the rights of, restrict or inhibit anyone else's use and enjoyment of the website.</p>
      <h2>Disclaimer of Warranties</h2>
      <p>The service is provided "as is". We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties, including without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>
      <h2>Limitations</h2>
      <p>In no event shall Sohelix or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Sohelix's website.</p>
    </div>
  );
};
