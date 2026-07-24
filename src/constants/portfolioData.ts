import type { CaseStudy, PricingPlan, FAQItem, BlogPost } from '../types';

// Distinct Portfolio Local Image Assets
import nexusAnalyticsImg from '../assets/images/portfolio/nexus-analytics.jpg';
import aetheriaDesignImg from '../assets/images/portfolio/aetheria-design.jpg';
import omniflowAutomationImg from '../assets/images/portfolio/omniflow-automation.jpg';
import pulseMobileImg from '../assets/images/portfolio/pulse-mobile.jpg';
import luminaBrandImg from '../assets/images/portfolio/lumina-brand.jpg';
import cloudScaleImg from '../assets/images/portfolio/cloud-scale.jpg';

// Distinct Blog Local Image Assets
import blogReactImg from '../assets/images/blog/blog-react.jpg';
import blogDesignImg from '../assets/images/blog/blog-design.jpg';
import blogSupabaseImg from '../assets/images/blog/blog-supabase.jpg';

// Avatar Assets
import avatar1 from '../assets/avatars/avatar-1.jpg';
import avatar2 from '../assets/avatars/avatar-2.jpg';
import avatar3 from '../assets/avatars/avatar-3.jpg';
import avatar4 from '../assets/avatars/avatar-4.jpg';
import avatar5 from '../assets/avatars/avatar-5.jpg';
import avatar6 from '../assets/avatars/avatar-6.jpg';

