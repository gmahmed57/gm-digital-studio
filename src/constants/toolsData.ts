import type { StudioTool } from '../types/client';

export const normalizeToolId = (id: string): string => {
  if (!id) return '';
  if (id === 'carousel-maker') return 'ai-carousel';
  if (id === 'ai-copywriter') return 'ai-assistant';
  return id;
};

export const MASTER_STUDIO_TOOLS: StudioTool[] = [
  {
    id: 'ai-carousel',
    name: 'AI Carousel Post Maker',
    category: 'Marketing & Design',
    description: 'Automate multi-slide social media carousel generation with custom brand templates and instant exports.',
    iconName: 'LayoutGrid',
    isPremium: true,
    version: 'v2.4',
    actionLabel: 'Launch Generator',
  },
  {
    id: 'file-converter',
    name: 'Media & File Converter',
    category: 'Asset Management',
    description: 'High-speed client video, WebP image, and PDF document converter with zero quality loss.',
    iconName: 'FileSpreadsheet',
    isPremium: false,
    version: 'v1.8',
    actionLabel: 'Convert Files',
  },
  {
    id: 'ai-assistant',
    name: 'AI Studio Content Assistant',
    category: 'Content Generation',
    description: 'Generate SEO blog drafts, landing page headlines, and email campaign copy tailored to your brand voice.',
    iconName: 'Sparkles',
    isPremium: true,
    version: 'v3.1',
    actionLabel: 'Open Assistant',
  },
  {
    id: 'seo-auditor',
    name: 'SEO & Performance Auditor',
    category: 'Analytics & SEO',
    description: 'Real-time domain health monitoring, keyword rankings tracker, and automated Lighthouse audit reports.',
    iconName: 'Search',
    isPremium: true,
    version: 'v2.0',
    actionLabel: 'Run Audit',
  },
  {
    id: 'brand-kit',
    name: 'Brand Assets & Design Tokens',
    category: 'Design Systems',
    description: 'Centralized brand asset library containing official logos, typography rules, and exported Tailwind tokens.',
    iconName: 'Palette',
    isPremium: false,
    version: 'v1.5',
    actionLabel: 'View Brand Kit',
  },
];
