import { TOOLS } from '../constants/tools';
import { CATEGORY_INFO } from '../constants/categories';

export const BASE_URL = 'https://sohelix.com';

/**
 * Normalizes any path or URL to the canonical format:
 * - HTTPS
 * - sohelix.com domain
 * - Trailing slash required
 */
export function normalizeCanonicalUrl(path: string): string {
  if (!path) return `${BASE_URL}/`;
  
  try {
    // Handle full URLs
    const url = new URL(path.startsWith('http') ? path : `${BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`);
    
    // Force Domain and Protocol
    url.protocol = 'https:';
    url.host = 'sohelix.com';

    let pathname = url.pathname;
    
    // Prevent double slashes
    pathname = pathname.replace(/\/+/g, '/');
    
    // Add trailing slash if missing and not a file
    if (!pathname.endsWith('/') && !pathname.split('/').pop()?.includes('.')) {
      pathname += '/';
    }
    
    return `${BASE_URL}${pathname}${url.search}${url.hash}`;
  } catch (e) {
    return `${BASE_URL}/`;
  }
}

interface MetaInput {
  type: 'tool' | 'category' | 'blog' | 'page';
  name: string;
  categoryName?: string;
  description?: string;
}

/**
 * Generates SEO-optimized titles and descriptions following a consistent template
 */
export function generateMeta({ type, name, categoryName, description }: MetaInput) {
  const brand = 'Sohelix';
  let title = '';
  let metaDescription = '';

  switch (type) {
    case 'tool':
      title = `${name} – Free Online Tool | ${brand}`;
      metaDescription = description || `Use our free ${name} tool to process your files and data. Fast, secure, and easy to use on ${brand}.`;
      break;
    case 'category':
      title = `Free ${name} Online – Best Utility Collection | ${brand}`;
      metaDescription = `Explore our collection of free online ${name}. Professional grade utilities for your daily workflow, hosted securely on ${brand}.`;
      break;
    case 'blog':
      title = `${name} – Expert Guide | ${brand} Blog`;
      metaDescription = description || `Read our expert guide on ${name}. Learn tips, tricks, and best practices from the ${brand} team.`;
      break;
    default:
      title = `${name} | ${brand}`;
      metaDescription = description || `Free online tools for developers, designers, and office workers. Secure and fast utilities on ${brand}.`;
  }

  return { title, metaDescription };
}

/**
 * Logic to find related tools for internal linking
 */
export function getRelatedTools(currentToolId: string, category: string, limit = 6) {
  return TOOLS.filter(t => t.category === category && t.id !== currentToolId)
    .slice(0, limit);
}