export const CASE_STUDIES: CaseStudy[] = [
  {
    id: 'nexus-analytics',
    slug: 'nexus-analytics',
    title: 'Nexus Real-Time SaaS Analytics Engine',
    category: 'Web Development',
    client: 'Nexus Data Inc.',
    year: '2026',
    timeline: '12 Weeks',
    description: 'High-performance React & Next.js dashboard processing real-time telemetry streams for 500,000+ active enterprise users.',
    summary: 'Nexus needed an enterprise-grade analytics dashboard capable of rendering live charts without UI lag.',
    thumbnailUrl: nexusAnalyticsImg,
    heroImageUrl: nexusAnalyticsImg,
    metrics: [
      { label: 'Page Load Speed', value: '0.4s' },
      { label: 'Conversion Increase', value: '+185%' },
      { label: 'Daily Data Events', value: '12M+' },
    ],
    challenge: 'Nexus struggled with legacy dashboard latency when handling high-frequency data streams. Users experienced UI freezes and slow chart re-renders.',
    solution: 'Engineered a modular React 18 & Next.js App Router architecture using server-sent events, WebSockets, and optimized WebGL charts.',
    deliverables: [
      'React 18 & Next.js App Router Setup',
      'Real-Time WebSocket Data Layer',
      'Custom Recharts Component Library',
      'Supabase Database Schema & RLS Policies',
      'Automated Vercel Edge Hosting',
    ],
    techStack: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Supabase', 'WebSockets'],
    results: [
      'Reduced chart rendering latency by 85%',
      'Scaled system concurrency to 500k active users',
      'Achieved a perfect 100 Lighthouse performance score',
    ],
    testimonial: {
      quote: 'GM Digital Studio transformed our complex telemetry into a sleek, lightning-fast platform.',
      author: 'David Chen',
      role: 'Chief Technology Officer',
      company: 'Nexus Data Inc.',
      avatarUrl: avatar1,
    },
  },
  {
    id: 'aetheria-design-system',
    slug: 'aetheria-design-system',
    title: 'Aetheria Tokenized Cloud Design System',
    category: 'UI/UX Design',
    client: 'Aetheria Cloud',
    year: '2026',
    timeline: '8 Weeks',
    description: 'Comprehensive tokenized Figma design system and component library built for rapid cross-platform engineering.',
    summary: 'Aetheria required a unified multi-brand design system to standardize UI components across 4 web and mobile products.',
    thumbnailUrl: aetheriaDesignImg,
    heroImageUrl: aetheriaDesignImg,
    metrics: [
      { label: 'Design Velocity', value: '3x Faster' },
      { label: 'UI Components', value: '140+' },
      { label: 'Brand Consistency', value: '100%' },
    ],
    challenge: 'Aetheria had inconsistent UI patterns across products, leading to code duplication and slow feature rollouts.',
    solution: 'Designed a tokenized Figma visual system with automatic dark mode mapping, Storybook documentation, and Tailwind CSS configuration.',
    deliverables: [
      '140+ Accessible UI Components',
      'Tokenized Color & Typography Variables',
      'Storybook Component Documentation',
      'Framer Interactive Prototypes',
    ],
    techStack: ['Figma', 'Framer', 'Tailwind CSS', 'Storybook', 'Design Tokens'],
    results: [
      'Accelerated engineering sprint velocity by 300%',
      'Eliminated UI regressions across all product teams',
      'Standardized WCAG AAA accessibility compliance',
    ],
    testimonial: {
      quote: 'The design system GM Digital Studio created allows us to launch new features in days instead of weeks.',
      author: 'Elena Rostova',
      role: 'Design Director',
      company: 'Aetheria Cloud',
      avatarUrl: avatar2,
    },
  },
  {
    id: 'omniflow-automation',
    slug: 'omniflow-automation',
    title: 'OmniFlow Automated Data Sync & Webhooks',
    category: 'AI Automation',
    client: 'OmniFlow Global',
    year: '2026',
    timeline: '6 Weeks',
    description: 'Automated data integration pipeline connecting CRM platforms, transactional email engines, and webhooks.',
    summary: 'OmniFlow wanted to automate customer onboarding and eliminate manual data entry across marketing tools.',
    thumbnailUrl: omniflowAutomationImg,
    heroImageUrl: omniflowAutomationImg,
    metrics: [
      { label: 'Manual Hours Saved', value: '40hrs/wk' },
      { label: 'Data Sync Speed', value: '< 200ms' },
      { label: 'Error Reduction', value: '99.9%' },
    ],
    challenge: 'Manual data synchronization between CRM, payment, and analytics portals resulted in delayed customer onboarding.',
    solution: 'Built custom Python & Node.js edge functions with Supabase webhooks and Resend email triggers for automated workflows.',
    deliverables: [
      'Webhook Orchestration Engine',
      'Supabase Edge Functions',
      'Resend Transactional Email Templates',
      'Real-Time Error Handling & Logging',
    ],
    techStack: ['Python', 'Node.js', 'Supabase Edge Functions', 'Webhooks', 'Resend API'],
    results: [
      'Saved 40+ hours of manual administrative labor per week',
      'Achieved instant 200ms automated sync on customer signups',
    ],
    testimonial: {
      quote: 'Our operational bottlenecks disappeared overnight thanks to their automation engineering.',
      author: 'Marcus Vance',
      role: 'VP of Operations',
      company: 'OmniFlow Global',
      avatarUrl: avatar3,
    },
  },
  {
    id: 'pulse-mobile',
    slug: 'pulse-mobile',
    title: 'Pulse Mobile Health & Fitness App',
    category: 'Mobile Apps',
    client: 'Pulse Labs',
    year: '2026',
    timeline: '10 Weeks',
    description: 'Cross-platform iOS and Android mobile app built with React Native for real-time biometric tracking and offline sync.',
    summary: 'Pulse Labs required a high-performance cross-platform mobile app with offline synchronization.',
    thumbnailUrl: pulseMobileImg,
    heroImageUrl: pulseMobileImg,
    metrics: [
      { label: 'App Store Rating', value: '4.9 ★' },
      { label: 'Downloads', value: '250K+' },
      { label: 'Crash-Free Rate', value: '99.8%' },
    ],
    challenge: 'Building a unified mobile application for iOS and Android while maintaining native 60fps performance and offline data storage.',
    solution: 'Developed a React Native application with AsyncStorage local caching, Supabase database sync, and push notifications.',
    deliverables: [
      'React Native & Expo Architecture',
      'Offline-First Data Caching',
      'Push Notification Infrastructure',
      'App Store & Play Store Deployment',
    ],
    techStack: ['React Native', 'Expo', 'TypeScript', 'Supabase', 'Push APIs'],
    results: [
      'Achieved 250,000+ app downloads in first 90 days',
      'Maintained a 99.8% crash-free session rate',
    ],
    testimonial: {
      quote: 'GM Digital Studio built our mobile app flawlessly. User reviews have been stellar.',
      author: 'Sarah Jenkins',
      role: 'Product Lead',
      company: 'Pulse Labs',
      avatarUrl: avatar4,
    },
  },
  {
    id: 'lumina-brand',
    slug: 'lumina-brand',
    title: 'Lumina Global Brand Identity & System',
    category: 'UI/UX Design',
    client: 'Lumina Digital',
    year: '2026',
    timeline: '5 Weeks',
    description: 'Complete brand positioning, visual token guidelines, custom vector assets, and digital marketing system.',
    summary: 'Lumina needed a modern brand strategy to transition from a regional agency to a global tech player.',
    thumbnailUrl: luminaBrandImg,
    heroImageUrl: luminaBrandImg,
    metrics: [
      { label: 'Brand Value', value: '2.5x' },
      { label: 'Social Engagement', value: '+210%' },
      { label: 'Assets Exported', value: '350+' },
    ],
    challenge: 'Lumina had outdated branding that failed to communicate their technical expertise to enterprise clients.',
    solution: 'Created a sleek visual identity, modern typography scale, vector logo suite, and digital design tokens.',
    deliverables: [
      'Brand Identity Guidelines Book',
      'Vector Logo & Asset Library',
      'Digital & Social Media Marketing Kits',
      'Figma Brand Token Architecture',
    ],
    techStack: ['Figma', 'Illustrator', 'Design Tokens', 'Photoshop'],
    results: [
      'Successfully repositioned Lumina for global enterprise contracts',
      'Increased social engagement by 210%',
    ],
    testimonial: {
      quote: 'GM Digital Studio gave us a brand identity that commands immediate respect in our market.',
      author: 'Robert Wilson',
      role: 'Managing Director',
      company: 'Lumina Digital',
      avatarUrl: avatar5,
    },
  },
  {
    id: 'cloud-scale-architecture',
    slug: 'cloud-scale-architecture',
    title: 'CloudScale Enterprise Database Architecture',
    category: 'Web Development',
    client: 'CloudScale Systems',
    year: '2026',
    timeline: '7 Weeks',
    description: 'High-availability Supabase PostgreSQL database architecture with automated row-level security and serverless edge functions.',
    summary: 'CloudScale required a resilient cloud backend database capable of processing millions of encrypted transactions.',
    thumbnailUrl: cloudScaleImg,
    heroImageUrl: cloudScaleImg,
    metrics: [
      { label: 'Uptime SLA', value: '99.99%' },
      { label: 'Query Latency', value: '< 15ms' },
      { label: 'Data Encryption', value: 'AES-256' },
    ],
    challenge: 'Handling concurrent database transactions with zero downtime and strict compliance security.',
    solution: 'Deployed a multi-region PostgreSQL cluster with Supabase Auth, custom RLS policies, and automated failover.',
    deliverables: [
      'PostgreSQL Cluster Architecture',
      'Row Level Security (RLS) Rules',
      'Supabase Edge Functions SDK',
      'Automated Disaster Recovery Backups',
    ],
    techStack: ['Supabase', 'PostgreSQL', 'TypeScript', 'Docker', 'Vercel'],
    results: [
      'Maintained 99.99% operational uptime across all regions',
      'Sub-15ms database query response time',
    ],
    testimonial: {
      quote: 'Their database architects built an ultra-reliable foundation for our enterprise SaaS product.',
      author: 'Michael Vance',
      role: 'Head of Infrastructure',
      company: 'CloudScale Systems',
      avatarUrl: avatar6,
    },
  },
];

