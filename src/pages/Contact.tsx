import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, AlertCircle, ChevronDown } from 'lucide-react';
import { sendContactEmail } from '../services/resendService';
import { contactService } from '../services/contactService';
import { notificationService } from '../services/notificationService';
import { settingsService, type WebsiteSettings } from '../services/settingsService';
import contactBgVideo from '../assets/videos/contact-bg.mp4';
import contactGif from '../assets/animation/contact us.gif';
import TrustedLogosBar from '../components/home/TrustedLogosBar';
import SEO from '../components/common/SEO';

// Zod Validation Schema
const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Please enter a valid email address.'),
  company: z.string().optional(),
  service: z.string().min(1, 'Please select a service.'),
  budget: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters.'),
});

type ContactFormInputs = z.infer<typeof contactSchema>;

const FAQS = [
  {
    question: 'What is your typical project timeline across your core services?',
    answer: 'Product timelines vary by service: UI/UX design systems and brand identity projects launch within 2 to 4 weeks, custom web platforms and AI automation pipelines take 3 to 6 weeks, while cross-platform mobile apps take 8 to 12 weeks from discovery to deployment.',
  },
  {
    question: 'How do you structure project pricing & milestone contracts?',
    answer: 'We offer transparent, milestone-based contracts across all services (e.g., 50% deposit, 25% mid-sprint, 25% final delivery) as well as flexible monthly retainers for ongoing digital engineering.',
  },
  {
    question: 'Can you work with our existing brand guidelines, design files, or software stack?',
    answer: 'Yes! Whether you need a UI/UX audit of an existing design file, integration with your current software workflow, or a complete digital brand modernization, our team seamlessly aligns with your existing team assets.',
  },
  {
    question: 'What support and post-launch guarantees do you provide?',
    answer: 'Every GM Digital Studio project includes 2 to 4 weeks of post-launch warranty support across all deliverables. We also provide ongoing SLA maintenance, security audits, and performance optimization retainers.',
  },
];

