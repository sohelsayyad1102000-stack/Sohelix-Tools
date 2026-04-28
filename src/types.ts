export interface Tool {
  id: string;
  name: string;
  title: string;
  description: string;
  icon: string;
  slug: string;
  category: 'image-tools' | 'pdf-tools' | 'calculator-tools' | 'seo-tools' | 'text-tools' | 'utilities' | 'finance-tools';
  isNew?: boolean;
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
  features: string[];
  benefits: string[];
  useCases: string[];
  faqs: { question: string; answer: string }[];
  longContent: string;
  relatedTools?: string[];
}

export interface ToolCategory {
  id: string;
  name: string;
  description: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  date: string;
  author: string;
  image?: string;
  category: string;
  faqs?: { question: string; answer: string }[];
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
}
