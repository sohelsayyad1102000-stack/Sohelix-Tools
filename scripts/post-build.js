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
  
  if (routes.length === 0) {
    console.warn('⚠️ No routes found in dist directory. Skipping sitemap generation.');
  } else {
    // 1. Generate Sitemap
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map(route => `  <url>
    <loc>${BASE_URL}${route === '' ? '/' : route}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${route === '' ? '1.0' : (route.startsWith('/tools') ? '0.8' : '0.5')}</priority>
  </url>`).join('\n')}
</urlset>`;

    fs.writeFileSync(path.join(DIST_DIR, 'sitemap.xml'), sitemap);
    console.log('✅ sitemap.xml generated with', routes.length, 'routes');
  }

  // 2. Generate robots.txt
  const robots = `User-agent: *
Allow: /

Sitemap: ${BASE_URL}/sitemap.xml

Disallow:
/admin/
/login/`;

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
