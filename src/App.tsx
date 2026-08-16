import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import RootLayout from './layouts/RootLayout';
import DashboardLayout from './layouts/DashboardLayout';
import { PWAInstallPrompt } from './components/common/PWAInstallPrompt';
import PageLoader from './components/common/PageLoader';
import { isPortalHostname, isLocalhost, getPortalUrl } from './utils/domainUtils';

// Public Web Pages (Lazy Loaded)
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Services = lazy(() => import('./pages/Services'));
const Portfolio = lazy(() => import('./pages/Portfolio'));
const CaseStudyDetail = lazy(() => import('./pages/CaseStudyDetail'));
const Pricing = lazy(() => import('./pages/Pricing'));
const FAQ = lazy(() => import('./pages/FAQ'));
const Blog = lazy(() => import('./pages/Blog'));
const BlogPostDetail = lazy(() => import('./pages/BlogPostDetail'));
const Contact = lazy(() => import('./pages/Contact'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const Terms = lazy(() => import('./pages/Terms'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Auth Pages (Lazy Loaded)
const Login = lazy(() => import('./pages/auth/Login'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword'));

// Dashboard Overview & Feature Pages (Lazy Loaded)
const AdminOverview = lazy(() => import('./pages/dashboard/AdminOverview'));
const ClientOverview = lazy(() => import('./pages/dashboard/ClientOverview'));
const Clients = lazy(() => import('./pages/dashboard/Clients'));
const ClientEditPage = lazy(() => import('./pages/dashboard/ClientEditPage'));
const ClientTools = lazy(() => import('./pages/dashboard/ClientTools'));
const Projects = lazy(() => import('./pages/dashboard/Projects'));
const ProjectEditPage = lazy(() => import('./pages/dashboard/ProjectEditPage'));
const ClientProjectDetailPage = lazy(() => import('./pages/dashboard/ClientProjectDetailPage'));
const NotificationsPage = lazy(() => import('./pages/dashboard/NotificationsPage'));
const AdminInvoices = lazy(() => import('./pages/dashboard/AdminInvoices'));
const ClientInvoices = lazy(() => import('./pages/dashboard/ClientInvoices'));

// Named Export Modules Lazy Loading Wrappers
const AdminAnalytics = lazy(() =>
  import('./pages/dashboard/AdminAnalytics').then((m) => ({ default: m.AdminAnalytics }))
);
const ActivityLogsPage = lazy(() =>
  import('./pages/dashboard/ActivityLogsPage').then((m) => ({ default: m.ActivityLogsPage }))
);
const AdvancedReportsPage = lazy(() =>
  import('./pages/dashboard/AdvancedReportsPage').then((m) => ({ default: m.AdvancedReportsPage }))
);
const AdminMessages = lazy(() =>
  import('./pages/dashboard/AdminMessages').then((m) => ({ default: m.AdminMessages }))
);
const ClientMessages = lazy(() =>
  import('./pages/dashboard/ClientMessages').then((m) => ({ default: m.ClientMessages }))
);
const SharedFiles = lazy(() =>
  import('./pages/dashboard/SharedFiles').then((m) => ({ default: m.SharedFiles }))
);
const AdminCMS = lazy(() =>
  import('./pages/dashboard/AdminCMS').then((m) => ({ default: m.AdminCMS }))
);
const AdminBlogEditor = lazy(() =>
  import('./pages/dashboard/AdminBlogEditor').then((m) => ({ default: m.AdminBlogEditor }))
);
const AdminPortfolioEditor = lazy(() =>
  import('./pages/dashboard/AdminPortfolioEditor').then((m) => ({ default: m.AdminPortfolioEditor }))
);
const AdminSettings = lazy(() =>
  import('./pages/dashboard/AdminSettings').then((m) => ({ default: m.AdminSettings }))
);
const ProfileSettings = lazy(() =>
  import('./pages/dashboard/ProfileSettings').then((m) => ({ default: m.ProfileSettings }))
);
const AdminEmailPage = lazy(() =>
  import('./pages/dashboard/AdminEmailPage').then((m) => ({ default: m.AdminEmailPage }))
);

function DomainRoutingGuard({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { user, role } = useAuth();
  const isPortal = isPortalHostname();

  useEffect(() => {
    // Keep standard single-origin routing on localhost for local testing
    if (isLocalhost()) return;

    const path = location.pathname;

    // 1. If currently browsing on portal subdomain (portal.gmdigitalstudio.app)
    if (isPortal) {
      // Keep portal 100% independent; redirect root and marketing URLs to portal login/dashboard
      const isMarketingPath = ['/about', '/services', '/portfolio', '/pricing', '/faq', '/blog', '/contact', '/privacy', '/terms'].some((mp) => path === mp || path.startsWith(`${mp}/`));
      if (path === '/' || isMarketingPath) {
        if (user) {
          const userRole = role || user.role;
          if (userRole === 'admin') {
            window.location.replace('/admin/dashboard');
          } else if (userRole === 'author') {
            window.location.replace('/author/cms');
          } else {
            window.location.replace('/client/dashboard');
          }
        } else {
          window.location.replace('/login');
        }
        return;
      }
    } else {
      // 2. If currently browsing on main marketing domain (gmdigitalstudio.app)
      // Direct login and operational portal spaces to portal.gmdigitalstudio.app
      const portalPaths = ['/login', '/forgot-password', '/reset-password', '/admin', '/client', '/author'];
      if (portalPaths.some((pp) => path === pp || path.startsWith(`${pp}/`))) {
        window.location.replace(getPortalUrl(path + location.search));
      }
    }
  }, [location.pathname, location.search, user, role, isPortal]);

  return <>{children}</>;
}

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <AuthProvider>
        <BrowserRouter>
          <DomainRoutingGuard>
            <Suspense fallback={<PageLoader />}>
              <Routes>
              {/* Public Website Routes */}
              <Route path="/" element={<RootLayout />}>
                <Route index element={<Home />} />
                <Route path="about" element={<About />} />
                <Route path="services" element={<Services />} />
                <Route path="portfolio" element={<Portfolio />} />
                <Route path="portfolio/:id" element={<CaseStudyDetail />} />
                <Route path="pricing" element={<Pricing />} />
                <Route path="faq" element={<FAQ />} />
                <Route path="blog" element={<Blog />} />
                <Route path="blog/:id" element={<BlogPostDetail />} />
                <Route path="contact" element={<Contact />} />
                <Route path="privacy" element={<PrivacyPolicy />} />
                <Route path="terms" element={<Terms />} />
              </Route>

              {/* Public Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* Admin Protected Dashboard Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<AdminOverview />} />
                <Route path="notifications" element={<NotificationsPage />} />
                <Route path="clients" element={<Clients />} />
                <Route path="clients/edit/:id" element={<ClientEditPage />} />
                <Route path="projects" element={<Projects />} />
                <Route path="projects/edit/:id" element={<ProjectEditPage />} />
                <Route path="invoices" element={<AdminInvoices />} />
                <Route path="emails" element={<AdminEmailPage />} />
                <Route path="analytics" element={<AdminAnalytics />} />
                <Route path="activity-logs" element={<ActivityLogsPage />} />
                <Route path="reports" element={<AdvancedReportsPage />} />
                <Route path="messages" element={<AdminMessages />} />
                <Route path="cms" element={<AdminCMS />} />
                <Route path="cms/blog/new" element={<AdminBlogEditor />} />
                <Route path="cms/blog/edit/:id" element={<AdminBlogEditor />} />
                <Route path="cms/portfolio/new" element={<AdminPortfolioEditor />} />
                <Route path="cms/portfolio/edit/:id" element={<AdminPortfolioEditor />} />
                <Route path="settings" element={<AdminSettings />} />
                <Route path="profile" element={<ProfileSettings />} />
              </Route>

              {/* Author Protected Dashboard Routes */}
              <Route
                path="/author"
                element={
                  <ProtectedRoute allowedRoles={['author']}>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/author/cms" replace />} />
                <Route path="cms" element={<AdminCMS />} />
                <Route path="cms/blog/new" element={<AdminBlogEditor />} />
                <Route path="cms/blog/edit/:id" element={<AdminBlogEditor />} />
                <Route path="cms/portfolio/new" element={<AdminPortfolioEditor />} />
                <Route path="cms/portfolio/edit/:id" element={<AdminPortfolioEditor />} />
              </Route>

              {/* Client Protected Dashboard Routes */}
              <Route
                path="/client"
                element={
                  <ProtectedRoute allowedRoles={['client']}>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/client/dashboard" replace />} />
                <Route path="dashboard" element={<ClientOverview />} />
                <Route path="notifications" element={<NotificationsPage />} />
                <Route path="tools" element={<ClientTools />} />
                <Route path="projects" element={<Projects />} />
                <Route path="projects/view/:id" element={<ClientProjectDetailPage />} />
                <Route path="invoices" element={<ClientInvoices />} />
                <Route path="files" element={<SharedFiles />} />
                <Route path="messages" element={<ClientMessages />} />
                <Route path="profile" element={<ProfileSettings />} />
                <Route path="settings" element={<ProfileSettings />} />
              </Route>

              {/* Fallback 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          <PWAInstallPrompt />
        </DomainRoutingGuard>
      </BrowserRouter>
    </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
