import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string[];
  canonical?: string;
  schema?: any | any[];
  noindex?: boolean;
}

export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  keywords,
  canonical,
  schema,
  noindex = false,
}) => {
  const siteName = 'Sohelix';
  const fullTitle = title.includes(siteName) ? title : `${title} | ${siteName}`;
  const [url, setUrl] = React.useState('https://sohelix.com');

  React.useEffect(() => {
    setUrl(window.location.href);
  }, []);

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

      {/* Basic SEO tags only - OG and Twitter system removed */}

      {/* Schema Markup */}
      {combinedSchema.map((s, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(s)}
        </script>
      ))}
    </Helmet>
  );
};
