export interface ClientLogo {
  id: string;
  name: string;
  logoUrl: string;
}

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  icon: any;
  features: string[];
  iconName?: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  category: string;
  description: string;
  imageUrl: string;
  tags: string[];
  liveUrl?: string;
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

export * from './portfolio';

