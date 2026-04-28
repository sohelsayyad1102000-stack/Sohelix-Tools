import React from 'react';
import { SEO } from '../components/SEO';
import { Shield, Zap, MousePointer2, Smartphone, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

export const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-16">
      <SEO 
        title="About Sohelix - Our Mission and Story"
        description="Learn about the story behind Sohelix, our commitment to digital privacy, and why we build free online tools for everyone."
      />

      <div className="container mx-auto px-4 max-w-4xl">
        {/* Story Section */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-block px-4 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-widest mb-6"
          >
            Our Story
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-6 tracking-tight"
          >
            Tools Built for <span className="text-blue-600">Privacy</span> and Speed
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed"
          >
            Sohelix was founded on a simple belief: the tools you use every day shouldn't compromise your privacy or your wallet.
          </motion.p>
        </div>

        {/* The Problem & Solution */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Why Sohelix Exists</h2>
            <div className="space-y-4 text-gray-600 dark:text-gray-400 leading-relaxed text-lg">
              <p>
                As digital creators and developers, we were tired of "free" online tools that forced you to upload sensitive files to their servers, limited your usage, or bombarded you with intrusive ads.
              </p>
              <p>
                We built <strong>Sohelix</strong> to be different. Our platform provides professional-grade utilities for images, PDFs, and data conversion that run 100% in your browser.
              </p>
              <p>
                By using cutting-edge client-side technology, your files never leave your device. We don't see them, we don't store them, and we certainly don't sell them.
              </p>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/50 dark:shadow-none">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Our Core Principles</h3>
            <ul className="space-y-6">
              {[
                { title: "Privacy First", text: "Processing happens locally on your computer. No uploads." },
                { title: "Universal Access", text: "Free for everyone, forever. No subscriptions or signups." },
                { title: "Speed Redefined", text: "No waiting for server uploads or processing queues." },
                { title: "Simplicity", text: "Crafted interfaces focused on getting the job done fast." }
              ].map((p, i) => (
                <li key={i} className="flex gap-4">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-500 flex items-center justify-center">
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white text-sm">{p.title}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{p.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Who is behind it */}
        <div className="bg-blue-600 rounded-3xl p-8 md:p-12 text-white mb-20 relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-6">The Creator's Vision</h2>
            <p className="text-blue-100 text-lg leading-relaxed mb-8">
              "Sohelix (formerly sohelix.com) started as a small internal project to help our team optimize web assets faster. We quickly realized that the need for secure, browser-based tools was universal. Today, Sohelix serves thousands of users daily, from web developers and students to photographers and office administrators."
            </p>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center font-bold text-xl border-2 border-blue-400">
                S
              </div>
              <div>
                <p className="font-bold">Sohel Sayyid</p>
                <p className="text-blue-300 text-sm">Founder & Technical Lead</p>
              </div>
            </div>
          </div>
          {/* Abstract background elements */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-blue-500 opacity-20 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-64 w-64 rounded-full bg-blue-400 opacity-20 blur-3xl"></div>
        </div>

        {/* How We Sustain It */}
        <div className="text-center mb-20">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">How We Sustain Sohelix</h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-3xl mx-auto leading-relaxed">
            Maintaining a high-quality platform with over 60 tools takes time and resources. To keep Sohelix free for everyone without compromising privacy, we rely on non-intrusive advertising and community support. This allows us to pay for server costs and continue developing new features.
          </p>
        </div>

        {/* Contact Info */}
        <div className="border-t border-gray-100 dark:border-gray-800 pt-12 text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-4">Have questions or want to collaborate?</p>
          <a 
            href="mailto:sohelix.contact@gmail.com" 
            className="text-2xl font-black text-gray-900 dark:text-white hover:text-blue-600 transition-colors"
          >
            sohelix.contact@gmail.com
          </a>
        </div>
      </div>
    </div>
  );
};
