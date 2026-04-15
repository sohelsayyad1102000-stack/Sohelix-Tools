import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { SEO } from '../components/SEO';
import { TOOLS } from '../constants/tools';
import { ToolCard } from '../components/ToolCard';
import { LayoutGrid, Image as ImageIcon, FileText, Calculator, Settings, Search, ChevronRight } from 'lucide-react';

const CATEGORY_INFO: Record<string, { title: string, description: string, icon: any, content: string }> = {
  'image-tools': {
    title: 'Free Image Tools Online',
    description: 'A complete suite of free online image tools. Compress, resize, crop, convert, and edit your images instantly in your browser.',
    icon: ImageIcon,
    content: 'Welcome to our comprehensive collection of free online image tools. Whether you need to compress a large photo for your website, resize an image for social media, or convert between formats like JPG, PNG, and WebP, we have you covered. All our image tools run entirely in your browser, meaning your files are never uploaded to any server. This ensures maximum privacy, security, and lightning-fast processing speeds. Start optimizing your images today with our easy-to-use, professional-grade utilities.'
  },
  'pdf-tools': {
    title: 'Free PDF Tools Online',
    description: 'Manage your PDF documents with our free online PDF tools. Merge, split, and convert PDFs securely in your browser.',
    icon: FileText,
    content: 'Discover our powerful suite of free online PDF tools designed to make document management a breeze. Need to combine multiple reports into one? Use our PDF Merger. Want to extract specific pages from a large document? Our PDF Splitter is perfect for the job. You can even convert images directly into professional PDF files. Best of all, our PDF tools process everything locally on your device. Your sensitive documents remain completely private and secure, with no server uploads required.'
  },
  'calculator-tools': {
    title: 'Free Online Calculators',
    description: 'Make smart financial and health decisions with our free online calculators. Calculate BMI, EMI, Interest, and more.',
    icon: Calculator,
    content: 'Take control of your health and finances with our collection of free online calculators. Planning a loan? Our EMI calculator helps you understand your monthly commitments and total interest. Saving for the future? Use our Simple and Compound Interest calculator to see your money grow. We also offer health tools like a precise BMI calculator to help you track your fitness goals. All our calculators provide instant, accurate results with detailed breakdowns to help you make informed decisions.'
  },
  'seo-tools': {
    title: 'Free SEO Tools Online',
    description: 'Boost your website traffic with our free online SEO tools. Generate meta tags, sitemaps, robots.txt, and preview SERPs.',
    icon: Search,
    content: 'Improve your website\'s search engine visibility with our suite of free online SEO tools. Whether you need to generate perfectly formatted meta tags, create an XML sitemap for Google, or preview how your pages will look in search results, we have the tools you need. All our SEO utilities are designed to help you optimize your content and drive more organic traffic, running entirely in your browser for instant results.'
  },
  'text-tools': {
    title: 'Free Text Tools Online',
    description: 'Advanced text formatting and manipulation tools. Count words, convert case, sort lines, and more. Free online text utilities.',
    icon: FileText,
    content: 'Welcome to our complete suite of advanced text tools. Whether you need an accurate word counter with keyword density analysis, a case converter for formatting titles, or a line sorter to organize lists, we have the perfect utility for you. Our text tools are designed for writers, developers, and SEO professionals who need fast, reliable text manipulation. Everything runs instantly in your browser, ensuring your data remains completely private and secure.'
  },
  'utilities': {
    title: 'Free Online Utility Tools',
    description: 'A collection of handy utility tools for developers and daily tasks. Format JSON, convert timestamps, and encode Base64.',
    icon: Settings,
    content: 'Streamline your workflow with our collection of free online utility tools. Designed for developers, data analysts, and everyday users, these tools help you handle common technical tasks with ease. Format and minify JSON data, convert between Unix timestamps and human-readable dates, or encode and decode Base64 strings instantly. All processing happens locally in your browser, ensuring your data stays private and secure while delivering lightning-fast results.'
  },
  'finance-tools': {
    title: 'Free Online Finance Tools',
    description: 'Professional financial calculators and tools. Calculate SIP, EMI, Interest, and manage currency conversions.',
    icon: Calculator,
    content: 'Make informed financial decisions with our suite of professional-grade finance tools. Whether you are planning your investments with our SIP calculator, managing loans with our advanced EMI and loan calculators, or performing currency conversions, we provide the accurate data you need. Our tools feature interactive charts, detailed breakdowns, and flexible options for currencies and time periods. Everything is processed entirely in your browser, keeping your sensitive financial data private.'
  }
};

export const CategoryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  
  const categoryInfo = slug && CATEGORY_INFO[slug] ? CATEGORY_INFO[slug] : null;
  const categoryTools = TOOLS.filter(tool => tool.category === slug);

  if (!categoryInfo || categoryTools.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Category Not Found</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">The category you are looking for does not exist or has no tools yet.</p>
        <Link to="/" className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3 font-bold text-white transition-all hover:bg-blue-700">
          Back to Home
        </Link>
      </div>
    );
  }

  const Icon = categoryInfo.icon;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <SEO
        title={categoryInfo.title}
        description={categoryInfo.description}
      />

      <div className="container mx-auto px-4 max-w-7xl py-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-8">
          <Link to="/" className="hover:text-blue-600">Home</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="font-medium text-gray-900 dark:text-white capitalize">{slug?.replace('-', ' ')}</span>
        </nav>

        {/* Category Header & SEO Content */}
        <div className="mb-12 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center justify-center p-4 bg-blue-100 dark:bg-blue-900/30 rounded-2xl mb-6 text-blue-600 dark:text-blue-400">
            <Icon className="h-10 w-10" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-6 tracking-tight">
            {categoryInfo.title}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
            {categoryInfo.content}
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categoryTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </div>
    </div>
  );
};
