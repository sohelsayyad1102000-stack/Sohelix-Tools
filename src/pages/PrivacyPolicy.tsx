import React from 'react';
import { SEO } from '../components/SEO';

export const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8">
      <SEO 
        title="Privacy Policy - Sohelix"
        description="Learn how Sohelix protects your privacy. We offer transparent file handling, automatic deletion, and secure processing for all our online tools."
      />

      <div className="container mx-auto max-w-4xl">
        <div className="bg-white dark:bg-gray-900 p-8 md:p-12 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800">
          <header className="mb-12 border-b border-gray-100 dark:border-gray-800 pb-8">
            <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">Privacy Policy</h1>
            <p className="text-gray-500 dark:text-gray-400">Last Updated: April 16, 2026</p>
          </header>
          
          <div className="prose prose-blue dark:prose-invert max-w-none space-y-8">
            {/* Trust Statement */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-2xl border border-blue-100 dark:border-blue-900/30">
              <p className="text-blue-900 dark:text-blue-200 font-semibold m-0 italic">
                "Your files NEVER leave your device. All processing is done locally in your browser for 100% privacy and security."
              </p>
            </div>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">1. Privacy Overview</h2>
              <p>
                At Sohelix, your privacy is our top priority. We provide over 60 utility tools—including image tools, PDF converters, and SEO utilities—designed with a "100% Client-Side" approach. This means your files are processed directly in your browser and are never uploaded to our servers.
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li><strong>No Server Uploads:</strong> Unlike other tools, Sohelix does not require you to upload your sensitive files to a remote server. Everything stays on your device.</li>
                <li><strong>Browser-Based Processing:</strong> We use modern web technologies (WebAssembly, Canvas, and JavaScript) to perform all calculations and conversions locally.</li>
                <li><strong>Total Privacy:</strong> Since your data never leaves your computer, it is physically impossible for us or any third party to view, store, or intercept your files.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">2. File Handling Policy</h2>
              <p>
                Because our tools operate locally, our file handling policy is simple:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li><strong>Zero Data Retention:</strong> We do not have a "deletion period" because we never receive your files in the first place.</li>
                <li><strong>No Manual Access:</strong> It is impossible for our team to access your files.</li>
                <li><strong>Self-Contained Workflow:</strong> Once you close the tab, all temporary memory used by the tool to process your file is cleared by your browser.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">3. Data Collection</h2>
              <p>
                While we respect your files, we collect certain non-personal data to maintain and improve our service:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li><strong>Basic Analytics:</strong> We collect technical information such as browser type, device type, and general usage patterns (e.g., which tools are used most frequently).</li>
                <li><strong>Cookies:</strong> Small data files used to remember your preferences (like interface theme) and assist with analytics.</li>
                <li><strong>Strict Exclusion:</strong> No personal file content or sensitive metadata is ever stored permanently.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">4. Third-Party Services</h2>
              <p>
                We partner with trusted service providers to enhance your experience:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li><strong>Google Analytics:</strong> Helps us understand how users interact with our site so we can improve the tools.</li>
                <li><strong>Advertising Partners:</strong> We may display ads to keep our tools free. These partners may use cookies to serve relevant advertisements based on your visits.</li>
                <li><strong>No Selling:</strong> We never sell, trade, or rent your personal information or uploaded data to third parties.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">5. Cookies Policy</h2>
              <p>
                Cookies are small files placed on your device to help us provide a better service. We use them primarily for:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>Managing your session and preferences.</li>
                <li>Analyzing visitor traffic.</li>
              </ul>
              <p className="mt-4">
                You have the choice to accept or decline cookies. Most web browsers automatically accept cookies, but you can usually modify your browser settings to decline them if you prefer.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">6. Data Security</h2>
              <p>
                We implement robust security measures to protect your information:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li><strong>HTTPS Encryption:</strong> All communication between your device and our servers is encrypted.</li>
                <li><strong>Secure Servers:</strong> Our infrastructure is hosted on secure, professionally managed data centers.</li>
                <li><strong>Limited Access:</strong> Access to our systems is strictly controlled and limited to essential administrative tasks.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">7. User Control & Rights</h2>
              <p>
                You maintain full control over your interaction with Sohelix:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li><strong>Stop Anytime:</strong> You can stop using our services at any time.</li>
                <li><strong>Data Disposal:</strong> Since we do not store personal account data or permanent files, simply closing your session and waiting for the 1-hour deletion window ensures your data is gone.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">8. External Links Disclaimer</h2>
              <p>
                Our website may contain links to other websites or tools that are not operated by us. We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party sites or services. We encourage you to review the privacy policy of every site you visit.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">9. Policy Updates</h2>
              <p>
                We may update our Privacy Policy periodically to reflect changes in our practices or legal requirements. We encourage users to check this page frequently for any changes. Your continued use of the site after any change in this Privacy Policy will constitute your acceptance of such change.
              </p>
            </section>

            <section className="bg-gray-50 dark:bg-gray-800/50 p-8 rounded-3xl border border-gray-100 dark:border-gray-800">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">10. Contact Information</h2>
              <p>
                For any privacy-related questions or concerns, users can contact us at:
              </p>
              <p className="mt-4">
                <span className="font-bold text-gray-900 dark:text-white">Email: </span>
                <a href="mailto:sohelix.contact@gmail.com" className="text-blue-600 font-bold hover:underline">sohelix.contact@gmail.com</a>
              </p>
              <p className="mt-2 text-gray-600 dark:text-gray-400 italic">
                "For any privacy-related questions or concerns, users can contact us at the above email."
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};
