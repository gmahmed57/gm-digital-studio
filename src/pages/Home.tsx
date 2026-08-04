import HeroSection from '../components/home/HeroSection';
import TrustedLogosBar from '../components/home/TrustedLogosBar';
import ServicesPreviewSection from '../components/home/ServicesPreviewSection';
import StatsSection from '../components/home/StatsSection';
import FeaturedProjectsSection from '../components/home/FeaturedProjectsSection';
import TestimonialsSection from '../components/home/TestimonialsSection';
import CTASection from '../components/home/CTASection';
import SEO from '../components/common/SEO';

const Home = () => {
  return (
    <div className="w-full space-y-0 font-sans">
      <SEO
        title="Home | Premium Software & Creative Agency"
        description="Premium SaaS digital studio designing and engineering high-velocity websites, UI/UX design systems, and custom AI automation pipelines."
      />
      <HeroSection />
      <TrustedLogosBar />
      <ServicesPreviewSection />
      <StatsSection />
      <FeaturedProjectsSection />
      <TestimonialsSection />
      <CTASection />
    </div>
  );
};

export default Home;
