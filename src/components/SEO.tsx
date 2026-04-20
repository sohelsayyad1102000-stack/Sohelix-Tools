import React from 'react';
import { Helmet } from 'react-helmet-async';

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
  let fullTitle = title.includes(siteName) ? title : `${title} | ${siteName}`;
  
  // SEO optimization: Keep title under 60 chars
  if (fullTitle.length > 60) {
    fullTitle = fullTitle.substring(0, 57) + '...';
  }

  const [url, setUrl] = React.useState('https://sohelix.com');

  React.useEffect(() => {
    setUrl(window.location.href);
  }, []);
  
  // Use static PNG OG images for maximum compatibility
  const ogImageSlug = slug || 'default';
  const ogImageUrl = `https://sohelix.com/og/${ogImageSlug}.png`;

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

      {/* Dynamic OG Image System */}
      <meta property="og:site_name" content={siteName} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonical || url} />
      <meta property="og:image" content={ogImageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
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
