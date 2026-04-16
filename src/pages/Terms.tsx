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
            <p className="text-lg text-gray-600 dark:text-gray-400">Last Updated: April 16, 2026</p>
            
            <p>By accessing and using Sohelix, you agree to comply with and be bound by the following terms and conditions.</p>

            <h2>1. Acceptance of Terms</h2>
            <p>By using our website and tools, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. If you do not agree, please do not use our services.</p>

            <h2>2. Description of Service</h2>
            <p>Sohelix provides a collection of free online image processing and utility tools. These tools are provided "as is" and are intended for personal and professional use. We reserve the right to modify, interrupt, or discontinue any tool or feature at any time without notice. We do not guarantee uptime or error-free operation.</p>

            <h2>3. File Usage and Data Processing</h2>
            <p>Users can upload files for processing through our tools. These files are processed automatically by the system and are NOT stored permanently. All uploaded files are automatically deleted after a short period (typically within 1 hour or less). You are fully responsible for keeping and backing up your files after download; we do not guarantee storage, backup, or recovery of any uploaded data. <strong>All uploaded files are automatically deleted after processing. We do not store or manually access user files.</strong></p>

            <h2>4. User Responsibilities</h2>
            <p>You are fully responsible for the files you process using our tools and the content you upload. You agree not to use Sohelix for any illegal or unauthorized purpose, including but not limited to:</p>
            <ul>
              <li>Processing content that violates copyright or intellectual property rights without proper permission.</li>
              <li>Uploading or distributing illegal, harmful, or malicious files.</li>
              <li>Attempting to interfere with the proper functioning of the website.</li>
            </ul>
            <p>The platform is not responsible for any misuse of the services or the resulting processed content.</p>

            <h2>5. Intellectual Property</h2>
            <p>The design, code, and content of Sohelix are protected by copyright and other intellectual property laws. You may not reproduce, distribute, or create derivative works from our site without explicit permission.</p>

            <h2>6. Disclaimer of Warranties</h2>
            <p>Sohelix is provided on an "as is" and "as available" basis. We make no warranties, expressed or implied, regarding the accuracy, reliability, or availability of our tools. No guarantee of results, success, or accuracy is provided. Use of our services is at your own risk.</p>

            <h2>7. Limitation of Liability</h2>
            <p>In no event shall Sohelix or its creators be liable for any direct, indirect, incidental, or consequential damages arising out of the use or inability to use our tools, even if we have been advised of the possibility of such damages. This includes, but is not limited to, liability for data loss, file corruption, or incorrect outputs.</p>

            <h2>8. Third-Party Services</h2>
            <p>Some tools or features may rely on third-party services for processing or functionality. We are not responsible for the performance, reliability, or policies of these third-party providers.</p>

            <h2>9. Governing Law</h2>
            <p>These terms shall be governed by and construed in accordance with the laws of the jurisdiction in which the creators of Sohelix reside, without regard to its conflict of law provisions.</p>

            <h2>10. Contact</h2>
            <p>If you have any questions about these Terms, please contact us at <a href="mailto:sohelix.contact@gmail.com">sohelix.contact@gmail.com</a>. For any questions regarding these Terms, contact us at the above email.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
