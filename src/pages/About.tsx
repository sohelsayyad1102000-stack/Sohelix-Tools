import React from 'react';
import { SEO } from '../components/SEO';
import { Zap, Shield, Lock, MousePointer2, Globe, Heart } from 'lucide-react';
import { motion } from 'motion/react';

export const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-16">
      <SEO 
        title="About Us - Sohelix Free Online Image Tools"
        description="Learn about Sohelix, our mission, and why we provide 100% free, client-side, secure image processing tools for everyone."
      />

      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center justify-center p-4 bg-blue-100 dark:bg-blue-900/30 rounded-2xl mb-6 text-blue-600 dark:text-blue-400"
          >
            <Zap className="h-10 w-10" />
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white mb-6 tracking-tight">
            About Sohelix
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Empowering creators with fast, secure, and 100% free online image and utility tools.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3 mb-4 text-blue-600 dark:text-blue-400">
              <Globe className="h-6 w-6" />
              <h2 className="text-2xl font-bold">What is Sohelix?</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Sohelix is a comprehensive suite of online image processing tools designed to make your digital life easier. Whether you are a web developer optimizing assets, a photographer resizing images, or just someone who needs to quickly convert a file format, Sohelix provides the tools you need directly in your browser.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3 mb-4 text-purple-600 dark:text-purple-400">
              <Heart className="h-6 w-6" />
              <h2 className="text-2xl font-bold">Our Mission</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Our mission is to democratize access to high-quality digital tools. We believe that basic image manipulation shouldn't require expensive software subscriptions or compromising your privacy. Our vision is to build the most reliable, fastest, and most secure client-side toolset on the web.
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-8 md:p-12 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">Why Trust Us?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                <Lock className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">Zero Uploads</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">We don't have access to your files. Your privacy is guaranteed by our architecture.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                <Zap className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">Lightning Fast</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">No waiting for uploads or downloads. Processing happens instantly on your device.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">Always Free</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">No hidden fees, no watermarks, and no usage limits. We believe in an open web.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                <MousePointer2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">No Registration</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Start using our tools immediately. We don't ask for your personal information.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="prose prose-blue dark:prose-invert max-w-none text-center">
          <p className="text-lg">
            Thank you for choosing Sohelix. We are dedicated to continuously improving our platform to serve you better. 
            If you have any suggestions or need a specific tool, feel free to reach out to us through our <a href="/contact" className="text-blue-600 font-bold hover:underline">contact page</a>.
          </p>
        </div>
      </div>
    </div>
  );
};
