import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
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
import { AnimatePresence, motion } from 'motion/react';

const PageWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -10 }}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default function App() {
  return (
    <HelmetProvider>
      <Router>
        <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-950">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
              <Route path="/categories/:slug" element={<PageWrapper><CategoryPage /></PageWrapper>} />
              <Route path="/tools/:slug" element={<PageWrapper><ToolPage /></PageWrapper>} />
              
              {/* Programmatic SEO Routes for Resize Image */}
              <Route path="/resize-image-to-100x100" element={<PageWrapper><ToolPage slug="resize-image" /></PageWrapper>} />
              <Route path="/resize-image-to-600x600" element={<PageWrapper><ToolPage slug="resize-image" /></PageWrapper>} />
              <Route path="/resize-image-for-instagram" element={<PageWrapper><ToolPage slug="resize-image" /></PageWrapper>} />
              <Route path="/resize-image-for-passport" element={<PageWrapper><ToolPage slug="resize-image" /></PageWrapper>} />
              <Route path="/resize-image-in-cm" element={<PageWrapper><ToolPage slug="resize-image" /></PageWrapper>} />
              <Route path="/resize-image-in-mm" element={<PageWrapper><ToolPage slug="resize-image" /></PageWrapper>} />
              <Route path="/resize-image-in-inch" element={<PageWrapper><ToolPage slug="resize-image" /></PageWrapper>} />

              {/* Programmatic SEO Routes for Crop Image */}
              <Route path="/crop-image-circle" element={<PageWrapper><ToolPage slug="crop-image" /></PageWrapper>} />
              <Route path="/crop-image-square" element={<PageWrapper><ToolPage slug="crop-image" /></PageWrapper>} />
              <Route path="/crop-image-16x9" element={<PageWrapper><ToolPage slug="crop-image" /></PageWrapper>} />
              <Route path="/crop-image-for-passport" element={<PageWrapper><ToolPage slug="crop-image" /></PageWrapper>} />
              <Route path="/crop-image-for-instagram" element={<PageWrapper><ToolPage slug="crop-image" /></PageWrapper>} />
              <Route path="/crop-image-for-youtube-thumbnail" element={<PageWrapper><ToolPage slug="crop-image" /></PageWrapper>} />
              <Route path="/crop-image-circle-online" element={<PageWrapper><ToolPage slug="crop-image" /></PageWrapper>} />

              {/* Programmatic SEO Routes for JPG to PNG */}
              <Route path="/jpg-to-png-100kb" element={<PageWrapper><ToolPage slug="jpg-to-png" /></PageWrapper>} />
              <Route path="/jpg-to-png-for-web" element={<PageWrapper><ToolPage slug="jpg-to-png" /></PageWrapper>} />
              <Route path="/jpg-to-png-transparent" element={<PageWrapper><ToolPage slug="jpg-to-png" /></PageWrapper>} />
              <Route path="/jpg-to-png-high-quality" element={<PageWrapper><ToolPage slug="jpg-to-png" /></PageWrapper>} />

              {/* Programmatic SEO Routes for WebP Converter */}
              <Route path="/jpg-to-webp" element={<PageWrapper><ToolPage slug="webp-converter" /></PageWrapper>} />
              <Route path="/png-to-webp" element={<PageWrapper><ToolPage slug="webp-converter" /></PageWrapper>} />
              <Route path="/convert-to-webp-lossless" element={<PageWrapper><ToolPage slug="webp-converter" /></PageWrapper>} />
              <Route path="/optimize-images-for-web" element={<PageWrapper><ToolPage slug="webp-converter" /></PageWrapper>} />

              {/* Programmatic SEO Routes for BMI Calculator */}
              <Route path="/bmi-calculator-for-men" element={<PageWrapper><ToolPage slug="bmi-calculator" /></PageWrapper>} />
              <Route path="/bmi-calculator-for-women" element={<PageWrapper><ToolPage slug="bmi-calculator" /></PageWrapper>} />
              <Route path="/bmi-calculator-india" element={<PageWrapper><ToolPage slug="bmi-calculator" /></PageWrapper>} />
              <Route path="/ideal-weight-calculator" element={<PageWrapper><ToolPage slug="ideal-weight-calculator" /></PageWrapper>} />
              <Route path="/calorie-calculator-for-weight-loss" element={<PageWrapper><ToolPage slug="calorie-calculator" /></PageWrapper>} />
              <Route path="/bmr-calculator-for-men" element={<PageWrapper><ToolPage slug="bmr-calculator" /></PageWrapper>} />
              <Route path="/body-fat-percentage-calculator" element={<PageWrapper><ToolPage slug="body-fat-calculator" /></PageWrapper>} />

              <Route path="/blog" element={<PageWrapper><Blog /></PageWrapper>} />
              <Route path="/blog/:slug" element={<PageWrapper><BlogPost /></PageWrapper>} />

              <Route path="/about" element={<PageWrapper><About /></PageWrapper>} />
              <Route path="/contact" element={<PageWrapper><Contact /></PageWrapper>} />
              <Route path="/faq" element={<PageWrapper><FAQ /></PageWrapper>} />
              <Route path="/privacy-policy" element={<PageWrapper><PrivacyPolicy /></PageWrapper>} />
              <Route path="/terms" element={<PageWrapper><Terms /></PageWrapper>} />
              <Route path="/disclaimer" element={<PageWrapper><Disclaimer /></PageWrapper>} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </HelmetProvider>
  );
}
