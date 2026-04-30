import { useRoutes, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { routes } from '../routes';
import { AnimatePresence, motion } from 'motion/react';
import { ClientOnly } from './ClientOnly';
import { useAnalytics } from '../hooks/useAnalytics';

export default function App() {
  useAnalytics();
  const content = useRoutes(routes);
  const location = useLocation();

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <main className="flex-1">
        <AnimatePresence mode="wait" initial={false}>
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
  );
}
