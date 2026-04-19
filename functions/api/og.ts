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
    const categoryKey = (tool as any).category || 'utilities';
    const category = CATEGORIES[categoryKey as keyof typeof CATEGORIES] || CATEGORIES['utilities'];
    const accentColor = category.color;

    // Initialize Satori polyfill and instances
    if (!satoriInstance) {
      const mod = await import('satori');
      satoriInstance = mod.default || mod;
    }

    // Fetch font (REQUIRED for Satori text rendering)
    const fontData = await fetch('https://github.com/google/fonts/raw/main/ofl/inter/Inter-Bold.ttf').then(res => res.arrayBuffer());

    // 2. PREMIUM SaaS LAYOUT
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
            padding: "80px",
            backgroundColor: "#020617",
            backgroundImage: `radial-gradient(circle at 90% 10%, ${accentColor}33 0%, transparent 60%), radial-gradient(circle at 10% 90%, #1e1b4b 0%, transparent 50%)`,
            color: "white",
            fontFamily: "Inter",
            position: "relative",
            overflow: "hidden",
          },
          children: [
            // Branding
            {
              type: "div",
              props: {
                style: {
                  position: "absolute",
                  top: "60px",
                  left: "80px",
                  fontSize: "24px",
                  fontWeight: 800,
                  opacity: 0.4,
                  letterSpacing: "-0.02em",
                },
                children: "sohelix.com"
              }
            },
            // Content
            {
              type: "div",
              props: {
                style: {
                  display: "flex",
                  flexDirection: "column",
                  maxWidth: "750px",
                  zIndex: 10,
                },
                children: [
                  // Category Badge
                  {
                    type: "div",
                    props: {
                      style: {
                        display: "flex",
                        alignItems: "center",
                        backgroundColor: `${accentColor}15`,
                        border: `1px solid ${accentColor}33`,
                        padding: "8px 16px",
                        borderRadius: "100px",
                        marginBottom: "32px",
                        width: "fit-content",
                      },
                      children: [
                        {
                          type: "div",
                          props: {
                            style: {
                              width: "8px",
                              height: "8px",
                              backgroundColor: accentColor,
                              borderRadius: "50%",
                              marginRight: "10px",
                              boxShadow: `0 0 10px ${accentColor}`,
                            }
                          }
                        },
                        {
                          type: "div",
                          props: {
                            style: {
                              fontSize: "18px",
                              fontWeight: 700,
                              color: accentColor,
                              textTransform: "uppercase",
                              letterSpacing: "0.1em",
                            },
                            children: category.name
                          }
                        }
                      ]
                    }
                  },
                  // Title
                  {
                    type: "div",
                    props: {
                      style: {
                        fontSize: "72px",
                        fontWeight: 800,
                        letterSpacing: "-0.04em",
                        lineHeight: 1.1,
                        marginBottom: "24px",
                      },
                      children: title
                    }
                  },
                  // Description
                  {
                    type: "div",
                    props: {
                      style: {
                        fontSize: "30px",
                        opacity: 0.7,
                        fontWeight: 500,
                        lineHeight: 1.4,
                      },
                      children: description
                    }
                  }
                ]
              }
            },
            // Abstract visual element
            {
              type: "div",
              props: {
                style: {
                  position: "absolute",
                  right: "-50px",
                  bottom: "-50px",
                  width: "400px",
                  height: "400px",
                  borderRadius: "200px",
                  border: `2px solid ${accentColor}11`,
                  opacity: 0.5,
                }
              }
            },
            {
              type: "div",
              props: {
                style: {
                  position: "absolute",
                  right: "0px",
                  bottom: "0px",
                  width: "300px",
                  height: "300px",
                  borderRadius: "150px",
                  border: `1px solid ${accentColor}22`,
                }
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
