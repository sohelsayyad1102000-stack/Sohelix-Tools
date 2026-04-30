import fs from 'fs';
import path from 'path';

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

// This script generates sitemap.xml and robots.txt after SSG build
const BASE_URL = 'https://sohelix.com';
const DIST_DIR = path.resolve(root, 'dist');

// We'll read the tools and blog posts to get all routes
// For simplicity in this script, we'll scan the dist directory for index.html files
function getRoutes(dir, routes = []) {
  if (!fs.existsSync(dir)) return routes;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getRoutes(filePath, routes);
    } else if (file === 'index.html') {
      let route = '/' + path.relative(DIST_DIR, dir);
      if (route === '/') route = '';
      // Exclude admin or other private routes if any
      if (!route.startsWith('/admin')) {
        routes.push(route);
      }
    }
  }
  return routes;
}

console.log('Generating SEO files...');

try {
  const routes = getRoutes(DIST_DIR);
  
  // Filter out programmatic SEO variants and low-value pages from sitemap
  // Keeping: homepage, core tools (/tools/*), categories, blog, and standard static pages
  const sitemapRoutes = routes.filter(route => {
    // Priority 1: Keep home and main branch roots
    const coreRoots = ['', '/blog'];
    if (coreRoots.includes(route)) return true;
    
    // Priority 2: Keep main tools and categories
    if (route.startsWith('/tools/')) return true;
    if (route.startsWith('/categories/')) return true;
    
    // Priority 3: Keep primary blog posts but keep it limited if needed
    // For now include them, but we will exclude variants and static pages below
    if (route.startsWith('/blog/')) return true;

    // Priority 4: Standard static pages - only keep the most important ones
    const highValueStatic = ['/about', '/contact', '/faq'];
    if (highValueStatic.includes(route)) return true;
    
    // EXCLUSIONS:
    // 1. Programmatic variants based on patterns
    const hasVariantPattern = 
      route.includes('-to-') || 
      route.includes('-for-') || 
      route.includes('-in-') || 
      route.includes('-kb') || 
      route.includes('-size') ||
      route.includes('-cm') ||
      route.includes('-mm') ||
      route.includes('-inch') ||
      route.includes('-transparent') ||
      route.includes('-high-quality');

    // 2. Explicit list of low-value programmatic routes or variants
    const explicitExcludes = [
      '/crop-image-circle',
      '/crop-image-square',
      '/crop-image-16x9',
      '/crop-image-circle-online',
      '/crop-image-for-youtube-thumbnail',
      '/bmi-calculator-india',
      '/ideal-weight-calculator',
      '/body-fat-percentage-calculator',
      '/optimize-images-for-web',
      '/convert-to-webp-lossless',
      '/ocr-pdf-to-word-online',
      '/pdf-to-word-without-software',
      '/convert-pdf-to-docx-free',
      '/privacy-policy',
      '/terms',
      '/disclaimer'
    ];

    if (hasVariantPattern || explicitExcludes.includes(route)) {
        // If it's not starting with /tools/ but matches variants, or is in the exclude list, it's out.
        // Also if it's at the root but is a variant (like /resize-image-to-100x100)
        return false;
    }

    // Default: exclude everything else (like admin, random index files)
    return false;
  });
  
  if (sitemapRoutes.length === 0) {
    console.warn('⚠️ No sitemap routes found. Skipping sitemap generation.');
  } else {
    // 1. Generate Sitemap
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapRoutes.map(route => `  <url>
    <loc>${BASE_URL}${route === '' ? '/' : route}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${route === '' ? '1.0' : (route.startsWith('/tools') ? '0.8' : '0.5')}</priority>
  </url>`).join('\n')}
</urlset>`;

    fs.writeFileSync(path.join(DIST_DIR, 'sitemap.xml'), sitemap);
    console.log('✅ sitemap.xml generated with', sitemapRoutes.length, 'high-value routes (filtered from', routes.length, 'total)');
  }

  // 2. Generate robots.txt
  const robots = `User-agent: *
Allow: /

# Block programmatic / low-value variant URLs
Disallow: /*-to-*
Disallow: /*-for-*
Disallow: /*-in-*
Disallow: /*-kb*
Disallow: /*-transparent*
Disallow: /*-high-quality*

# Block internal/system paths
Disallow: /api/
Disallow: /admin/
Disallow: /login/

# Allow framework assets
Allow: /_next/static/

# Sitemap
Sitemap: ${BASE_URL}/sitemap.xml`;

  if (!fs.existsSync(DIST_DIR)) {
    console.log('🏗️ Creating dist directory as it does not exist...');
    fs.mkdirSync(DIST_DIR, { recursive: true });
  }

  // Ensure there is at least an index.html so artifact upload doesn't fail
  const mainIndex = path.join(DIST_DIR, 'index.html');
  if (!fs.existsSync(mainIndex)) {
    console.warn('⚠️ dist/index.html missing! Creating a fallback.');
    fs.writeFileSync(mainIndex, '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Sohelix</title></head><body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body></html>');
  }

  fs.writeFileSync(path.join(DIST_DIR, 'robots.txt'), robots);
  console.log('✅ robots.txt generated in dist');
  
  // Create a sentinel file
  fs.writeFileSync(path.join(DIST_DIR, '.build-complete'), new Date().toISOString());

  // Also write robots.txt to public for local dev/context
  const publicDir = path.resolve(root, 'public');
  if (fs.existsSync(publicDir)) {
     fs.writeFileSync(path.join(publicDir, 'robots.txt'), robots);
     console.log('✅ robots.txt generated in public');
  }

} catch (error) {
  console.error('Error generating SEO files:', error);
}
