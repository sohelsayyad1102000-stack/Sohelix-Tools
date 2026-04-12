export interface Tool {
  id: string;
  name: string;
  title: string;
  description: string;
  icon: string;
  slug: string;
  category: 'image-tools' | 'pdf-tools' | 'calculator-tools' | 'seo-tools' | 'misc';
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
}

export interface ToolCategory {
  id: string;
  name: string;
  description: string;
}
