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

const CATEGORIES = {
  'finance-tools': { name: 'Finance', color: '#22c55e' },
  'seo-tools': { name: 'SEO', color: '#a855f7' },
  'image-tools': { name: 'Image', color: '#ec4899' },
  'pdf-tools': { name: 'PDF', color: '#ef4444' },
  'text-tools': { name: 'Text', color: '#f59e0b' },
  'calculator-tools': { name: 'Calculator', color: '#22c55e' },
  'utilities': { name: 'Utility', color: '#3b82f6' },
};

export async function onRequest(context) {
  // Initialize Satori dynamically to ensure polyfill is applied first
  if (!satoriInstance) {
    const mod = await import('satori');
    satoriInstance = mod.default || mod;
  }

  // Initialize WASM
  try {
    await initWasm(wasm);
  } catch (e) {
    // Already initialized or failed
  }

  const { searchParams } = new URL(context.request.url);
  const slug = searchParams.get('slug');

  // Find tool
  const tool = TOOLS.find(t => t.slug === slug);
  
  // Dynamic Title & Category
  let title = "Sohelix Tools";
  let categoryKey = 'utilities';
  
  if (tool) {
    title = tool.name;
    categoryKey = tool.category;
  } else if (slug === 'home') {
    title = "Sohelix Tools";
  } else if (slug) {
    // If not a tool, maybe it's a category slug
    // We can try to humanize it
    title = slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  }

  const category = CATEGORIES[categoryKey] || CATEGORIES['utilities'];
  const accentColor = category.color;

  // Fetch font
  // Using a solid public link for Inter-Bold
  const fontData = await fetch('https://github.com/google/fonts/raw/main/ofl/inter/Inter-Bold.ttf').then(res => res.arrayBuffer());

  const svg = await satoriInstance(
    {
      type: 'div',
      props: {
        style: {
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          backgroundColor: '#030712', // Dark navy
          backgroundImage: `radial-gradient(circle at 100% 0%, ${accentColor}33 0%, transparent 50%), radial-gradient(circle at 0% 100%, #1e1b4b 0%, transparent 50%)`,
          padding: '80px',
          fontFamily: 'Inter',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
        },
        children: [
          // Background Glow
          {
            type: 'div',
            props: {
              style: {
                position: 'absolute',
                top: '10%',
                right: '10%',
                width: '400px',
                height: '400px',
                background: accentColor,
                opacity: 0.15,
                filter: 'blur(100px)',
                borderRadius: '50%',
              }
            }
          },
          // Website Label
          {
            type: 'div',
            props: {
              style: {
                position: 'absolute',
                top: '40px',
                left: '80px',
                fontSize: '24px',
                fontWeight: 600,
                opacity: 0.4,
                color: 'white',
              },
              children: 'sohelix.com'
            }
          },
          // Main Content Area
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                flexDirection: 'column',
                width: '700px',
              },
              children: [
                {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: '32px',
                      marginBottom: '16px',
                      color: accentColor,
                      fontWeight: 700,
                      opacity: 0.9,
                    },
                    children: 'FREE ONLINE TOOL'
                  }
                },
                {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: '84px',
                      fontWeight: 800,
                      lineHeight: 1.1,
                      marginBottom: '24px',
                    },
                    children: title
                  }
                },
                {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: '32px',
                      opacity: 0.6,
                      fontWeight: 500,
                    },
                    children: 'Fast, secure, and always 100% free browser tools.'
                  }
                }
              ]
            }
          },
          // Category Badge
          {
            type: 'div',
            props: {
              style: {
                position: 'absolute',
                bottom: '80px',
                right: '80px',
                display: 'flex',
                alignItems: 'center',
                backgroundColor: `${accentColor}22`,
                border: `1px solid ${accentColor}44`,
                padding: '12px 24px',
                borderRadius: '100px',
              },
              children: [
                {
                  type: 'div',
                  props: {
                    style: {
                      width: '12px',
                      height: '12px',
                      backgroundColor: accentColor,
                      borderRadius: '50%',
                      marginRight: '12px',
                      boxShadow: `0 0 10px ${accentColor}`,
                    }
                  }
                },
                {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: '24px',
                      fontWeight: 600,
                      color: accentColor,
                    },
                    children: category.name
                  }
                }
              ]
            }
          },
          // Decorative Abstract Shape
          {
            type: 'svg',
            props: {
              width: '400',
              height: '400',
              viewBox: '0 0 200 200',
              style: {
                position: 'absolute',
                top: '115px',
                right: '80px',
                opacity: 0.2,
              },
              children: [
                {
                  type: 'path',
                  props: {
                    d: 'M40,100 C40,40 100,20 160,100 C160,160 100,180 40,100',
                    fill: 'none',
                    stroke: accentColor,
                    strokeWidth: '4',
                    strokeDasharray: '12,8',
                  }
                },
                {
                  type: 'circle',
                  props: {
                    cx: '100',
                    cy: '100',
                    r: '60',
                    fill: 'none',
                    stroke: accentColor,
                    strokeWidth: '1',
                    opacity: 0.5,
                  }
                }
              ]
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

  const resvg = new Resvg(svg, {
    fitTo: {
      mode: 'width',
      value: 1200,
    },
  });
  
  const pngData = resvg.render().asPng();

  return new Response(pngData, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
