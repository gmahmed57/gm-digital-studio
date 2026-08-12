import React from 'react';
import { motion } from 'framer-motion';
import { Target, ShieldCheck, Zap, Users, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import TrustedLogosBar from '../components/home/TrustedLogosBar';

import heroBgVideo from '../assets/videos/hero-bg.mp4';
import aboutTeamImg from '../assets/images/about-team.jpg';
import avatar1 from '../assets/avatars/avatar-1.jpg';
import avatar2 from '../assets/avatars/avatar-2.jpg';
import avatar3 from '../assets/avatars/avatar-3.jpg';
import avatar4 from '../assets/avatars/avatar-4.jpg';

const VALUES = [
  {
    icon: <Zap className="w-6 h-6 text-brand-600 dark:text-brand-500" />,
    title: 'Speed & Execution',
    description: 'We move fast without sacrificing code quality, delivering product iterations in half the industry standard time.',
  },
  {
    icon: <Target className="w-6 h-6 text-brand-600 dark:text-brand-500" />,
    title: 'User-Centric Precision',
    description: 'Every interface and backend API we build is structured around seamless user experience and measurable business outcomes.',
  },
  {
    icon: <ShieldCheck className="w-6 h-6 text-brand-600 dark:text-brand-500" />,
    title: 'Engineering Reliability',
    description: 'We construct production-ready React and cloud architectures engineered for high availability and military-grade security.',
  },
  {
    icon: <Users className="w-6 h-6 text-brand-600 dark:text-brand-500" />,
    title: 'Transparent Partnership',
    description: 'We work as an extension of your internal product team with open communication, clear sprint timelines, and zero surprises.',
  },
];

const TEAM_MEMBERS = [
  {
    name: 'Alex Morgan',
    role: 'Principal Solutions Architect',
    avatar: avatar1,
    bio: 'Over 10 years of experience designing high-scale React, Next.js, and cloud database infrastructure.',
  },
  {
    name: 'Marcus Vance',
    role: 'Head of UI/UX Design',
    avatar: avatar2,
    bio: 'Specializes in Figma design systems, micro-interactions, and conversion-focused SaaS interfaces.',
  },
  {
    name: 'Sophia Chen',
    role: 'Lead Full-Stack Developer',
    avatar: avatar3,
    bio: 'Expert in TypeScript, Supabase backend architecture, and automated API integration pipelines.',
  },
  {
    name: 'David Reynolds',
    role: 'DevOps & Cloud Engineer',
    avatar: avatar4,
    bio: 'Focused on serverless deployments, CI/CD automation, PostgreSQL optimization, and high availability.',
  },
];

const About: React.FC = () => {
  return (
    <div className="w-full bg-white dark:bg-dark-bg text-gray-900 dark:text-white font-sans">
      
      {/* Hero Header with Relevant Ambient Video Loop */}
      <section className="py-24 bg-gray-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-45 scale-105"
          >
            <source src={heroBgVideo} type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-gray-950/75 via-gray-950/65 to-gray-950 z-10" />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-20">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl sm:text-6xl font-heading font-black tracking-tight mb-6"
          >
            We Engineer Digital Products <br />
            <span className="text-brand-500">Built For Industry Scale</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg sm:text-xl text-gray-300 leading-relaxed max-w-2xl mx-auto font-normal"
          >
            GM Digital Studio is a premier digital engineering studio. We combine strategic UI/UX design with modern React, TypeScript, and cloud technology to empower ambitious brands.
          </motion.p>
        </div>
      </section>

      {/* Our Mission & Story */}
      <section className="py-20 bg-white dark:bg-dark-bg border-b border-gray-100 dark:border-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl sm:text-4xl font-heading font-black tracking-tight mb-6 text-gray-900 dark:text-white">
                Driven by Craftsmanship & Engineering Excellence
              </h2>
              <p className="text-base text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                Founded with a mission to bridge the gap between design aesthetic and technical execution, GM Digital Studio partners with startups and global enterprises to launch scalable software.
              </p>
              <p className="text-base text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                Our team handles the end-to-end product lifecycle—from initial wireframes and interactive prototypes to high-concurrency database architecture and automated cloud hosting.
              </p>

              <div className="flex items-center gap-6 pt-4 border-t border-gray-100 dark:border-gray-800">
                <div>
                  <span className="block text-3xl font-black text-brand-600 dark:text-brand-500">250+</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Products Delivered</span>
                </div>
                <div className="h-10 w-px bg-gray-200 dark:bg-gray-800" />
                <div>
                  <span className="block text-3xl font-black text-brand-600 dark:text-brand-500">99.2%</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Client Retention</span>
                </div>
                <div className="h-10 w-px bg-gray-200 dark:bg-gray-800" />
                <div>
                  <span className="block text-3xl font-black text-brand-600 dark:text-brand-500">15+</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Countries Reached</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl bg-gray-900 border border-gray-200 dark:border-gray-800"
            >
              <img
                src={aboutTeamImg}
                alt="Engineering Team Collaboration"
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover object-center"
              />
            </motion.div>

          </div>
        </div>
      </section>

      {/* Trusted Client Logos Bar (Before Core Principles) */}
      <TrustedLogosBar />

      {/* Core Principles */}
      <section className="py-24 bg-gray-50/80 dark:bg-dark-surface/40 border-b border-gray-200/80 dark:border-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-5xl font-heading font-black tracking-tight mb-4 text-gray-900 dark:text-white">
              Our Core Principles
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed">
              These fundamental values guide our software architecture, design decisions, and client relationships every day.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {VALUES.map((val, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
                className="p-7 rounded-2xl bg-white dark:bg-dark-bg border border-gray-200/80 dark:border-dark-border shadow-sm hover:shadow-xl transition-all"
              >
                <div className="p-3 rounded-xl bg-brand-50 dark:bg-brand-950/60 w-fit mb-5 border border-brand-100 dark:border-brand-900">
                  {val.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {val.title}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  {val.description}
                </p>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* Leadership Team Grid */}
      <section className="py-24 bg-white dark:bg-dark-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-5xl font-heading font-black tracking-tight mb-4 text-gray-900 dark:text-white">
              Leadership & Engineering Team
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed">
              Meet the specialists behind our software engineering, product design, and cloud architecture.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {TEAM_MEMBERS.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
                className="rounded-2xl bg-white dark:bg-dark-surface border border-gray-200/80 dark:border-dark-border overflow-hidden shadow-sm hover:shadow-xl transition-all group flex flex-col justify-between"
              >
                <div className="aspect-[4/5] overflow-hidden bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                    {member.name}
                  </h3>
                  <span className="block text-xs font-bold text-brand-600 dark:text-brand-400 mb-3">
                    {member.role}
                  </span>
                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                    {member.bio}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* Brand-Orange Floating Card CTA Banner */}
      <section className="py-20 bg-white dark:bg-dark-bg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl bg-brand-600 text-white p-10 sm:p-14 text-center shadow-2xl overflow-hidden border border-brand-500">
            <h2 className="text-3xl sm:text-4xl font-heading font-black mb-4 text-white">
              Ready to Build Your Next Product With Us?
            </h2>
            <p className="text-orange-100 text-base mb-8 max-w-xl mx-auto font-medium">
              Let's discuss your product roadmap and engineering requirements with our solutions architects.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-white hover:bg-gray-100 text-gray-950 font-bold text-base shadow-xl transition-all hover:scale-105"
            >
              <span>Start a Project</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default About;
