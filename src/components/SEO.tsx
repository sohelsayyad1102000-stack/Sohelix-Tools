import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string[];
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  schema?: any | any[];
  noindex?: boolean;
}

const PROD_SITE_URL = 'https://sohelix.com';

function resolveAbsoluteUrl(path: string, origin: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    if (path.startsWith(PROD_SITE_URL)) {
      const relativePart = path.slice(PROD_SITE_URL.length);
      return `${origin}${relativePart}`;
    }
    return path;
  }
  return `${origin}${path.startsWith('/') ? path : `/${path}`}`;
}

export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  keywords,
  canonical,
  ogImage = '/og/default.png',
  ogType = 'website',
  schema,
  noindex = false,
}) => {
  const siteName = 'Sohelix';
  const fullTitle = title.includes(siteName) ? title : `${title} | ${siteName}`;

  const [origin, setOrigin] = React.useState(PROD_SITE_URL);
  const [pageUrl, setPageUrl] = React.useState(PROD_SITE_URL);

  React.useEffect(() => {
    const o = window.location.origin;
    setOrigin(o);
    setPageUrl(window.location.href);
  }, []);

  const absoluteOgImage = resolveAbsoluteUrl(ogImage, origin);
  const canonicalUrl = canonical ? resolveAbsoluteUrl(canonical, origin) : pageUrl;

  const defaultSchemas = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Sohelix",
      "url": PROD_SITE_URL,
      "logo": `${PROD_SITE_URL}/og/default.png`,
      "sameAs": [
        "https://twitter.com/sohelix",
        "https://github.com/sohelix"
      ]
    }
  ];

  const combinedSchema = Array.isArray(schema)
    ? [...defaultSchemas, ...schema]
    : schema
      ? [...defaultSchemas, schema]
      : defaultSchemas;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords.join(', ')} />}
      <link rel="canonical" href={canonicalUrl} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      {!noindex && <meta name="robots" content="index, follow" />}

      {/* Open Graph */}
      <meta property="og:site_name" content={siteName} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={absoluteOgImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:type" content="image/png" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={absoluteOgImage} />

      {/* Schema Markup */}
      {combinedSchema.map((s, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(s)}
        </script>
      ))}
    </Helmet>
  );
};
