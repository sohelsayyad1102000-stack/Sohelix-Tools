import { useRoutes, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { routes } from './routes';
import { AnimatePresence, motion } from 'motion/react';

export default function App() {
  const content = useRoutes(routes);
  const location = useLocation();

  return (
    <HelmetProvider>
      <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-950">
        <Navbar />
        <main className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              {content}
            </motion.div>
          </AnimatePresence>
        </main>
        <Footer />
      </div>
    </HelmetProvider>
  );
}
