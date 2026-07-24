export interface CaseStudy {
  id: string;
  title: string;
  slug: string;
  category: 'Web Development' | 'UI/UX Design' | 'AI Automation' | 'Mobile Apps';
  client: string;
  year: string;
  timeline: string;
  description: string;
  summary: string;
  thumbnailUrl: string;
  heroImageUrl: string;
  videoUrl?: string;
  metrics: { label: string; value: string }[];
  challenge: string;
  solution: string;
  deliverables: string[];
  techStack: string[];
  results: string[];
  testimonial?: {
    quote: string;
    author: string;
    role: string;
    company: string;
    avatarUrl: string;
  };
}

export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  popular?: boolean;
  features: string[];
  ctaText: string;
  ctaLink: string;
}

export interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  category: 'Engineering' | 'UI/UX Design' | 'AI & Automation' | 'Strategy';
  description: string;
  content: string;
  imageUrl: string;
  readTime: string;
  publishedAt: string;
  author: {
    name: string;
    role: string;
    avatarUrl: string;
  };
  tags: string[];
}
