import React from 'react';
import { SEO } from '../components/SEO';
import { Shield, Zap, MousePointer2, Smartphone, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

export const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-16">
      <SEO 
        title="About Us - Sohelix Free Online Tools"
        description="Learn about Sohelix's mission to provide fast, free, and privacy-focused online tools for images, PDFs, and everyday digital tasks."
      />

      <div className="container mx-auto px-4 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-6 tracking-tight"
          >
            About Us
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
          >
            We provide simple, fast, and free online tools to help you solve everyday digital problems.
          </motion.p>
        </div>

        {/* What We Do */}
        <div className="bg-white dark:bg-gray-900 p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 mb- aggregation-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">What We Do</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg">
            Sohelix offers a wide range of browser-based utilities for images, PDFs, and general digital tasks. 
            Whether you need to resize a photo, merge documents, or convert data formats, our tools work 
            directly in your browser. This means you skip the hassle of software installations and 
            processing is done instantly where you are.
          </p>
        </div>

        {/* Our Mission */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Our Mission</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg italic border-l-4 border-blue-500 pl-6 py-2">
            "Our mission is to make powerful tools accessible to everyone — without complexity, cost, or unnecessary steps."
          </p>
        </div>

        {/* Why Choose Us */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {[
            { icon: <Zap className="h-6 w-6" />, title: "Fast and Easy", text: "Process your files in seconds with a few simple clicks." },
            { icon: <MousePointer2 className="h-6 w-6" />, title: "No Signup Required", text: "Start using any tool immediately without creating an account." },
            { icon: <Smartphone className="h-6 w-6" />, title: "Works on All Devices", text: "Optimized for desktop, tablet, and mobile browsers." },
            { icon: <CheckCircle2 className="h-6 w-6" />, title: "Simple Interface", text: "A clean, distraction-free design focused on the task at hand." }
          ].map((item, index) => (
            <div key={index} className="flex gap-4 bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800">
              <div className="flex-shrink-0 text-blue-600 dark:text-blue-400">{item.icon}</div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-1">{item.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{item.text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Privacy & Trust */}
        <div className="bg-blue-50 dark:bg-blue-900/10 p-8 md:p-12 rounded-3xl border border-blue-100 dark:border-blue-900/20 mb-16">
          <div className="flex items-center gap-3 mb-4 text-blue-700 dark:text-blue-300">
            <Shield className="h-8 w-8" />
            <h2 className="text-2xl font-bold">Privacy & Trust</h2>
          </div>
          <p className="text-blue-900 dark:text-blue-200 text-lg leading-relaxed font-medium">
            We respect your privacy. Your files are not stored permanently and are automatically deleted 
            after processing. We do not sell or share your data. Your confidence is the core of our service.
          </p>
        </div>

        {/* Simple Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-16 text-center">
          {[
            { label: "100% Free Tools" },
            { label: "Fast Processing" },
            { label: "Privacy Focused" }
          ].map((stat, index) => (
            <div key={index} className="bg-gray-100/50 dark:bg-gray-800/30 p-6 rounded-2xl">
              <p className="text-gray-900 dark:text-white font-black text-xl">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Closing & Contact */}
        <div className="text-center space-y-6">
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            We are continuously improving and adding new tools to make your work easier.
          </p>
          <div className="pt-8 border-t border-gray-100 dark:border-gray-800">
            <p className="text-gray-500 dark:text-gray-400">
              If you have feedback or suggestions, feel free to contact us at:
              <br />
              <a href="mailto:sohelix.contact@gmail.com" className="text-blue-600 font-bold hover:underline text-lg">
                sohelix.contact@gmail.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
