export interface StatItem {
  id: string;
  label: string;
  value: string;
  change: string;
  description: string;
}

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  iconName: string;
  features: string[];
}

export interface ProjectItem {
  id: string;
  title: string;
  category: string;
  description: string;
  imageUrl: string;
  client: string;
}

export interface TestimonialItem {
  id: string;
  name: string;
  role: string;
  company: string;
  avatarUrl: string;
  rating: number;
  content: string;
}

export interface CompanyLogo {
  id: string;
  name: string;
  logoUrl: string;
}

export const COMPANY_LOGOS: CompanyLogo[] = [
  { id: '1', name: 'Stripe', logoUrl: 'https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/stripe.svg' },
  { id: '2', name: 'Vercel', logoUrl: 'https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/vercel.svg' },
  { id: '3', name: 'Supabase', logoUrl: 'https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/supabase.svg' },
  { id: '4', name: 'Framer', logoUrl: 'https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/framer.svg' },
  { id: '5', name: 'Linear', logoUrl: 'https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/linear.svg' },
  { id: '6', name: 'Figma', logoUrl: 'https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/figma.svg' },
];

export const COMPANY_STATS: StatItem[] = [
  {
    id: '1',
    label: 'Projects Completed',
    value: '250+',
    change: '+35% YoY',
    description: 'High-performing web platforms and custom SaaS solutions launched worldwide.',
  },
  {
    id: '2',
    label: 'Client Retention',
    value: '99.2%',
    change: 'Industry Leading',
    description: 'Long-term partnerships built on engineering excellence and transparent delivery.',
  },
  {
    id: '3',
    label: 'Global Enterprise Clients',
    value: '50+',
    change: '15 Countries',
    description: 'Trusted by high-growth startups and established digital enterprises.',
  },
  {
    id: '4',
    label: 'Deployment Speed',
    value: '2x Faster',
    change: 'Agile Delivery',
    description: 'Rapid product iterations from initial wireframes to production hosting.',
  },
];

export const FEATURED_SERVICES: ServiceItem[] = [
  {
    id: 'web-dev',
    title: 'Modern Web Development',
    description: 'Scalable React and Next.js applications built for lightning speed, Core Web Vitals optimization, and flawless responsiveness.',
    iconName: 'Code2',
    features: ['React & Next.js Architecture', 'Responsive Mobile-First Layouts', 'SEO & Performance Optimization'],
  },
  {
    id: 'ui-ux',
    title: 'UI/UX & Product Design',
    description: 'Intuitive user interface design and comprehensive Figma design systems structured to boost user engagement and conversion.',
    iconName: 'Layout',
    features: ['Figma Design Systems', 'Interactive Prototypes', 'User Experience Audits'],
  },
  {
    id: 'ai-automation',
    title: 'Workflow & AI Automation',
    description: 'Smart API integrations and automated data pipelines designed to streamline operations and eliminate manual overhead.',
    iconName: 'Cpu',
    features: ['Custom API Integrations', 'Automated Data Pipelines', 'Process Streamlining'],
  },
  {
    id: 'brand-identity',
    title: 'Brand Strategy & Identity',
    description: 'Memorable brand positioning, visual style guides, custom typography, and complete visual identity systems.',
    iconName: 'Sparkles',
    features: ['Visual Brand Assets', 'Typography Guidelines', 'Color Palette Systems'],
  },
  {
    id: 'mobile-dev',
    title: 'Cross-Platform Mobile Apps',
    description: 'Native-performing iOS and Android applications built with React Native for seamless user experiences.',
    iconName: 'Smartphone',
    features: ['Cross-Platform Apps', 'Offline Data Sync', 'Native Feature Access'],
  },
  {
    id: 'cloud-devops',
    title: 'Cloud & Database Architecture',
    description: 'Resilient backend infrastructure using Supabase, PostgreSQL, row-level security, and serverless cloud deployment.',
    iconName: 'Database',
    features: ['Database Architecture', 'Authentication Systems', 'Cloud Serverless Deployment'],
  },
];

export const FEATURED_PROJECTS: ProjectItem[] = [
  {
    id: 'project-1',
    title: 'Enterprise Analytics Dashboard',
    category: 'Web Application',
    description: 'A real-time financial tracking platform featuring custom data visualization, role-based access, and instant CSV reporting.',
    imageUrl: 'https://images.pexels.com/photos/326514/pexels-photo-326514.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
    client: 'FinPulse Systems',
  },
  {
    id: 'project-2',
    title: 'Global E-Commerce Platform',
    category: 'E-Commerce',
    description: 'A high-converting online storefront with dynamic product filtering, multi-currency support, and frictionless Stripe checkout.',
    imageUrl: 'https://images.pexels.com/photos/39559/ipad-mockup-apple-business-39559.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
    client: 'LuxeLiving Group',
  },
  {
    id: 'project-3',
    title: 'Cloud Collaboration Hub',
    category: 'SaaS Platform',
    description: 'A cloud-native team management tool supporting real-time document syncing, activity feeds, and automated notifications.',
    imageUrl: 'https://images.pexels.com/photos/461073/pexels-photo-461073.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
    client: 'Nexus AI Labs',
  },
];

export const TESTIMONIALS: TestimonialItem[] = [
  {
    id: '1',
    name: 'Sarah Jenkins',
    role: 'Head of Product',
    company: 'Vanguard Tech',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80',
    rating: 5,
    content: 'GM Studio completely transformed our web application. Their speed, attention to design detail, and clean code quality set them apart.',
  },
  {
    id: '2',
    name: 'David Chen',
    role: 'Founder & CEO',
    company: 'Aetheria Cloud',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
    rating: 5,
    content: 'The team delivered our SaaS platform ahead of schedule with exceptional UI polish and smooth component architecture.',
  },
  {
    id: '3',
    name: 'Elena Rostova',
    role: 'Design Director',
    company: 'Lumina Digital',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
    rating: 5,
    content: 'Working with GM Studio felt seamless. Their design system approach allowed our team to scale new features effortlessly.',
  },
  {
    id: '4',
    name: 'Michael Brown',
    role: 'Chief Technology Officer',
    company: 'Delta Labs',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80',
    rating: 5,
    content: 'Outstanding technical execution. They built our cloud backend and responsive frontend with complete precision.',
  },
  {
    id: '5',
    name: 'Emily Davis',
    role: 'VP of Marketing',
    company: 'Epsilon Media',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=250&q=80',
    rating: 5,
    content: 'Our conversion rates increased significantly after launching our redesigned web platform built by GM Studio.',
  },
  {
    id: '6',
    name: 'Robert Wilson',
    role: 'Managing Director',
    company: 'Zeta Solutions',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=250&q=80',
    rating: 5,
    content: 'Professional, highly skilled, and reliable. GM Studio is our go-to partner for all major web development projects.',
  },
];