export const SERVICE_PRICING_CATEGORIES = [
  {
    id: 'web-dev',
    title: 'Web & SaaS Development',
    plans: [
      {
        id: 'web-starter',
        name: 'Starter Web Launch',
        description: 'High-converting React & Next.js platform ideal for startups and MVP product launches.',
        monthlyPrice: 2499,
        annualPrice: 1999,
        popular: false,
        features: [
          'Up to 5 Custom React Pages',
          'Mobile-First Responsive Design',
          'Core Web Vitals & Speed Optimization',
          'Contact Form & Resend API Integration',
          'SEO Metadata & OpenGraph Setup',
          '2 Weeks Post-Launch Support',
        ],
        ctaText: 'Start Web Project',
        ctaLink: '/contact',
      },
      {
        id: 'web-scale',
        name: 'Scale SaaS Platform',
        description: 'Complete web application with Supabase database, auth, and analytics dashboard.',
        monthlyPrice: 4999,
        annualPrice: 3999,
        popular: true,
        features: [
          'Up to 12 Custom Application Pages',
          'Supabase Database & Auth Architecture',
          'Row Level Security (RLS) & Roles',
          'Real-Time WebSockets & API Triggers',
          'Admin & Client Dashboard Setup',
          '30 Days Priority Support',
        ],
        ctaText: 'Build Scale SaaS',
        ctaLink: '/contact',
      },
    ],
  },
  {
    id: 'ui-ux',
    title: 'UI/UX & Product Design',
    plans: [
      {
        id: 'design-system',
        name: 'Tokenized Design System',
        description: 'Comprehensive Figma component library and tokenized visual architecture for multi-platform products.',
        monthlyPrice: 2999,
        annualPrice: 2399,
        popular: true,
        features: [
          '100+ Accessible Figma UI Components',
          'Tokenized Color & Typography Variables',
          'Light & Dark Mode Asset Mapping',
          'Interactive Framer Prototypes',
          'Developer Handoff Documentation',
        ],
        ctaText: 'Build Design System',
        ctaLink: '/contact',
      },
      {
        id: 'product-redesign',
        name: 'Full Product UX Redesign',
        description: 'End-to-end user journey audit, interactive wireframing, and conversion-focused interface overhaul.',
        monthlyPrice: 3999,
        annualPrice: 3199,
        popular: false,
        features: [
          'User Journey & Conversion Funnel Audit',
          'High-Fidelity Desktop & Mobile Prototypes',
          'Usability Testing & Micro-Interactions',
          'Figma to React Tailwind Code Tokens',
          'Dedicated UI Lead Designer',
        ],
        ctaText: 'Redesign Product UX',
        ctaLink: '/contact',
      },
    ],
  },
  {
    id: 'ai-automation',
    title: 'AI & Workflow Automation',
    plans: [
      {
        id: 'workflow-sync',
        name: 'API & Webhook Automation',
        description: 'Automated data pipelines connecting CRM, transactional email, and analytics tools.',
        monthlyPrice: 1999,
        annualPrice: 1599,
        popular: false,
        features: [
          'Custom Webhook & API Connectors',
          'Supabase Edge Functions Setup',
          'Transactional Resend Email Triggers',
          'Real-Time Error Logging & Alerts',
          'Operational Process Bottleneck Removal',
        ],
        ctaText: 'Automate Workflows',
        ctaLink: '/contact',
      },
      {
        id: 'ai-integration',
        name: 'Custom AI & Data Pipeline',
        description: 'Intelligent AI connectors and real-time automated data processing infrastructure.',
        monthlyPrice: 3499,
        annualPrice: 2799,
        popular: true,
        features: [
          'Custom AI Model Connectors & Prompts',
          'Automated Document Processing',
          'High-Frequency Data Event Sync',
          'Supabase Realtime Telemetry Layer',
          'Dedicated Automation Engineer',
        ],
        ctaText: 'Integrate AI Pipeline',
        ctaLink: '/contact',
      },
    ],
  },
  {
    id: 'mobile-dev',
    title: 'Cross-Platform Mobile Apps',
    plans: [
      {
        id: 'mobile-mvp',
        name: 'React Native Mobile MVP',
        description: 'Unified iOS and Android mobile app built for native performance and App Store launch.',
        monthlyPrice: 4499,
        annualPrice: 3599,
        popular: true,
        features: [
          'React Native & Expo Cross-Platform Codebase',
          'Offline Data Caching & Local Storage',
          'Push Notification Infrastructure',
          'Native Camera & Device Sensors',
          'App Store & Google Play Store Submission',
        ],
        ctaText: 'Build Mobile App',
        ctaLink: '/contact',
      },
    ],
  },
];

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'starter',
    name: 'Starter Development',
    description: 'Ideal for early-stage startups needing a high-converting web platform or MVP launch.',
    monthlyPrice: 2499,
    annualPrice: 1999,
    popular: false,
    features: [
      'Up to 5 Custom React Pages',
      'Mobile-First Responsive Layouts',
      'Tailwind CSS & Framer Motion',
      'Contact Form & Resend API Integration',
      'Core Web Vitals Speed Optimization',
      'SEO Metadata & OpenGraph Setup',
      '2 Weeks Post-Launch Support',
    ],
    ctaText: 'Start Starter Project',
    ctaLink: '/contact',
  },
  {
    id: 'scale',
    name: 'Scale SaaS Package',
    description: 'For growing companies requiring tokenized design systems, custom backend, and cloud database.',
    monthlyPrice: 4999,
    annualPrice: 3999,
    popular: true,
    features: [
      'Up to 12 Custom Web Application Pages',
      'Full Tokenized Figma Design System',
      'Supabase Database & Auth Architecture',
      'Row Level Security (RLS) Policies',
      'Automated API & Webhook Pipelines',
      'CMS & Analytics Dashboard Setup',
      'Priority 24/7 Support & Maintenance',
    ],
    ctaText: 'Scale Your Platform',
    ctaLink: '/contact',
  },
  {
    id: 'enterprise',
    name: 'Custom Enterprise',
    description: 'Dedicated engineering squad for complex cross-platform software and cloud architecture.',
    monthlyPrice: 8999,
    annualPrice: 7499,
    popular: false,
    features: [
      'Unlimited Web & Mobile Application Pages',
      'Dedicated Frontend & Solutions Architect',
      'React Native iOS & Android App Development',
      'High-Concurrency PostgreSQL Optimization',
      'Custom AI & Workflow Integration',
      'SLA Guaranteed Uptime & Security Audits',
      'Dedicated Slack Channel & Dedicated PM',
    ],
    ctaText: 'Request Enterprise Quote',
    ctaLink: '/contact',
  },
];

