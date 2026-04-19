// Polyfill for Satori in Cloudflare Workers
// @ts-ignore
if (typeof globalThis.process === 'undefined') {
  // @ts-ignore
  globalThis.process = { env: {} };
}

import { initWasm, Resvg } from '@resvg/resvg-wasm';
// @ts-ignore
import wasm from '@resvg/resvg-wasm/index_bg.wasm';
import { TOOLS } from '../../src/constants/tools';

let satoriInstance: any = null;
let wasmInitialized = false;

async function initResvg() {
  if (!wasmInitialized) {
    try {
      await initWasm(wasm);
      wasmInitialized = true;
    } catch (e) {
      // Already initialized or handled
      wasmInitialized = true;
    }
  }
}

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

    // 1. SAFE DATA
    const toolMatch = TOOLS.find(t => t.slug === slug);
    const tool = toolMatch || {
      title: "Sohelix Tools",
      description: "Free Online Browser Tools"
    };

    const title = String((tool as any).title || "Sohelix Tools");
    const description = String((tool as any).description || "Free Online Browser Tools");

    // Initialize Satori polyfill and instances
    if (!satoriInstance) {
      const mod = await import('satori');
      satoriInstance = mod.default || mod;
    }

    // 2. BEFORE rendering:
    await initResvg();

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

    // 3. Validate SVG BEFORE passing to Resvg:
    if (!svg || typeof svg !== "string") {
      throw new Error("Invalid SVG");
    }

    // 4. Render safely:
    const resvg = new Resvg(svg, {
      fitTo: {
        mode: "width",
        value: 1200
      }
    });

    const pngData = resvg.render().asPng();

    // 5. Validate PNG:
    if (!pngData || pngData.length === 0) {
      throw new Error("Invalid PNG output");
    }

    // 6. Return buffer correctly:
    return new Response(pngData, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=31536000",
        "Access-Control-Allow-Origin": "*"
      }
    });

  } catch (e) {
    console.error("OG ERROR:", e);

    // 7. FAILSAFE (VERY IMPORTANT):
    // return simple working fallback image
    const fallback = new Uint8Array([
      137, 80, 78, 71, 13, 10, 26, 10, // PNG Header
      0, 0, 0, 13, 73, 72, 68, 82,   // IHDR
      0, 0, 0, 1, 0, 0, 0, 1,      // 1x1
      8, 2, 0, 0, 0, 144, 119, 83, 222,
      0, 0, 0, 12, 73, 68, 65, 84,
      8, 215, 99, 248, 255, 255, 63, 0, 5, 254, 2, 254, 220, 68, 230, 215,
      0, 0, 0, 0, 73, 69, 78, 68, 174, 66, 96, 130
    ]);

    return new Response(fallback, {
      headers: {
        "Content-Type": "image/png",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
}
