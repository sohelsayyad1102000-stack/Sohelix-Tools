import { ImageIcon, FileText, Calculator, Search, Settings } from 'lucide-react';

export const CATEGORY_INFO: Record<string, { title: string, description: string, icon: any, content: string }> = {
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
    title: 'Free Calculators Tools Online',
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
    title: 'Free Utility Tools Online',
    description: 'A collection of handy utility tools for developers and daily tasks. Format JSON, convert timestamps, and encode Base64.',
    icon: Settings,
    content: 'Streamline your workflow with our collection of free online utility tools. Designed for developers, data analysts, and everyday users, these tools help you handle common technical tasks with ease. Format and minify JSON data, convert between Unix timestamps and human-readable dates, or encode and decode Base64 strings instantly. All processing happens locally in your browser, ensuring your data stays private and secure while delivering lightning-fast results.'
  },
  'finance-tools': {
    title: 'Free Finance Tools Online',
    description: 'Professional financial calculators and tools. Calculate SIP, EMI, Interest, and manage currency conversions.',
    icon: Calculator,
    content: 'Make informed financial decisions with our suite of professional-grade finance tools. Whether you are planning your investments with our SIP calculator, managing loans with our advanced EMI and loan calculators, or performing currency conversions, we provide the accurate data you need. Our tools feature interactive charts, detailed breakdowns, and flexible options for currencies and time periods. Everything is processed entirely in your browser, keeping your sensitive financial data private.'
  }
};
