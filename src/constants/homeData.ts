import { Code, Layout, Cpu, Sparkles, Smartphone, Database } from 'lucide-react';
import type { ServiceItem, PortfolioItem, TestimonialItem, ClientLogo } from '../types';

import stripeLogo from '../assets/logos/stripe.svg';
import vercelLogo from '../assets/logos/vercel.svg';
import supabaseLogo from '../assets/logos/supabase.svg';
import framerLogo from '../assets/logos/framer.svg';
import linearLogo from '../assets/logos/linear.svg';
import figmaLogo from '../assets/logos/figma.svg';

import nexusAnalyticsImg from '../assets/images/portfolio/nexus-analytics.jpg';
import aetheriaDesignImg from '../assets/images/portfolio/aetheria-design.jpg';
import omniflowAutomationImg from '../assets/images/portfolio/omniflow-automation.jpg';

import avatar1 from '../assets/avatars/avatar-3.jpg';
import avatar2 from '../assets/avatars/avatar-2.jpg';
import avatar3 from '../assets/avatars/avatar-1.jpg';
import avatar4 from '../assets/avatars/avatar-4.jpg';
import avatar5 from '../assets/avatars/avatar-5.jpg';
import avatar6 from '../assets/avatars/avatar-6.jpg';

export const CLIENT_LOGOS: ClientLogo[] = [
  { id: '1', name: 'Stripe', logoUrl: stripeLogo },
  { id: '2', name: 'Vercel', logoUrl: vercelLogo },
  { id: '3', name: 'Supabase', logoUrl: supabaseLogo },
  { id: '4', name: 'Framer', logoUrl: framerLogo },
  { id: '5', name: 'Linear', logoUrl: linearLogo },
  { id: '6', name: 'Figma', logoUrl: figmaLogo },
];

export const COMPANY_LOGOS = CLIENT_LOGOS;

export const SERVICES: ServiceItem[] = [
  {
    id: 'web-dev',
    title: 'Modern Web Development',
    description: 'High-performance React & Next.js web applications engineered for Core Web Vitals and speed.',
    icon: Code,
    iconName: 'Code2',
    features: ['React & Next.js Architecture', 'Core Web Vitals Optimization', 'SEO & Accessibility Compliance'],
  },
  {
    id: 'ui-ux',
    title: 'UI/UX & Product Design',
    description: 'Intuitive user interface design and Figma design systems built for optimal conversion rates.',
    icon: Layout,
    iconName: 'Layout',
    features: ['Design System Architecture', 'Interactive Prototyping', 'User Journey Optimization'],
  },
  {
    id: 'ai-automation',
    title: 'Workflow & AI Automation',
    description: 'Custom API integrations and automated data pipelines designed to streamline digital operations.',
    icon: Cpu,
    iconName: 'Cpu',
    features: ['API & Webhooks Integration', 'Automated Data Sync', 'Operational Bottleneck Removal'],
  },
  {
    id: 'brand-identity',
    title: 'Brand Strategy & Identity',
    description: 'Memorable brand positioning, visual style guides, and design tokens for scaling tech brands.',
    icon: Sparkles,
    iconName: 'Sparkles',
    features: ['Brand Identity Guidelines', 'Color & Typography Tokens', 'Vector Asset Libraries'],
  },
  {
    id: 'mobile-dev',
    title: 'Cross-Platform Mobile Apps',
    description: 'Native-performing iOS and Android applications built with React Native for smooth performance.',
    icon: Smartphone,
    iconName: 'Smartphone',
    features: ['React Native Infrastructure', 'Offline Data Caching', 'App Store Deployment'],
  },
  {
    id: 'cloud-devops',
    title: 'Cloud & Database Architecture',
    description: 'Resilient backend infrastructure using high-concurrency cloud databases, microservices, and serverless edge deployment.',
    icon: Database,
    iconName: 'Database',
    features: ['PostgreSQL & Granular Security', 'SSO & Identity Authentication', 'Serverless Cloud Hosting'],
  },
];

