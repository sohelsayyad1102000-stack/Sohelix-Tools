import React from 'react';
import { SEO } from '../components/SEO';

export const Terms = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12">
      <SEO 
        title="Terms of Service - Sohelix"
        description="Read the terms and conditions for using Sohelix's free online tools."
      />

      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white dark:bg-gray-900 p-8 md:p-12 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800">
          <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-8 tracking-tight">Terms of Service</h1>
          
          <div className="prose prose-blue dark:prose-invert max-w-none">
            <p className="text-lg text-gray-600 dark:text-gray-400">Last Updated: April 14, 2026</p>
            
            <p>By accessing and using Sohelix, you agree to comply with and be bound by the following terms and conditions.</p>

            <h2>1. Acceptance of Terms</h2>
            <p>By using our website and tools, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. If you do not agree, please do not use our services.</p>

            <h2>2. Description of Service</h2>
            <p>Sohelix provides a collection of free online image processing and utility tools. These tools are provided "as is" and are intended for personal and professional use. We reserve the right to modify or discontinue any tool or feature at any time without notice.</p>

            <h2>3. User Responsibilities</h2>
            <p>You are solely responsible for the files you process using our tools. You agree not to use Sohelix for any illegal or unauthorized purpose, including but not limited to:</p>
            <ul>
              <li>Processing content that violates copyright or intellectual property rights.</li>
              <li>Distributing malicious software or harmful content.</li>
              <li>Attempting to interfere with the proper functioning of the website.</li>
            </ul>

            <h2>4. Intellectual Property</h2>
            <p>The design, code, and content of Sohelix are protected by copyright and other intellectual property laws. You may not reproduce, distribute, or create derivative works from our site without explicit permission.</p>

            <h2>5. Disclaimer of Warranties</h2>
            <p>Sohelix is provided on an "as is" and "as available" basis. We make no warranties, expressed or implied, regarding the accuracy, reliability, or availability of our tools. Use of our services is at your own risk.</p>

            <h2>6. Limitation of Liability</h2>
            <p>In no event shall Sohelix or its creators be liable for any direct, indirect, incidental, or consequential damages arising out of the use or inability to use our tools, even if we have been advised of the possibility of such damages.</p>

            <h2>7. Governing Law</h2>
            <p>These terms shall be governed by and construed in accordance with the laws of the jurisdiction in which the creators of Sohelix reside, without regard to its conflict of law provisions.</p>

            <h2>8. Contact</h2>
            <p>If you have any questions about these Terms, please contact us at <a href="mailto:terms@sohelix.com">terms@sohelix.com</a>.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