const Contact: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [settings, setSettings] = useState<WebsiteSettings | null>(null);

  useEffect(() => {
    settingsService.getSettings().then((data) => setSettings(data));
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormInputs>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      service: 'Web Development',
    },
  });

  const onSubmit = async (data: ContactFormInputs) => {
    setIsSubmitting(true);
    setFeedback(null);

    try {
      // 1. Submit to database
      await contactService.submitContactForm({
        name: data.name,
        email: data.email,
        company: data.company || '',
        service: data.service,
        budget: data.budget || '',
        message: data.message,
      });

      // 2. Broadcast live targeted notification to Admin
      try {
        await notificationService.addNotification({
          title: 'New Project Inquiry',
          message: `${data.name} submitted a new inquiry for ${data.service}.`,
          type: 'system',
          targetRole: 'admin',
          link: '/admin/settings?tab=inquiries',
        });
      } catch {
        // Soft catch if RLS policy restricts unauthenticated insert
      }

      // 3. Send email via Resend
      const res = await sendContactEmail(data);
      if (res.success) {
        setFeedback({ type: 'success', message: res.message });
        reset();
      } else {
        setFeedback({ type: 'error', message: res.message });
      }
    } catch (err: any) {
      console.error('Contact form submission error:', err);
      setFeedback({ type: 'error', message: 'Failed to process inquiry. Please try again or contact us directly.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-white dark:bg-dark-bg text-gray-900 dark:text-white font-sans">
      <SEO
        title="Contact Solutions Team & Estimate Request"
        description="Get in touch with GM Digital Studio's solutions team for a custom project estimate, software roadmap, or consultation."
      />

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
            <source src={contactBgVideo} type="video/mp4" />
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
            Let's Build Something <br />
            <span className="text-brand-500">Extraordinary Together</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg sm:text-xl text-gray-300 leading-relaxed max-w-2xl mx-auto font-normal"
          >
            Have a project in mind or need technical guidance? Reach out to our solutions team and let's turn your concept into production software.
          </motion.p>
        </div>
      </section>

      {/* Main Contact Grid */}
      <section className="py-24 bg-white dark:bg-dark-bg border-b border-gray-100 dark:border-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
            
            {/* Contact Details Column with Animated GIF Showcase */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
              <div>
                <h2 className="text-3xl font-heading font-black text-gray-900 dark:text-white mb-3">
                  Get in Touch
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  Fill out the project form or connect directly through our studio communication channels.
                </p>
              </div>

              {/* Animated Contact GIF Card */}
              <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-md">
                <img
                  src={contactGif}
                  alt="Contact Solutions Team"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="p-4 rounded-2xl bg-gray-50/80 dark:bg-dark-surface border border-gray-200/80 dark:border-dark-border flex flex-col justify-between">
                  <div className="p-2.5 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-500 border border-brand-100 dark:border-brand-900 w-fit mb-2">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 mb-0.5">Email Us</h4>
                    <a href={`mailto:${settings?.contactEmail || 'support@gmdigitalstudio.app'}`} className="text-xs text-gray-900 dark:text-white font-bold hover:text-brand-600 transition-colors break-all">
                      {settings?.contactEmail || 'support@gmdigitalstudio.app'}
                    </a>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-gray-50/80 dark:bg-dark-surface border border-gray-200/80 dark:border-dark-border flex flex-col justify-between">
                  <div className="p-2.5 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-500 border border-brand-100 dark:border-brand-900 w-fit mb-2">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 mb-0.5">Call Us</h4>
                    <p className="text-xs text-gray-900 dark:text-white font-bold">{settings?.contactPhone || '+1 (555) 019-2834'}</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-gray-50/80 dark:bg-dark-surface border border-gray-200/80 dark:border-dark-border flex flex-col justify-between">
                  <div className="p-2.5 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-500 border border-brand-100 dark:border-brand-900 w-fit mb-2">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 mb-0.5">Studio Location</h4>
                    <p className="text-xs text-gray-900 dark:text-white font-bold leading-tight">{settings?.contactAddress || '123 Creative Suite, Tech City'}</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-gray-50/80 dark:bg-dark-surface border border-gray-200/80 dark:border-dark-border flex flex-col justify-between">
                  <div className="p-2.5 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-500 border border-brand-100 dark:border-brand-900 w-fit mb-2">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 mb-0.5">Operating Hours</h4>
                    <p className="text-xs text-gray-900 dark:text-white font-bold leading-tight">Mon - Fri: 9:00 AM - 6:00 PM EST</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form Column */}
            <div className="lg:col-span-7 h-full flex flex-col">
              <div className="p-8 sm:p-10 rounded-3xl bg-gray-50/80 dark:bg-dark-surface border border-gray-200/80 dark:border-dark-border shadow-lg h-full flex flex-col justify-between">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Project Inquiry Form
                </h3>

                {feedback && (
                  <div className={`p-4 rounded-xl mb-6 flex items-start gap-3 text-sm font-medium ${
                    feedback.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900'
                      : 'bg-rose-50 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-200 dark:border-rose-900'
                  }`}>
                    {feedback.type === 'success' ? (
                      <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
                    )}
                    <span>{feedback.message}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Name */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        {...register('name')}
                        placeholder="John Doe"
                        className="w-full px-4 py-3 rounded-xl bg-white dark:bg-dark-bg border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-brand-500 transition-colors"
                      />
                      {errors.name && (
                        <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400 font-semibold">
                          {errors.name.message}
                        </p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        {...register('email')}
                        placeholder="john@company.com"
                        className="w-full px-4 py-3 rounded-xl bg-white dark:bg-dark-bg border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-brand-500 transition-colors"
                      />
                      {errors.email && (
                        <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400 font-semibold">
                          {errors.email.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Company */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
                        Company Name
                      </label>
                      <input
                        type="text"
                        {...register('company')}
                        placeholder="Acme Corp"
                        className="w-full px-4 py-3 rounded-xl bg-white dark:bg-dark-bg border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-brand-500 transition-colors"
                      />
                    </div>

                    {/* Service */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
                        Requested Service *
                      </label>
                      <select
                        {...register('service')}
                        className="w-full px-4 py-3 rounded-xl bg-white dark:bg-dark-bg border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-brand-500 transition-colors"
                      >
                        <option value="Web Development">Web Development</option>
                        <option value="UI/UX Design">UI/UX & Product Design</option>
                        <option value="AI Automation">Workflow & AI Automation</option>
                        <option value="Brand Identity">Brand Strategy & Identity</option>
                        <option value="Mobile Applications">Mobile Applications</option>
                        <option value="Cloud Architecture">Cloud & Database Architecture</option>
                      </select>
                      {errors.service && (
                        <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400 font-semibold">
                          {errors.service.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Budget */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
                      Estimated Budget Range
                    </label>
                    <select
                      {...register('budget')}
                      className="w-full px-4 py-3 rounded-xl bg-white dark:bg-dark-bg border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-brand-500 transition-colors"
                    >
                      <option value="">Select a range</option>
                      <option value="$5,000 - $10,000">$5,000 - $10,000</option>
                      <option value="$10,000 - $25,000">$10,000 - $25,000</option>
                      <option value="$25,000 - $50,000">$25,000 - $50,000</option>
                      <option value="$50,000+">$50,000+</option>
                    </select>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
                      Project Details *
                    </label>
                    <textarea
                      rows={5}
                      {...register('message')}
                      placeholder="Tell us about your project requirements, goals, and timeline..."
                      className="w-full px-4 py-3 rounded-xl bg-white dark:bg-dark-bg border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-brand-500 transition-colors"
                    />
                    {errors.message && (
                      <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400 font-semibold">
                        {errors.message.message}
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:bg-gray-400 text-white font-bold text-base shadow-lg shadow-brand-600/30 transition-all hover:scale-[1.02]"
                  >
                    {isSubmitting ? (
                      <span>Sending Message...</span>
                    ) : (
                      <>
                        <span>Submit Project Inquiry</span>
                        <Send className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Trusted Client Logos Bar */}
      <TrustedLogosBar />

      {/* Frequently Asked Questions Preview */}
      <section className="py-20 bg-gray-50/70 dark:bg-dark-surface/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-heading font-black text-gray-900 dark:text-white mb-2">
              Common Contact Questions
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Quick answers about project kickoffs, milestone contracts, and response times.
            </p>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl bg-white dark:bg-dark-surface border border-gray-200/80 dark:border-dark-border overflow-hidden shadow-sm"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-gray-900 dark:text-white hover:text-brand-600 transition-colors"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-brand-600' : ''}`} />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 text-xs leading-relaxed text-gray-600 dark:text-gray-300 border-t border-gray-100 dark:border-gray-800/60 pt-3">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

    </div>
  );
};

export default Contact;
