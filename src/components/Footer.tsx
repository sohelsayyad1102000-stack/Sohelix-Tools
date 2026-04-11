import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Github, Twitter, Mail } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                <Zap className="h-5 w-5 fill-current" />
              </div>
              <span className="text-lg font-bold text-gray-900 dark:text-white">Sohelix</span>
            </Link>
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              Free online image tools for everyone. Fast, secure, and 100% client-side.
            </p>
            <div className="mt-6 flex gap-4">
              <Twitter className="h-5 w-5 cursor-pointer text-gray-400 hover:text-blue-400" />
              <Github className="h-5 w-5 cursor-pointer text-gray-400 hover:text-gray-900 dark:hover:text-white" />
              <Mail className="h-5 w-5 cursor-pointer text-gray-400 hover:text-red-400" />
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900 dark:text-white">Popular Tools</h3>
            <ul className="mt-4 space-y-2">
              <li><Link to="/tools/compress-image" className="text-sm text-gray-500 hover:text-blue-600 dark:text-gray-400">Compress Image</Link></li>
              <li><Link to="/tools/resize-image" className="text-sm text-gray-500 hover:text-blue-600 dark:text-gray-400">Resize Image</Link></li>
              <li><Link to="/tools/crop-image" className="text-sm text-gray-500 hover:text-blue-600 dark:text-gray-400">Crop Image</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900 dark:text-white">Company</h3>
            <ul className="mt-4 space-y-2">
              <li><Link to="/" className="text-sm text-gray-500 hover:text-blue-600 dark:text-gray-400">About Us</Link></li>
              <li><Link to="/" className="text-sm text-gray-500 hover:text-blue-600 dark:text-gray-400">Privacy Policy</Link></li>
              <li><Link to="/" className="text-sm text-gray-500 hover:text-blue-600 dark:text-gray-400">Terms of Service</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900 dark:text-white">Support</h3>
            <ul className="mt-4 space-y-2">
              <li><Link to="/" className="text-sm text-gray-500 hover:text-blue-600 dark:text-gray-400">Help Center</Link></li>
              <li><Link to="/" className="text-sm text-gray-500 hover:text-blue-600 dark:text-gray-400">Contact Us</Link></li>
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