export const FAQ_ITEMS: FAQItem[] = [
  {
    id: 'faq-1',
    category: 'General',
    question: 'What core service offerings does GM Digital Studio provide?',
    answer: 'GM Digital Studio is a full-service digital engineering studio offering Web & SaaS Development, UI/UX & Tokenized Design Systems, Workflow & AI Automation, Brand Strategy & Visual Identity, Cross-Platform Mobile Applications, and Cloud & Database Architecture.',
  },
  {
    id: 'faq-2',
    category: 'General',
    question: 'How fast can you launch our digital product across your service lines?',
    answer: 'Timelines are tailored to service scope: Brand identity and UI/UX design sprints typically launch within 2 to 4 weeks, custom web platforms and AI automation pipelines take 3 to 6 weeks, while enterprise cross-platform mobile apps take 8 to 12 weeks from discovery to deployment.',
  },
  {
    id: 'faq-3',
    category: 'Engineering & Stack',
    question: 'What modern technologies do you use for software engineering?',
    answer: 'We leverage modern, industry-standard technology tailored to your product needs: React 18, Next.js 14 App Router, TypeScript, and Tailwind CSS for web platforms; React Native for mobile applications; and PostgreSQL, Supabase, and serverless Edge Functions for cloud backend infrastructure.',
  },
  {
    id: 'faq-4',
    category: 'Engineering & Stack',
    question: 'How do you guarantee Core Web Vitals and 99+ speed performance?',
    answer: 'We enforce server-side rendering, automatic WebP image compression, intelligent code splitting, edge network caching, and optimized layout assets to ensure 95 to 100 Lighthouse performance scores across all desktop and mobile devices.',
  },
  {
    id: 'faq-5',
    category: 'UI/UX & Design Systems',
    question: 'What deliverables are included in your UI/UX design systems?',
    answer: 'Our UI/UX design packages deliver complete tokenized Figma libraries, semantic variables for light and dark modes, responsive component libraries, interactive Framer prototypes, and comprehensive developer handoff documentation.',
  },
  {
    id: 'faq-6',
    category: 'UI/UX & Design Systems',
    question: 'Can you modernize our existing brand identity and visual guidelines?',
    answer: 'Yes! We conduct comprehensive visual identity audits, updating logos, typography, and color systems into scalable digital brand tokens while preserving your core brand recognition.',
  },
  {
    id: 'faq-7',
    category: 'Pricing & Contracts',
    question: 'Do you provide full IP assignment and source code ownership?',
    answer: 'Yes! Upon final milestone delivery, 100% of custom software code, tokenized Figma files, vector graphic assets, and cloud database scripts belong strictly to your company with full intellectual property assignment.',
  },
  {
    id: 'faq-8',
    category: 'Pricing & Contracts',
    question: 'What milestone and retainer payment structures do you support?',
    answer: 'We offer transparent milestone-based contracts (e.g., 50% deposit, 25% mid-sprint, 25% launch delivery) as well as monthly dedicated engineering squad retainers processed securely via Stripe or wire transfer.',
  },
  {
    id: 'faq-9',
    category: 'Security & SLA',
    question: 'How do you enforce security and data privacy across cloud projects?',
    answer: 'We implement strict Row-Level Security (RLS) database policies, SSL/TLS data encryption in transit and at rest, role-based authentication, and automated disaster-recovery database backups.',
  },
  {
    id: 'faq-10',
    category: 'Security & SLA',
    question: 'What post-launch SLA support and maintenance warranties do you offer?',
    answer: 'Every GM Digital Studio project includes 2 to 4 weeks of post-launch warranty support. We also provide ongoing SLA retainers covering priority bug resolution, cloud monitoring, and security updates.',
  },
  {
    id: 'faq-11',
    category: 'Engineering & Stack',
    question: 'Do you build native cross-platform mobile apps for iOS and Android?',
    answer: 'Yes, we engineer native-performing iOS and Android mobile applications using React Native and Expo with offline-first data caching, biometric security, and push notification infrastructure.',
  },
  {
    id: 'faq-12',
    category: 'General',
    question: 'How do we schedule a project consultation with your solutions team?',
    answer: 'Simply submit a request via our Contact page or book a 30-minute consultation call. Our lead solution architects will review your project requirements and deliver a detailed scope proposal within 24 hours.',
  },
];

