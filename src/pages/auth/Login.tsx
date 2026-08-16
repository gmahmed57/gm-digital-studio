import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { settingsService, type WebsiteSettings } from '../../services/settingsService';
import type { UserProfile, UserRole } from '../../types/auth';
import { Lock, Mail, Eye, EyeOff, ArrowRight, ShieldCheck, ArrowLeft, KeyRound } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SEO from '../../components/common/SEO';
import logo from '../../assets/icon-logo.png';

// Clean portal feature slides
const SLIDES = [
  {
    id: 1,
    heading: 'Interactive Project Milestones & Progress.',
    subtext: 'Track real-time project phases, review sprint deliverables, approve milestones, and leave revision notes directly to our team.',
  },
  {
    id: 2,
    heading: 'Transparent Invoices & Instant Billing.',
    subtext: 'View itemized invoice breakdowns, upload payment proof receipts, track payment status, and download official PDF statements.',
  },
  {
    id: 3,
    heading: 'Secure Shared Folders & Asset Storage.',
    subtext: 'Access dedicated project files, brand guidelines, design assets, and shared deliverables in your encrypted workspace folder.',
  },
  {
    id: 4,
    heading: 'Studio Tools Catalog & Custom Add-ons.',
    subtext: 'Explore agency digital tools, request premium add-ons, and streamline your business operations with one-click access.',
  },
];

