import React from 'react';
import { RouteObject } from 'react-router-dom';
import { Home } from './pages/Home';
import { ToolPage } from './pages/ToolPage';
import { CategoryPage } from './pages/CategoryPage';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { FAQ } from './pages/FAQ';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { Terms } from './pages/Terms';
import { Disclaimer } from './pages/Disclaimer';
import { Blog } from './pages/Blog';
import { BlogPost } from './pages/BlogPost';
import { OGPreview } from './components/OGPreview';

export const routes: RouteObject[] = [
  { path: '/', element: <Home /> },
  { path: '/categories/:slug', element: <CategoryPage /> },
  { path: '/tools/:slug', element: <ToolPage /> },
  
  // Programmatic SEO Routes for Resize Image
  { path: '/resize-image-to-100x100', element: <ToolPage slug="resize-image" /> },
  { path: '/resize-image-to-600x600', element: <ToolPage slug="resize-image" /> },
  { path: '/resize-image-for-instagram', element: <ToolPage slug="resize-image" /> },
  { path: '/resize-image-for-passport', element: <ToolPage slug="resize-image" /> },
  { path: '/resize-image-in-cm', element: <ToolPage slug="resize-image" /> },
  { path: '/resize-image-in-mm', element: <ToolPage slug="resize-image" /> },
  { path: '/resize-image-in-inch', element: <ToolPage slug="resize-image" /> },

  // Programmatic SEO Routes for Crop Image
  { path: '/crop-image-circle', element: <ToolPage slug="crop-image" /> },
  { path: '/crop-image-square', element: <ToolPage slug="crop-image" /> },
  { path: '/crop-image-16x9', element: <ToolPage slug="crop-image" /> },
  { path: '/crop-image-for-passport', element: <ToolPage slug="crop-image" /> },
  { path: '/crop-image-for-instagram', element: <ToolPage slug="crop-image" /> },
  { path: '/crop-image-for-youtube-thumbnail', element: <ToolPage slug="crop-image" /> },
  { path: '/crop-image-circle-online', element: <ToolPage slug="crop-image" /> },

  // Programmatic SEO Routes for JPG to PNG
  { path: '/jpg-to-png-100kb', element: <ToolPage slug="jpg-to-png" /> },
  { path: '/jpg-to-png-for-web', element: <ToolPage slug="jpg-to-png" /> },
  { path: '/jpg-to-png-transparent', element: <ToolPage slug="jpg-to-png" /> },
  { path: '/jpg-to-png-high-quality', element: <ToolPage slug="jpg-to-png" /> },

  // Programmatic SEO Routes for WebP Converter
  { path: '/jpg-to-webp', element: <ToolPage slug="webp-converter" /> },
  { path: '/png-to-webp', element: <ToolPage slug="webp-converter" /> },
  { path: '/convert-to-webp-lossless', element: <ToolPage slug="webp-converter" /> },
  { path: '/optimize-images-for-web', element: <ToolPage slug="webp-converter" /> },

  // Programmatic SEO Routes for BMI Calculator
  { path: '/bmi-calculator-for-men', element: <ToolPage slug="bmi-calculator" /> },
  { path: '/bmi-calculator-for-women', element: <ToolPage slug="bmi-calculator" /> },
  { path: '/bmi-calculator-india', element: <ToolPage slug="bmi-calculator" /> },
  { path: '/ideal-weight-calculator', element: <ToolPage slug="ideal-weight-calculator" /> },
  { path: '/calorie-calculator-for-weight-loss', element: <ToolPage slug="calorie-calculator" /> },
  { path: '/bmr-calculator-for-men', element: <ToolPage slug="bmr-calculator" /> },
  { path: '/body-fat-percentage-calculator', element: <ToolPage slug="body-fat-calculator" /> },

  { path: '/blog', element: <Blog /> },
  { path: '/blog/:slug', element: <BlogPost /> },

  { path: '/about', element: <About /> },
  { path: '/contact', element: <Contact /> },
  { path: '/faq', element: <FAQ /> },
  { path: '/privacy-policy', element: <PrivacyPolicy /> },
  { path: '/terms', element: <Terms /> },
  { path: '/disclaimer', element: <Disclaimer /> },
  { path: '/admin/og-generator', element: <OGPreview /> },
];