export const BLOG_POSTS: BlogPost[] = [
  {
    id: 'building-scalable-react-18-architecture',
    slug: 'building-scalable-react-18-architecture',
    title: 'Building Scalable React 18 & Next.js 14 Web Architectures',
    category: 'Engineering',
    description: 'Learn how to structure enterprise React applications for optimal Core Web Vitals, server components, and rapid component development.',
    content: `Building modern web applications requires balancing client-side interactivity with server-rendered speed. With React 18 and the Next.js 14 App Router, developers have unprecedented control over render streaming, partial hydration, and edge execution.

### Key Architectural Pillars

1. **Server Components by Default:** Shift heavy rendering logic to the edge while keeping client JavaScript bundles ultra-light.
2. **Tokenized Design System Integration:** Standardize UI components with Tailwind CSS utility tokens to eliminate CSS bloat.
3. **Optimistic UI & Cache Revalidation:** Utilize React Server Actions and TanStack Query for instantaneous UI updates without loading spinners.

By adopting these principles, engineering teams can achieve Lighthouse 100 performance scores while maintaining rapid feature velocity.`,
    imageUrl: blogReactImg,
    readTime: '6 min read',
    publishedAt: 'July 20, 2026',
    author: {
      name: 'Alex Morgan',
      role: 'Principal Solutions Architect',
      avatarUrl: avatar1,
    },
    tags: ['React', 'Next.js', 'TypeScript', 'Performance'],
  },
  {
    id: 'tokenized-figma-design-systems-guide',
    slug: 'tokenized-figma-design-systems-guide',
    title: 'Designing Tokenized Figma UI Systems for Multi-Brand Scaling',
    category: 'UI/UX Design',
    description: 'A deep dive into structuring color, typography, and spacing tokens in Figma to streamline developer handoffs and dark mode support.',
    content: `Design tokens serve as the single source of truth connecting product designers with frontend engineers. By defining semantic variables for color modes, spacing grids, and typography scales, teams eliminate handoff friction and UI inconsistencies.

### Structuring Token Hierarchies

- **Global Tokens:** Base primitive values (e.g. \`color-brand-600: #ea580c\`).
- **Alias / Semantic Tokens:** Contextual usage variables (e.g. \`color-surface-primary: var(--color-brand-600)\`).
- **Component Tokens:** Element-specific bindings (e.g. \`button-bg-hover: var(--color-surface-primary)\`).

When automated with Figma Variables and exported directly to Tailwind CSS configurations, design systems enable multi-brand scaling across desktop and mobile applications.`,
    imageUrl: blogDesignImg,
    readTime: '8 min read',
    publishedAt: 'July 18, 2026',
    author: {
      name: 'Marcus Vance',
      role: 'Head of UI/UX Design',
      avatarUrl: avatar2,
    },
    tags: ['Figma', 'Design Systems', 'UI/UX', 'Tailwind CSS'],
  },
  {
    id: 'automating-workflows-supabase-edge-functions',
    slug: 'automating-workflows-supabase-edge-functions',
    title: 'Automating Enterprise Workflows with Supabase Edge Functions & Webhooks',
    category: 'AI & Automation',
    description: 'How to eliminate manual data entry by connecting CRMs, transactional email, and webhooks with serverless edge functions.',
    content: `Automated data pipelines reduce administrative overhead while improving customer onboarding speed. By deploying serverless TypeScript edge functions on Supabase, agencies can trigger transactional emails via Resend, process payment webhooks, and sync CRM records instantly.

### Implementation Checklist

1. Configure Supabase Webhook Database Triggers on \`INSERT\` and \`UPDATE\` events.
2. Deploy low-latency Deno/TypeScript Edge Functions to validate payload signatures.
3. Dispatch transactional emails using the Resend API SDK within sub-200ms execution windows.

This event-driven architecture eliminates operational bottlenecks and guarantees reliable background data delivery.`,
    imageUrl: blogSupabaseImg,
    readTime: '5 min read',
    publishedAt: 'July 15, 2026',
    author: {
      name: 'Sophia Chen',
      role: 'Lead Full-Stack Developer',
      avatarUrl: avatar3,
    },
    tags: ['Supabase', 'Python', 'Webhooks', 'Resend'],
  },
];
