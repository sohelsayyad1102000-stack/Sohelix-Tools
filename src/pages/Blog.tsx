import React from 'react';
import { Link } from 'react-router-dom';
import { BLOG_POSTS } from '../constants/blog';
import { SEO } from '../components/SEO';
import { generateMeta } from '../lib/seo';
import { Calendar, User, ChevronRight, BookOpen } from 'lucide-react';
import { motion } from 'motion/react';

export const Blog: React.FC = () => {
  const { title, metaDescription } = generateMeta({
    type: 'page',
    name: 'Blog'
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12">
      <SEO 
        title={title}
        description={metaDescription}
        keywords={['sohelix blog', 'online tools guide', 'productivity tips', 'health tools guide']}
        canonical="/blog/"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-black tracking-tight text-gray-900 sm:text-6xl dark:text-white mb-6">
              Our <span className="text-blue-600">Blog</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Guides, tips, and insights to help you make the most of our free online tools.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {BLOG_POSTS.map((post, index) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group flex flex-col bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm hover:shadow-xl transition-all hover:-translate-y-1"
            >
              <div className="p-8 flex flex-col h-full">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-4">
                  <span className="bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-lg">{post.category}</span>
                </div>
                
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-blue-600 transition-colors">
                  <Link to={`/blog/${post.slug}/`}>{post.title}</Link>
                </h2>
                
                <p className="text-gray-600 dark:text-gray-400 mb-8 line-clamp-3">
                  {post.description}
                </p>
                
                <div className="mt-auto pt-6 border-t border-gray-50 dark:border-gray-800 flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {post.date}
                    </div>
                  </div>
                  <Link 
                    to={`/blog/${post.slug}/`}
                    className="flex items-center gap-1 text-sm font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400"
                  >
                    Read More <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        {BLOG_POSTS.length === 0 && (
          <div className="text-center py-20">
            <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">No posts yet</h3>
            <p className="text-gray-500 dark:text-gray-400">Check back soon for new content!</p>
          </div>
        )}
      </div>
    </div>
  );
};
