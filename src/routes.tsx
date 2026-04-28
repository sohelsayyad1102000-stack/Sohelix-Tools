import React, { lazy, Suspense } from 'react';
import { RouteObject, Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const Home = lazy(() => import('./pages/Home').then(m => ({ default: m.Home })));
const ToolPage = lazy(() => import('./pages/ToolPage').then(m => ({ default: m.ToolPage })));
const CategoryPage = lazy(() => import('./pages/CategoryPage').then(m => ({ default: m.CategoryPage })));
const About = lazy(() => import('./pages/About').then(m => ({ default: m.About })));
const Contact = lazy(() => import('./pages/Contact').then(m => ({ default: m.Contact })));
const FAQ = lazy(() => import('./pages/FAQ').then(m => ({ default: m.FAQ })));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy').then(m => ({ default: m.PrivacyPolicy })));
const Terms = lazy(() => import('./pages/Terms').then(m => ({ default: m.Terms })));
const Disclaimer = lazy(() => import('./pages/Disclaimer').then(m => ({ default: m.Disclaimer })));
const Blog = lazy(() => import('./pages/Blog').then(m => ({ default: m.Blog })));
const BlogPost = lazy(() => import('./pages/BlogPost').then(m => ({ default: m.BlogPost })));
const OGPreview = lazy(() => import('./components/OGPreview').then(m => ({ default: m.OGPreview })));

const SuspenseWrapper = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={
    <div className="flex h-[400px] w-full items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
    </div>
  }>
    {children}
  </Suspense>
);

