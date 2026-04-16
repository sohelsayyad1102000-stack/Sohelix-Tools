import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Github, Twitter, Mail } from 'lucide-react';
import { TOOLS } from '../constants/tools';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-5">
          <div className="col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                <Zap className="h-5 w-5 fill-current" />
              </div>
              <span className="text-lg font-bold text-gray-900 dark:text-white">Sohelix</span>
            </Link>
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              Free online tools for everyone. Fast, secure, and 100% client-side.
            </p>
            <div className="mt-6 flex gap-4">
              <Twitter className="h-5 w-5 cursor-pointer text-gray-400 hover:text-blue-400" />
              <Github className="h-5 w-5 cursor-pointer text-gray-400 hover:text-gray-900 dark:hover:text-white" />
              <Mail className="h-5 w-5 cursor-pointer text-gray-400 hover:text-red-400" />
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900 dark:text-white">Quick Links</h3>
            <ul className="mt-4 space-y-2">
              <li><Link to="/" className="text-sm text-gray-500 hover:text-blue-600 dark:text-gray-400">Home</Link></li>
              <li><Link to="/blog" className="text-sm text-gray-500 hover:text-blue-600 dark:text-gray-400">Blog</Link></li>
              <li><Link to="/about" className="text-sm text-gray-500 hover:text-blue-600 dark:text-gray-400">About</Link></li>
              <li><Link to="/contact" className="text-sm text-gray-500 hover:text-blue-600 dark:text-gray-400">Contact</Link></li>
              <li><Link to="/faq" className="text-sm text-gray-500 hover:text-blue-600 dark:text-gray-400">FAQ</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900 dark:text-white">Categories</h3>
            <ul className="mt-4 space-y-2">
              <li><Link to="/categories/image-tools" className="text-sm text-gray-500 hover:text-blue-600 dark:text-gray-400">Image Tools</Link></li>
              <li><Link to="/categories/pdf-tools" className="text-sm text-gray-500 hover:text-blue-600 dark:text-gray-400">PDF Tools</Link></li>
              <li><Link to="/categories/calculator-tools" className="text-sm text-gray-500 hover:text-blue-600 dark:text-gray-400">Calculator Tools</Link></li>
              <li><Link to="/categories/seo-tools" className="text-sm text-gray-500 hover:text-blue-600 dark:text-gray-400">SEO Tools</Link></li>
              <li><Link to="/categories/text-tools" className="text-sm text-gray-500 hover:text-blue-600 dark:text-gray-400">Text Tools</Link></li>
              <li><Link to="/categories/utilities" className="text-sm text-gray-500 hover:text-blue-600 dark:text-gray-400">Utility Tools</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900 dark:text-white">Popular Tools</h3>
            <ul className="mt-4 space-y-2">
              {TOOLS.slice(0, 4).map(tool => (
                <li key={tool.id}>
                  <Link to={`/tools/${tool.slug}`} className="text-sm text-gray-500 hover:text-blue-600 dark:text-gray-400">
                    {tool.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900 dark:text-white">Legal</h3>
            <ul className="mt-4 space-y-2">
              <li><Link to="/privacy-policy" className="text-sm text-gray-500 hover:text-blue-600 dark:text-gray-400">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-sm text-gray-500 hover:text-blue-600 dark:text-gray-400">Terms of Service</Link></li>
              <li><Link to="/disclaimer" className="text-sm text-gray-500 hover:text-blue-600 dark:text-gray-400">Disclaimer</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-gray-100 pt-8 dark:border-gray-800">
          <p className="text-center text-xs text-gray-400">
            &copy; {new Date().getFullYear()} Sohelix. All rights reserved. Built with privacy in mind.
          </p>
        </div>
      </div>
    </footer>
  );
};
