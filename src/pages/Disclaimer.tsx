import React from 'react';
import { SEO } from '../components/SEO';
import { AlertTriangle } from 'lucide-react';

export const Disclaimer: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12">
      <SEO 
        title="Disclaimer - Sohelix"
        description="Important legal disclaimer regarding the use of Sohelix tools and information."
        noindex={true}
      />

      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white dark:bg-gray-900 p-8 md:p-12 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl text-amber-600 dark:text-amber-400">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">Disclaimer</h1>
          </div>
          
          <div className="prose prose-blue dark:prose-invert max-w-none">
            <p className="text-lg text-gray-600 dark:text-gray-400">Last Updated: April 16, 2026</p>
            
            <p>The information provided by Sohelix ("we," "us," or "our") on our website is for general informational purposes only. All information on the site is provided in good faith, however we make no representation or warranty of any kind, express or implied, regarding the accuracy, adequacy, validity, reliability, availability, or completeness of any information on the site.</p>

            <h2>1. No Professional Advice</h2>
            <p>The tools and information provided by Sohelix do not constitute professional advice (e.g., legal, financial, or technical). Use of our tools is at your own discretion and risk.</p>

            <h2>2. External Links Disclaimer</h2>
            <p>Our website may contain links to other websites or content belonging to or originating from third parties. Such external links are not investigated, monitored, or checked for accuracy, adequacy, validity, reliability, availability, or completeness by us.</p>

            <h2>3. Errors and Omissions Disclaimer</h2>
            <p>While we strive to ensure that the information and tools provided on this site are accurate and up-to-date, Sohelix is not responsible for any errors or omissions, or for the results obtained from the use of this information.</p>

            <h2>4. "Use at Your Own Risk" Disclaimer</h2>
            <p>Under no circumstance shall we have any liability to you for any loss or damage of any kind incurred as a result of the use of the site or reliance on any information provided on the site. Your use of the site and your reliance on any information on the site is solely at your own risk.</p>

            <h2>5. Contact Us</h2>
            <p>If you require any more information or have any questions about our site's disclaimer, please feel free to contact us by email at <a href="mailto:sohelix.contact@gmail.com">sohelix.contact@gmail.com</a>.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
