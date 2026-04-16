import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { BLOG_POSTS } from '../constants/blog';
import { SEO } from '../components/SEO';
import { Calendar, User, ArrowLeft, Share2, Clock } from 'lucide-react';
import { motion } from 'motion/react';

export const BlogPost: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = BLOG_POSTS.find(p => p.slug === slug);

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "description": post.description,
    "image": post.image || "https://sohelix.com/og-image.png",
    "author": {
      "@type": "Person",
      "name": post.author
    },
    "publisher": {
      "@type": "Organization",
      "name": "Sohelix",
      "logo": {
        "@type": "ImageObject",
        "url": "https://sohelix.com/logo.png"
      }
    },
    "datePublished": "2026-04-16T09:00:00+00:00",
    "dateModified": "2026-04-16T09:00:00+00:00",
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://sohelix.com/blog/${post.slug}`
    }
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://sohelix.com"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Blog",
        "item": "https://sohelix.com/blog"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": post.title,
        "item": `https://sohelix.com/blog/${post.slug}`
      }
    ]
  };

  const faqSchema = post.faqs ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": post.faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  } : null;

  const schemas: any[] = [articleSchema, breadcrumbSchema];
  if (faqSchema) schemas.push(faqSchema);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 py-12">
      <SEO 
        title={post.seo.title}
        description={post.seo.description}
        keywords={post.seo.keywords}
        ogImage={post.image}
        ogType="article"
        schema={schemas}
      />

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <Link 
            to="/blog" 
            className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Blog
          </Link>
        </motion.div>

        <article>
          <header className="mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wider">
                  {post.category}
                </span>
                <span className="text-gray-300 dark:text-gray-700">•</span>
                <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                  <Clock className="h-4 w-4" />
                  5 min read
                </div>
              </div>

              <h1 className="text-4xl font-black tracking-tight text-gray-900 sm:text-5xl dark:text-white mb-8 leading-tight">
                {post.title}
              </h1>

              <div className="flex items-center justify-between py-6 border-y border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <User className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{post.author}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <Calendar className="h-3 w-3" />
                      {post.date}
                    </div>
                  </div>
                </div>
                
                <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-colors">
                  <Share2 className="h-5 w-5" />
                </button>
              </div>
            </motion.div>
          </header>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="prose prose-lg prose-blue dark:prose-invert max-w-none"
          >
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
          </motion.div>

          <footer className="mt-16 pt-12 border-t border-gray-100 dark:border-gray-800">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-3xl p-8 text-center">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Enjoyed this article?</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                Explore more tools and guides on Sohelix to boost your productivity.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link 
                  to="/" 
                  className="px-8 py-3 rounded-2xl bg-blue-600 text-white font-bold shadow-xl shadow-blue-500/30 hover:bg-blue-700 transition-all"
                >
                  Browse All Tools
                </Link>
                <Link 
                  to="/blog" 
                  className="px-8 py-3 rounded-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-bold border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                >
                  More Articles
                </Link>
              </div>
            </div>
          </footer>
        </article>
      </div>
    </div>
  );
};
