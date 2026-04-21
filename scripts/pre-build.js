import fs from 'fs';
import path from 'path';

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

// This script extracts slugs from constants to generate a flat list of routes for SSG
const toolsContent = fs.readFileSync(path.resolve(root, 'src/constants/tools.ts'), 'utf-8');
const blogContent = fs.readFileSync(path.resolve(root, 'src/constants/blog.ts'), 'utf-8');
const categoriesContent = fs.readFileSync(path.resolve(root, 'src/constants/categories.ts'), 'utf-8');

const routes = [
  '/',
  '/about',
  '/contact',
  '/faq',
  '/privacy-policy',
  '/terms',
  '/disclaimer',
  '/blog',
];

// Extract tool slugs using regex
const toolSlugs = [...toolsContent.matchAll(/slug:\s*['"]([^'"]+)['"]/g)].map(m => `/tools/${m[1]}`);
routes.push(...toolSlugs);

// Extract blog slugs
const blogSlugs = [...blogContent.matchAll(/slug:\s*['"]([^'"]+)['"]/g)].map(m => `/blog/${m[1]}`);
routes.push(...blogSlugs);

// Extract category slugs
const categorySlugs = [...categoriesContent.matchAll(/'([^']+)':\s*\{/g)].map(m => `/categories/${m[1]}`);
routes.push(...categorySlugs);

// Programmatic routes from App.tsx (manual extraction or regex)
// For now, let's just add the most important ones
const programmatic = [
    '/resize-image-to-100x100',
    '/resize-image-to-600x600',
    '/resize-image-for-instagram',
    '/resize-image-for-passport',
    '/resize-image-in-cm',
    '/resize-image-in-mm',
    '/resize-image-in-inch',
    '/crop-image-circle',
    '/crop-image-square',
    '/crop-image-16x9',
    '/crop-image-for-passport',
    '/crop-image-for-instagram',
    '/crop-image-for-youtube-thumbnail',
    '/crop-image-circle-online',
    '/jpg-to-png-100kb',
    '/jpg-to-png-for-web',
    '/jpg-to-png-transparent',
    '/jpg-to-png-high-quality',
    '/jpg-to-webp',
    '/png-to-webp',
    '/convert-to-webp-lossless',
    '/optimize-images-for-web',
    '/bmi-calculator-for-men',
    '/bmi-calculator-for-women',
    '/bmi-calculator-india',
    '/ideal-weight-calculator',
    '/calorie-calculator-for-weight-loss',
    '/bmr-calculator-for-men',
    '/body-fat-percentage-calculator',
    '/pdf-to-word-without-software',
    '/ocr-pdf-to-word-online',
    '/convert-pdf-to-docx-free',
];
routes.push(...programmatic);

// Ensure unique routes
const uniqueRoutes = [...new Set(routes)];

fs.writeFileSync(path.resolve(root, 'src/routes-list.json'), JSON.stringify(uniqueRoutes, null, 2));
console.log('✅ src/routes-list.json generated with', uniqueRoutes.length, 'routes');