export function Login() {
  const navigate = useNavigate();
  const { login, verifyMFA } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Two-Step Verification (MFA) state
  const [isMfaRequired, setIsMfaRequired] = useState(false);
  const [mfaFactorId, setMfaFactorId] = useState('');
  const [tempUser, setTempUser] = useState<UserProfile | null>(null);
  const [mfaCode, setMfaCode] = useState('');

  // Active slide index for text rotation
  const [activeSlide, setActiveSlide] = useState(0);
  const [settings, setSettings] = useState<WebsiteSettings | null>(null);

  useEffect(() => {
    settingsService.getSettings().then((s) => setSettings(s));
  }, []);

  // Auto-rotate text slides
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleRoleRedirect = (role?: UserRole) => {
    if (role === 'admin') {
      navigate('/admin/dashboard');
    } else if (role === 'author') {
      navigate('/author/cms');
    } else {
      navigate('/client/dashboard');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter your email address and password.');
      return;
    }

    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const result = await login(email, password);

      if (result.mfaRequired && result.factorId && result.tempUser) {
        setIsMfaRequired(true);
        setMfaFactorId(result.factorId);
        setTempUser(result.tempUser);
        setErrorMsg('');
        return;
      }

      handleRoleRedirect(result.user?.role);
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid login credentials. Please check your email and password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyMFA = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = mfaCode.trim().replace(/\s+/g, '');
    if (cleanCode.length !== 6) {
      setErrorMsg('Please enter the 6-digit code from Google Authenticator.');
      return;
    }

    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const verifiedUser = await verifyMFA(mfaFactorId, cleanCode, tempUser!);
      handleRoleRedirect(verifiedUser.role);
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid verification code. Please check Google Authenticator and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelMFA = () => {
    setIsMfaRequired(false);
    setMfaFactorId('');
    setTempUser(null);
    setMfaCode('');
    setErrorMsg('');
  };

  const currentSlide = SLIDES[activeSlide];

  return (
    <>
      <SEO 
        title="Client Portal Login - GM Digital Studio"
        description="Access your GM Digital Studio client portal to track project progress, view deliverables, and download invoices."
      />

      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-white p-4 sm:p-6 md:p-10 font-sans">
        
        {/* Outer Container Card Matching Reference Layout */}
        <div className="w-full max-w-5xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-3xl p-3 md:p-4 shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-[580px]">
          
          {/* Left Panel: Visual Panel with Brand Dark Orange Gradient & Fixed-Height Content */}
          <div className="lg:col-span-6 rounded-2xl bg-gradient-to-b from-[#220e06] via-[#140804] to-[#0a0402] text-white p-6 md:p-10 flex flex-col justify-between relative overflow-hidden border border-amber-900/30 min-h-[420px] lg:min-h-[540px]">
            
            {/* Grid pattern overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:2rem_2rem] pointer-events-none" />

            {/* Top Bar: Official Logo Image & Studio Name */}
            <div className="relative z-10 flex items-center justify-between">
              <Link to="/" className="flex items-center gap-2.5 group">
                <img src={logo} alt="GM Digital Studio Logo" className="h-8 w-auto object-contain" />
                <span className="font-heading font-bold text-lg tracking-tight text-white">
                  GM Digital <span className="text-brand-500">Studio</span>
                </span>
              </Link>
            </div>

            {/* Vertically Centered Text Content & Slideshow with Fixed Height Container */}
            <div className="relative z-10 my-auto py-6 flex flex-col justify-between">
              <div className="min-h-[160px] flex flex-col justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSlide.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-3"
                  >
                    <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-white leading-tight">
                      {currentSlide.heading}
                    </h2>
                    <p className="text-gray-300 text-xs sm:text-sm leading-relaxed max-w-md">
                      {currentSlide.subtext}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Fixed Position Horizontal Indicators */}
              <div className="flex items-center gap-2 pt-6">
                {SLIDES.map((slide, idx) => (
                  <button
                    key={slide.id}
                    onClick={() => setActiveSlide(idx)}
                    className={`h-1.5 rounded-full transition-all duration-500 cursor-pointer ${
                      activeSlide === idx ? 'w-10 bg-brand-500' : 'w-4 bg-white/30 hover:bg-white/50'
                    }`}
                    title={`Slide ${idx + 1}`}
                  />
                ))}
              </div>
            </div>

          </div>

          {/* Right Panel: Perfectly Balanced Portal Login Form */}
          <div className="lg:col-span-6 p-6 sm:p-8 md:p-10 flex flex-col justify-center space-y-6">
            <div>
              {isMfaRequired ? (
                /* Two-Step Verification View */
                <div className="space-y-6 animate-fade-in text-center sm:text-left">
                  <div className="text-center">
                    <div className="mx-auto w-14 h-14 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20 flex items-center justify-center mb-3.5 shadow-xs">
                      <ShieldCheck className="w-7 h-7" />
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-heading font-bold text-gray-900 dark:text-white mb-1.5 tracking-tight">
                      Two-Step Verification
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm leading-relaxed max-w-sm mx-auto">
                      Enter the 6-digit verification code generated by your Google Authenticator or TOTP app.
                    </p>
                  </div>

                  {errorMsg && (
                    <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800/60 text-red-600 dark:text-red-400 text-xs font-medium text-center">
                      {errorMsg}
                    </div>
                  )}

                  <form onSubmit={handleVerifyMFA} className="space-y-5">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider text-center">
                        6-Digit Security Code
                      </label>
                      <div className="relative max-w-xs mx-auto">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                          <KeyRound className="w-4 h-4 text-brand-500" />
                        </div>
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={6}
                          autoFocus
                          required
                          value={mfaCode}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
                            setMfaCode(val);
                          }}
                          placeholder="000000"
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-surface text-gray-900 dark:text-white placeholder-gray-400 text-center tracking-[0.5em] text-xl font-mono font-bold focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-brand-600 transition-all shadow-xs"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting || mfaCode.length !== 6}
                      className="w-full py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          Verify & Access Workspace <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>

                    <div className="text-center pt-1">
                      <button
                        type="button"
                        onClick={handleCancelMFA}
                        className="text-xs text-gray-500 hover:text-brand-600 dark:hover:text-brand-400 inline-flex items-center gap-1.5 font-medium transition-colors cursor-pointer"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" /> Back to email & password
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                /* Standard Login View */
                <div>
                  <div className="mb-6">
                    <h1 className="text-2xl sm:text-3xl font-heading font-bold text-gray-900 dark:text-white mb-1.5">
                      Sign In to Portal
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
                      Enter your credentials to access your GM Digital Studio portal workspace.
                    </p>
                  </div>

                  {errorMsg && (
                    <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800/60 text-red-600 dark:text-red-400 text-xs font-medium">
                      {errorMsg}
                    </div>
                  )}

                  {/* Login Form */}
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                        Email Address
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                          <Mail className="w-4 h-4" />
                        </div>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="your.email@company.com"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-surface text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-600 text-sm transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                          Password
                        </label>
                        <Link
                          to="/forgot-password"
                          className="text-xs text-brand-600 dark:text-brand-400 hover:underline font-medium"
                        >
                          Forgot password?
                        </Link>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                          <Lock className="w-4 h-4" />
                        </div>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-surface text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-600 text-sm transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-white cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <label className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 cursor-pointer">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="rounded border-gray-300 text-brand-600 focus:ring-brand-600"
                        />
                        Remember me for 30 days
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          Sign In to Workspace <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Tightly Integrated Footer Support Link */}
            <div className="pt-3 border-t border-gray-100 dark:border-dark-border text-center text-xs text-gray-500 dark:text-gray-400">
              Need assistance? Contact support at{' '}
              <a href={`mailto:${settings?.contactEmail || 'support@gmdigitalstudio.app'}`} className="text-brand-600 dark:text-brand-400 font-semibold hover:underline">
                {settings?.contactEmail || 'support@gmdigitalstudio.app'}
              </a>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

export default Login;