export const FEATURED_SERVICES = SERVICES;

export const COMPANY_STATS = [
  {
    id: '1',
    value: '250+',
    label: 'Projects Completed',
    description: 'High-performing web platforms and custom SaaS solutions launched worldwide.',
  },
  {
    id: '2',
    value: '99.2%',
    label: 'Client Retention',
    description: 'Long-term partnerships built on engineering excellence and transparent delivery.',
  },
  {
    id: '3',
    value: '50+',
    label: 'Global Enterprise Clients',
    description: 'Trusted by high-growth startups and established digital enterprises.',
  },
  {
    id: '4',
    value: '2x Faster',
    label: 'Deployment Speed',
    description: 'Rapid product iterations from initial wireframes to production hosting.',
  },
];

export const PORTFOLIO_PROJECTS: PortfolioItem[] = [
  {
    id: 'nexus-analytics',
    title: 'Nexus SaaS Analytics Dashboard',
    category: 'Web Development',
    description: 'Real-time analytics engine and React data visualization dashboard processing high-frequency data streams.',
    imageUrl: nexusAnalyticsImg,
    tags: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS'],
    liveUrl: '/portfolio/nexus-analytics',
  },
  {
    id: 'aetheria-design',
    title: 'Aetheria Cloud Design System',
    category: 'UI/UX Design',
    description: 'Full tokenized Figma design system and component library built for rapid cross-platform deployment.',
    imageUrl: aetheriaDesignImg,
    tags: ['Figma', 'Design Systems', 'UI/UX', 'Tailwind CSS'],
    liveUrl: '/portfolio/aetheria-design',
  },
  {
    id: 'omniflow-automation',
    title: 'OmniFlow API & Workflow Automation',
    category: 'Workflow & AI Automation',
    description: 'Automated data integration pipeline connecting CRM platforms, transactional email, and webhooks.',
    imageUrl: omniflowAutomationImg,
    tags: ['Python', 'Node.js', 'Webhooks', 'Supabase'],
    liveUrl: '/portfolio/omniflow-automation',
  },
];

export const FEATURED_PROJECTS = PORTFOLIO_PROJECTS;

export const TESTIMONIALS: TestimonialItem[] = [
  {
    id: '1',
    name: 'Sarah Jenkins',
    role: 'Head of Product',
    company: 'Vanguard Tech',
    avatarUrl: avatar1,
    rating: 5,
    content: 'GM Digital Studio completely transformed our web application. Their speed, attention to design detail, and clean code quality set them apart.',
  },
  {
    id: '2',
    name: 'David Chen',
    role: 'Founder & CEO',
    company: 'Aetheria Cloud',
    avatarUrl: avatar2,
    rating: 5,
    content: 'The team delivered our SaaS platform ahead of schedule with exceptional UI polish and smooth component architecture.',
  },
  {
    id: '3',
    name: 'Elena Rostova',
    role: 'Design Director',
    company: 'Lumina Digital',
    avatarUrl: avatar3,
    rating: 5,
    content: 'Working with GM Digital Studio felt seamless. Their design system approach allowed our team to scale new features effortlessly.',
  },
  {
    id: '4',
    name: 'Michael Brown',
    role: 'Chief Technology Officer',
    company: 'Delta Labs',
    avatarUrl: avatar4,
    rating: 5,
    content: 'Outstanding technical execution. They built our cloud backend and responsive frontend with complete precision.',
  },
  {
    id: '5',
    name: 'Emily Davis',
    role: 'VP of Marketing',
    company: 'Epsilon Media',
    avatarUrl: avatar5,
    rating: 5,
    content: 'Our conversion rates increased significantly after launching our redesigned web platform built by GM Digital Studio.',
  },
  {
    id: '6',
    name: 'Robert Wilson',
    role: 'Managing Director',
    company: 'Zeta Solutions',
    avatarUrl: avatar6,
    rating: 5,
    content: 'Professional, highly skilled, and reliable. GM Digital Studio is our go-to partner for all major web development projects.',
  },
];
