import React from 'react';
import { Helmet } from 'react-helmet-async';
import { normalizeCanonicalUrl } from '../lib/seo';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string[];
  canonical?: string;
  slug?: string;
  schema?: any | any[];
  noindex?: boolean;
}

export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  keywords,
  canonical,
  slug,
  schema,
  noindex = false,
}) => {
  const siteName = 'Sohelix';
  
  // Use canonical if provided, otherwise normalize the current URL
  const canonicalUrl = normalizeCanonicalUrl(canonical || (typeof window !== 'undefined' ? window.location.pathname + window.location.search : ''));

  // Use static PNG OG images for maximum compatibility
  const ogImageSlug = slug || 'default';
  const ogImageUrl = `https://sohelix.com/og/${ogImageSlug}.png`;
  
  const fullTitle = title.includes(siteName) ? title : `${title} | ${siteName}`;
  const displayDescription = description || 'Access 100+ free online tools for your daily workflow. Fast, secure, and easy to use on Sohelix.';

  const defaultSchemas = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Sohelix",
      "url": "https://sohelix.com/",
      "logo": "https://sohelix.com/logo.png",
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
      <meta name="description" content={displayDescription} />
      {keywords && <meta name="keywords" content={keywords.join(', ')} />}
      <link rel="canonical" href={canonicalUrl} />
      {noindex && <meta name="robots" content="noindex, follow" />}
      {!noindex && <meta name="robots" content="index, follow" />}

      {/* Dynamic OG Image System */}
      <meta property="og:site_name" content={siteName} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={displayDescription} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={ogImageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={displayDescription} />
      <meta name="twitter:image" content={ogImageUrl} />
      <meta name="twitter:image:width" content="1200" />
      <meta name="twitter:image:height" content="630" />

      {/* Schema Markup */}
      {combinedSchema.map((s, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(s)}
        </script>
      ))}
    </Helmet>
  );
};
