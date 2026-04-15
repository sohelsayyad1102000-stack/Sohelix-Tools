import React from 'react';
import { SEO } from '../components/SEO';

export const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12">
      <SEO 
        title="Privacy Policy - Sohelix"
        description="Learn how Sohelix protects your privacy. Our tools are 100% client-side, meaning your files never leave your device."
      />

      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white dark:bg-gray-900 p-8 md:p-12 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800">
          <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-8 tracking-tight">Privacy Policy</h1>
          
          <div className="prose prose-blue dark:prose-invert max-w-none">
            <p className="text-lg text-gray-600 dark:text-gray-400">Last Updated: April 14, 2026</p>
            
            <p>At Sohelix, we take your privacy seriously. This Privacy Policy outlines how we handle your information when you use our website and tools.</p>

            <h2>1. Client-Side Processing (Our Core Principle)</h2>
            <p>The most important thing to know about Sohelix is that <strong>we do not upload your files to our servers</strong>. All image processing, PDF manipulation, and utility calculations are performed locally in your web browser using JavaScript. Your sensitive photos, documents, and data never leave your device.</p>

            <h2>2. Information We Collect</h2>
            <p>Because our tools are client-side, we do not collect the content of the files you process. However, we may collect certain non-personal information to improve our service:</p>
            <ul>
              <li><strong>Usage Data:</strong> We use Google Analytics to track general usage patterns, such as which tools are most popular and how users navigate the site. This data is anonymized and does not include personally identifiable information.</li>
              <li><strong>Cookies:</strong> We use cookies to save your preferences (like Dark Mode) and for analytics purposes. You can disable cookies in your browser settings if you prefer.</li>
            </ul>

            <h2>3. Third-Party Services</h2>
            <p>We may use third-party services for analytics and advertising:</p>
            <ul>
              <li><strong>Google Analytics:</strong> To understand site traffic and usage.</li>
              <li><strong>Google AdSense:</strong> To display relevant advertisements. Google may use cookies to serve ads based on your prior visits to our website or other websites.</li>
            </ul>

            <h2>4. Data Security</h2>
            <p>Since your files are processed locally, the security of your data depends on the security of your own device and browser. We recommend keeping your browser updated to the latest version for the best security and performance.</p>

            <h2>5. Changes to This Policy</h2>
            <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.</p>

            <h2>6. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us at <a href="mailto:privacy@sohelix.com">privacy@sohelix.com</a>.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
