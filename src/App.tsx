import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import RootLayout from './layouts/RootLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Public Web Pages
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Portfolio from './pages/Portfolio';
import CaseStudyDetail from './pages/CaseStudyDetail';
import Pricing from './pages/Pricing';
import FAQ from './pages/FAQ';
import Blog from './pages/Blog';
import BlogPostDetail from './pages/BlogPostDetail';
import Contact from './pages/Contact';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Terms from './pages/Terms';
import NotFound from './pages/NotFound';

// Auth Pages
import Login from './pages/auth/Login';
import ForgotPassword from './pages/auth/ForgotPassword';

// Dashboard Overview & Feature Pages
import AdminOverview from './pages/dashboard/AdminOverview';
import ClientOverview from './pages/dashboard/ClientOverview';
import Clients from './pages/dashboard/Clients';
import ClientEditPage from './pages/dashboard/ClientEditPage';
import ClientTools from './pages/dashboard/ClientTools';
import Projects from './pages/dashboard/Projects';
import ProjectEditPage from './pages/dashboard/ProjectEditPage';
import ClientProjectDetailPage from './pages/dashboard/ClientProjectDetailPage';
import NotificationsPage from './pages/dashboard/NotificationsPage';
import AdminInvoices from './pages/dashboard/AdminInvoices';
import ClientInvoices from './pages/dashboard/ClientInvoices';
import { AdminAnalytics } from './pages/dashboard/AdminAnalytics';
import { AdminMessages } from './pages/dashboard/AdminMessages';
import { ClientMessages } from './pages/dashboard/ClientMessages';
import { SharedFiles } from './pages/dashboard/SharedFiles';
import { AdminCMS } from './pages/dashboard/AdminCMS';
import { AdminBlogEditor } from './pages/dashboard/AdminBlogEditor';
import { AdminPortfolioEditor } from './pages/dashboard/AdminPortfolioEditor';

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <AuthProvider>
        <BrowserRouter>
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
              <Route path="analytics" element={<AdminAnalytics />} />
              <Route path="messages" element={<AdminMessages />} />
              <Route path="cms" element={<AdminCMS />} />
              <Route path="cms/blog/new" element={<AdminBlogEditor />} />
              <Route path="cms/blog/edit/:id" element={<AdminBlogEditor />} />
              <Route path="cms/portfolio/new" element={<AdminPortfolioEditor />} />
              <Route path="cms/portfolio/edit/:id" element={<AdminPortfolioEditor />} />
              <Route path="settings" element={<AdminOverview />} />
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
            </Route>

            {/* Fallback 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
