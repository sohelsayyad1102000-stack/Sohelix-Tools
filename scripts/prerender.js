import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { build } from 'vite';

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

  // 1. Build the client
  console.log('📦 Building client...');
  await build({
    root,
    build: {
      outDir: 'dist',
      minify: true,
    }
  });

  // 2. Build the server entry
  console.log('📦 Building server-entry...');
  await build({
    root,
    build: {
      ssr: 'src/entry-server.tsx',
      outDir: 'dist/server',
      minify: true,
    }
  });

  // 3. Load the server entry
  const { render } = await import(path.resolve(root, 'dist/server/entry-server.js'));

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
      const appHtml = render(url);
      const html = template.replace('<!--app-html-->', appHtml);

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
