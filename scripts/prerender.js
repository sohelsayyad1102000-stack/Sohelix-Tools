import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

async function runPrerender() {
  console.log('🚀 Starting Pre-rendering...');

  // Mock essentials for SSR
  if (typeof global.DOMMatrix === 'undefined') {
    global.DOMMatrix = class {};
  }
  if (typeof global.Image === 'undefined') {
    global.Image = class {};
  }

  // 3. Load the server entry
  const serverEntryPath = path.resolve(root, 'dist/server/entry-server.js');
  if (!fs.existsSync(serverEntryPath)) {
    console.error('❌ Server entry not found. Build server first.');
    process.exit(1);
  }
  const { render } = await import(serverEntryPath);

  // 4. Load routes
  const routesPath = path.resolve(root, 'src/routes-list.json');
  if (!fs.existsSync(routesPath)) {
    console.error('❌ routes-list.json not found. Run pre-build script first.');
    process.exit(1);
  }
  const routes = JSON.parse(fs.readFileSync(routesPath, 'utf-8'));

  // 5. Load index.html template
  const template = fs.readFileSync(path.resolve(root, 'dist/index.html'), 'utf-8');

  // 6. Prerender each route
  for (const url of routes) {
    console.log(`✨ Prerendering route: ${url}`);
    
    try {
      const { html: rawAppHtml, helmet } = render(url);
      
      let appHtml = rawAppHtml.trim();

      // 3. Clean up appHtml to remove ANY leaked SEO tags (they should only be in headTags)
      // This is CRITICAL to prevent hydration mismatches
      appHtml = appHtml
        .replace(/<title[^>]*>.*?<\/title>/gi, '')
        .replace(/<meta[^>]*>/gi, '')
        .replace(/<link[^>]*>/gi, '')
        .replace(/<script[^>]*type="application\/ld\+json"[^>]*>.*?<\/script>/gi, '')
        .trim();

      // 2. Capture Helmet tags from rawAppHtml (in case context sharing failed)
      // We look for title, meta, link and ld+json scripts OUTSIDE or INSIDE the wrapper
      let headTags = '';
      
      const titleMatch = rawAppHtml.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
      const metaMatches = rawAppHtml.match(/<meta[^>]*>/gi) || [];
      const linkMatches = rawAppHtml.match(/<link[^>]*>/gi) || [];
      const scriptMatches = rawAppHtml.match(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi) || [];

      if (helmet && helmet.title) {
        // Use helmet object if available (preferred)
        headTags = `${helmet.title.toString()}${helmet.meta.toString()}${helmet.link.toString()}${helmet.script.toString()}`;
      } else {
        // Fallback to regex extraction
        headTags = `
          ${titleMatch ? titleMatch[0] : ''}
          ${metaMatches.join('\n')}
          ${linkMatches.join('\n')}
          ${scriptMatches.join('\n')}
        `.trim();
      }

      let html = template
        .replace('<!--app-html-->', appHtml)
        .replace('<!--app-head-->', headTags);

      const filePath = path.join(root, 'dist', url === '/' ? 'index.html' : `${url}/index.html`);
      
      // Ensure directory exists
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      
      fs.writeFileSync(filePath, html);
    } catch (e) {
      console.error(`❌ Error prerendering ${url}:`, e);
    }
  }

  // 7. Cleanup server bundle
  fs.rmSync(path.resolve(root, 'dist/server'), { recursive: true, force: true });
  
  console.log('✅ Pre-rendering complete!');
}

runPrerender().catch((err) => {
  console.error('❌ Pre-rendering failed:', err);
  process.exit(1);
});
