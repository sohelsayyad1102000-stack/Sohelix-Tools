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

export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  keywords,
  canonical,
  ogImage = 'https://sohelix.com/og/default.png',
  ogType = 'website',
  schema,
  noindex = false,
}) => {
  const siteName = 'Sohelix';
  const fullTitle = title.includes(siteName) ? title : `${title} | ${siteName}`;
  const url = typeof window !== 'undefined' ? window.location.href : 'https://sohelix.com';

  const defaultSchemas = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Sohelix",
      "url": "https://sohelix.com",
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
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords.join(', ')} />}
      <link rel="canonical" href={canonical || url} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      {!noindex && <meta name="robots" content="index, follow" />}

      {/* Open Graph */}
      <meta property="og:site_name" content={siteName} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={ogImage} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* Schema Markup */}
      {combinedSchema.map((s, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(s)}
        </script>
      ))}
    </Helmet>
  );
};
