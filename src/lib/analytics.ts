/**
 * Google Analytics 4 (GA4) helper for event tracking.
 */

declare global {
  interface Window {
    gtag: (command: string, action: string, params?: any) => void;
  }
}

export const MEASUREMENT_ID = 'G-JD5BBCTBZG';

export const trackEvent = (action: string, params: Record<string, any> = {}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, params);
  }
};

export const trackPageView = (path: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', MEASUREMENT_ID, {
      page_path: path,
    });
  }
};
