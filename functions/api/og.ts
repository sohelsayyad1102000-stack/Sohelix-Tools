// Polyfill for Satori in Cloudflare Workers
// @ts-ignore
if (typeof globalThis.process === 'undefined') {
  // @ts-ignore
  globalThis.process = { env: {} };
}

import { TOOLS } from '../../src/constants/tools';

let satoriInstance: any = null;

const CATEGORIES = {
  'finance-tools': { name: 'Finance', color: '#22c55e' },
  'seo-tools': { name: 'SEO', color: '#a855f7' },
  'image-tools': { name: 'Image', color: '#ec4899' },
  'pdf-tools': { name: 'PDF', color: '#ef4444' },
  'text-tools': { name: 'Text', color: '#f59e0b' },
  'calculator-tools': { name: 'Calculator', color: '#22c55e' },
  'utilities': { name: 'Utility', color: '#3b82f6' },
};

export async function onRequest(context: any) {
  try {
    const { searchParams } = new URL(context.request.url);
    const slug = searchParams.get('slug');
    const titleParam = searchParams.get('title');
    const descParam = searchParams.get('desc');

    // 1. SAFE DATA
    const toolMatch = TOOLS.find(t => t.slug === slug);
    const tool = toolMatch || {};

    const title = titleParam || String((tool as any).title || "Sohelix Tools");
    const description = descParam || String((tool as any).description || "Free Online Browser Tools");

    // Initialize Satori polyfill and instances
    if (!satoriInstance) {
      const mod = await import('satori');
      satoriInstance = mod.default || mod;
    }

    // Fetch font (REQUIRED for Satori text rendering)
    const fontData = await fetch('https://github.com/google/fonts/raw/main/ofl/inter/Inter-Bold.ttf').then(res => res.arrayBuffer());

    // 2. SIMPLE SATORI LAYOUT
    const svg = await satoriInstance(
      {
        type: "div",
        props: {
          style: {
            width: "1200px",
            height: "630px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "60px",
            backgroundColor: "#0f172a",
            color: "white"
          },
          children: [
            {
              type: "div",
              props: {
                style: { fontSize: 24, opacity: 0.6 },
                children: "sohelix.com"
              }
            },
            {
              type: "div",
              props: {
                style: {
                  fontSize: 64,
                  fontWeight: "bold",
                  marginTop: 20
                },
                children: title
              }
            },
            {
              type: "div",
              props: {
                style: {
                  fontSize: 28,
                  marginTop: 20,
                  opacity: 0.8
                },
                children: description
              }
            }
          ]
        }
      },
      {
        width: 1200,
        height: 630,
        fonts: [
          {
            name: 'Inter',
            data: fontData,
            weight: 700,
            style: 'normal',
          },
        ],
      }
    );

    // 3. Validate SVG:
    if (!svg || typeof svg !== "string") {
      throw new Error("Invalid SVG");
    }

    // 4. RETURN SVG DIRECTLY:
    return new Response(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=31536000",
        "Access-Control-Allow-Origin": "*"
      }
    });

  } catch (e) {
    console.error("OG ERROR:", e);

    // 5. FAILSAFE SVG:
    const fallbackSvg = `
      <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#0f172a" />
        <text x="50%" y="50%" font-family="sans-serif" font-size="48" fill="white" text-anchor="middle">Sohelix Tools</text>
      </svg>
    `;

    return new Response(fallbackSvg.trim(), {
      headers: {
        "Content-Type": "image/svg+xml",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
}
