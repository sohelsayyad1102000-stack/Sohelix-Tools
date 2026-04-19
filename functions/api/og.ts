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
  } else if (slug === 'sohelix-homepage-og' || slug === 'home') {
    title = "All-in-One Online Toolbox";
    categoryKey = 'utilities';
  } else if (slug === 'sohelix-qr-code-generator') {
    title = "Professional QR Code Generator";
    categoryKey = 'utilities';
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
          backgroundColor: '#020617', // Extremely dark slate
          backgroundImage: `radial-gradient(circle at 90% 10%, ${accentColor}44 0%, transparent 60%), radial-gradient(circle at 0% 100%, #1e1b4b 0%, transparent 40%)`,
          padding: '60px',
          fontFamily: 'Inter',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
        },
        children: [
          // Background Noise/Artifacts (Optional visual depth)
          {
            type: 'div',
            props: {
              style: {
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                opacity: 0.03,
                backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
              }
            }
          },
          // Top-Left Branding
          {
            type: 'div',
            props: {
              style: {
                position: 'absolute',
                top: '60px',
                left: '60px',
                fontSize: '24px',
                fontWeight: 600,
                letterSpacing: '-0.025em',
                opacity: 0.3,
                color: 'white',
              },
              children: 'sohelix.com'
            }
          },
          // Main Content
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                flexDirection: 'column',
                marginTop: '40px',
                width: '720px',
                zIndex: 10,
              },
              children: [
                {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: '72px',
                      fontWeight: 800,
                      letterSpacing: '-0.04em',
                      lineHeight: 1.05,
                      marginBottom: '20px',
                    },
                    children: title
                  }
                },
                {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: '32px',
                      opacity: 0.5,
                      fontWeight: 500,
                      lineHeight: 1.4,
                    },
                    children: 'Fast, secure, and always 100% free browser tools.'
                  }
                }
              ]
            }
          },
          // Category Badge (Bottom-Left)
          {
            type: 'div',
            props: {
              style: {
                position: 'absolute',
                bottom: '60px',
                left: '60px',
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '10px 20px',
                borderRadius: '12px',
              },
              children: [
                {
                  type: 'div',
                  props: {
                    style: {
                      width: '8px',
                      height: '8px',
                      backgroundColor: accentColor,
                      borderRadius: '50%',
                      marginRight: '12px',
                      boxShadow: `0 0 12px ${accentColor}`,
                    }
                  }
                },
                {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: '20px',
                      fontWeight: 600,
                      color: 'white',
                      opacity: 0.9,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    },
                    children: category.name
                  }
                }
              ]
            }
          },
          // Right Side Abstract Visual
          {
            type: 'div',
            props: {
              style: {
                position: 'absolute',
                top: '50%',
                right: '-50px',
                transform: 'translateY(-50%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '500px',
                height: '500px',
              },
              children: [
                // Inner Glow
                {
                  type: 'div',
                  props: {
                    style: {
                      position: 'absolute',
                      width: '300px',
                      height: '300px',
                      borderRadius: '50%',
                      backgroundColor: accentColor,
                      opacity: 0.1,
                      filter: 'blur(60px)',
                    }
                  }
                },
                // Decorative Circle
                {
                  type: 'div',
                  props: {
                    style: {
                      width: '360px',
                      height: '360px',
                      borderRadius: '50%',
                      border: `1.5px solid ${accentColor}`,
                      opacity: 0.15,
                    }
                  }
                },
                // Outer Ring
                {
                  type: 'div',
                  props: {
                    style: {
                      position: 'absolute',
                      width: '460px',
                      height: '460px',
                      borderRadius: '50%',
                      border: `1px solid ${accentColor}`,
                      opacity: 0.05,
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