export const routes: RouteObject[] = [
  { path: '/', element: <SuspenseWrapper><Home /></SuspenseWrapper> },
  { path: '/categories/:slug', element: <SuspenseWrapper><CategoryPage /></SuspenseWrapper> },
  { path: '/tools/:slug', element: <SuspenseWrapper><ToolPage /></SuspenseWrapper> },
  
  // Programmatic SEO Routes for Resize Image
  { path: '/resize-image-to-100x100', element: <SuspenseWrapper><ToolPage slug="resize-image" /></SuspenseWrapper> },
  { path: '/resize-image-to-600x600', element: <SuspenseWrapper><ToolPage slug="resize-image" /></SuspenseWrapper> },
  { path: '/resize-image-for-instagram', element: <SuspenseWrapper><ToolPage slug="resize-image" /></SuspenseWrapper> },
  { path: '/resize-image-for-passport', element: <SuspenseWrapper><ToolPage slug="resize-image" /></SuspenseWrapper> },
  { path: '/resize-image-in-cm', element: <SuspenseWrapper><ToolPage slug="resize-image" /></SuspenseWrapper> },
  { path: '/resize-image-in-mm', element: <SuspenseWrapper><ToolPage slug="resize-image" /></SuspenseWrapper> },
  { path: '/resize-image-in-inch', element: <SuspenseWrapper><ToolPage slug="resize-image" /></SuspenseWrapper> },

  // Programmatic SEO Routes for Crop Image
  { path: '/crop-image-circle', element: <SuspenseWrapper><ToolPage slug="crop-image" /></SuspenseWrapper> },
  { path: '/crop-image-square', element: <SuspenseWrapper><ToolPage slug="crop-image" /></SuspenseWrapper> },
  { path: '/crop-image-16x9', element: <SuspenseWrapper><ToolPage slug="crop-image" /></SuspenseWrapper> },
  { path: '/crop-image-for-passport', element: <SuspenseWrapper><ToolPage slug="crop-image" /></SuspenseWrapper> },
  { path: '/crop-image-for-instagram', element: <SuspenseWrapper><ToolPage slug="crop-image" /></SuspenseWrapper> },
  { path: '/crop-image-for-youtube-thumbnail', element: <SuspenseWrapper><ToolPage slug="crop-image" /></SuspenseWrapper> },
  { path: '/crop-image-circle-online', element: <SuspenseWrapper><ToolPage slug="crop-image" /></SuspenseWrapper> },

  // Programmatic SEO Routes for JPG to PNG
  { path: '/jpg-to-png-100kb', element: <SuspenseWrapper><ToolPage slug="jpg-to-png" /></SuspenseWrapper> },
  { path: '/jpg-to-png-for-web', element: <SuspenseWrapper><ToolPage slug="jpg-to-png" /></SuspenseWrapper> },
  { path: '/jpg-to-png-transparent', element: <SuspenseWrapper><ToolPage slug="jpg-to-png" /></SuspenseWrapper> },
  { path: '/jpg-to-png-high-quality', element: <SuspenseWrapper><ToolPage slug="jpg-to-png" /></SuspenseWrapper> },

  // Programmatic SEO Routes for WebP Converter
  { path: '/jpg-to-webp', element: <SuspenseWrapper><ToolPage slug="webp-converter" /></SuspenseWrapper> },
  { path: '/png-to-webp', element: <SuspenseWrapper><ToolPage slug="webp-converter" /></SuspenseWrapper> },
  { path: '/convert-to-webp-lossless', element: <SuspenseWrapper><ToolPage slug="webp-converter" /></SuspenseWrapper> },
  { path: '/optimize-images-for-web', element: <SuspenseWrapper><ToolPage slug="webp-converter" /></SuspenseWrapper> },

  // Programmatic SEO Routes for BMI Calculator
  { path: '/bmi-calculator-for-men', element: <SuspenseWrapper><ToolPage slug="bmi-calculator" /></SuspenseWrapper> },
  { path: '/bmi-calculator-for-women', element: <SuspenseWrapper><ToolPage slug="bmi-calculator" /></SuspenseWrapper> },
  { path: '/bmi-calculator-india', element: <SuspenseWrapper><ToolPage slug="bmi-calculator" /></SuspenseWrapper> },
  { path: '/ideal-weight-calculator', element: <SuspenseWrapper><ToolPage slug="ideal-weight-calculator" /></SuspenseWrapper> },
  { path: '/calorie-calculator-for-weight-loss', element: <SuspenseWrapper><ToolPage slug="calorie-calculator" /></SuspenseWrapper> },
  { path: '/bmr-calculator-for-men', element: <SuspenseWrapper><ToolPage slug="bmr-calculator" /></SuspenseWrapper> },
  { path: '/body-fat-percentage-calculator', element: <SuspenseWrapper><ToolPage slug="body-fat-calculator" /></SuspenseWrapper> },

  // Programmatic SEO Routes for PDF to Word
  { path: '/pdf-to-word-without-software', element: <SuspenseWrapper><ToolPage slug="pdf-to-word" /></SuspenseWrapper> },
  { path: '/ocr-pdf-to-word-online', element: <SuspenseWrapper><ToolPage slug="pdf-to-word" /></SuspenseWrapper> },
  { path: '/convert-pdf-to-docx-free', element: <SuspenseWrapper><ToolPage slug="pdf-to-word" /></SuspenseWrapper> },

  { path: '/blog', element: <SuspenseWrapper><Blog /></SuspenseWrapper> },
  { path: '/blog/:slug', element: <SuspenseWrapper><BlogPost /></SuspenseWrapper> },
  
  // SEO Redirects
  { path: '/advanced-loan-mortgage-calculator', element: <Navigate to="/tools/advanced-loan-calculator" replace /> },
  { path: '/tools/advanced-loan-mortgage-calculator', element: <Navigate to="/tools/advanced-loan-calculator" replace /> },

  { path: '/about', element: <SuspenseWrapper><About /></SuspenseWrapper> },
  { path: '/contact', element: <SuspenseWrapper><Contact /></SuspenseWrapper> },
  { path: '/faq', element: <SuspenseWrapper><FAQ /></SuspenseWrapper> },
  { path: '/privacy-policy', element: <SuspenseWrapper><PrivacyPolicy /></SuspenseWrapper> },
  { path: '/terms', element: <SuspenseWrapper><Terms /></SuspenseWrapper> },
  { path: '/disclaimer', element: <SuspenseWrapper><Disclaimer /></SuspenseWrapper> },
  { path: '/admin/og-generator', element: <SuspenseWrapper><OGPreview /></SuspenseWrapper> },
];
