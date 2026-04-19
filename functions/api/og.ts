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

export async function onRequest(context: any) {
  const { searchParams } = new URL(context.request.url);
  const slug = searchParams.get('slug');

  try {
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

    // Find tool with strict fallback
    const toolMatch = TOOLS.find(t => t.slug === slug);
    const tool = toolMatch || {
      title: "Sohelix Tools",
      description: "Free Online Browser Tools",
      category: "utilities"
    };

    // Use tool.title as headline for better dynamic content
    const title = tool.title || "Sohelix Tools";
    const categoryKey = tool.category || 'utilities';
    const category = CATEGORIES[categoryKey as keyof typeof CATEGORIES] || CATEGORIES['utilities'];
    const accentColor = category.color;

    // Fetch font - use a reliable source
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
            backgroundColor: '#020617', // Extremely dark slate
            backgroundImage: `radial-gradient(circle at 90% 10%, ${accentColor}44 0%, transparent 60%), radial-gradient(circle at 0% 100%, #1e1b4b 0%, transparent 40%)`,
            padding: '60px',
            fontFamily: 'Inter',
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
          },
          children: [
            // Branding
            {
              type: 'div',
              props: {
                style: {
                  position: 'absolute',
                  top: '60px',
                  left: '60px',
                  fontSize: '28px',
                  fontWeight: 800,
                  opacity: 0.4,
                  letterSpacing: '-0.02em',
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
                  maxWidth: '800px',
                  zIndex: 20,
                },
                children: [
                  // Category Badge
                  {
                    type: 'div',
                    props: {
                      style: {
                        display: 'flex',
                        alignItems: 'center',
                        backgroundColor: `${accentColor}22`,
                        border: `1px solid ${accentColor}44`,
                        padding: '8px 16px',
                        borderRadius: '100px',
                        marginBottom: '32px',
                        width: 'fit-content',
                      },
                      children: [
                        {
                          type: 'div',
                          props: {
                            style: {
                              width: '10px',
                              height: '10px',
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
                              fontSize: '20px',
                              fontWeight: 700,
                              color: accentColor,
                              textTransform: 'uppercase',
                              letterSpacing: '0.1em',
                            },
                            children: category.name
                          }
                        }
                      ]
                    }
                  },
                  // Headline
                  {
                    type: 'div',
                    props: {
                      style: {
                        fontSize: '70px',
                        fontWeight: 800,
                        letterSpacing: '-0.04em',
                        lineHeight: 1.1,
                        marginBottom: '24px',
                        textShadow: '0 4px 12px rgba(0,0,0,0.3)',
                      },
                      children: title
                    }
                  },
                  // Subtitle
                  {
                    type: 'div',
                    props: {
                      style: {
                        fontSize: '34px',
                        opacity: 0.7,
                        fontWeight: 500,
                        lineHeight: 1.4,
                        marginBottom: '40px',
                      },
                      children: 'Professional-grade tools, 100% free, entirely in your browser.'
                    }
                  },
                  // CTA
                  {
                    type: 'div',
                    props: {
                      style: {
                        display: 'flex',
                        alignItems: 'center',
                        fontSize: '28px',
                        fontWeight: 700,
                        color: 'white',
                        backgroundColor: '#2563eb',
                        padding: '16px 32px',
                        borderRadius: '16px',
                        boxShadow: '0 8px 24px rgba(37, 99, 235, 0.3)',
                        width: 'fit-content',
                      },
                      children: 'Try it now →'
                    }
                  }
                ]
              }
            },
            // Decorative Right Side
            {
              type: 'div',
              props: {
                style: {
                  position: 'absolute',
                  right: '-10%',
                  top: '20%',
                  width: '600px',
                  height: '600px',
                  borderRadius: '100%',
                  border: `2px solid ${accentColor}11`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                },
                children: [
                  {
                    type: 'div',
                    props: {
                      style: {
                        width: '450px',
                        height: '450px',
                        borderRadius: '100%',
                        border: `1px solid ${accentColor}22`,
                      }
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
      fitTo: { mode: 'width', value: 1200 },
    });
    
    const pngData = resvg.render().asPng();

    return new Response(pngData, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=31536000, immutable",
        "Access-Control-Allow-Origin": "*"
      }
    });

  } catch (error) {
    console.error('OG generation fatal error:', error);
    // Return a last-resort error response if even the generator fails
    return new Response("OG Generation Error", { status: 500 });
  }
}
