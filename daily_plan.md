**GM DIGITAL STUDIO v1.0**

Modern Agency Platform

_Frontend Development Internship - Project Plan & Module Tracker_

**Duration: 20 July 2026 - 15 August 2026**

Primary Focus: Frontend Development | Secondary Focus: Backend Integration (Supabase)

# **Table of Contents**

# **1\. Project Overview**

## **Project Identity**

| **Project Name**    | GM Digital Studio                                                  |
| ------------------- | ------------------------------------------------------------------ |
| **Project Type**    | Modern Digital Agency Website with Client Portal & Admin Dashboard |
| **Duration**        | 20 July 2026 - 15 August 2026 (21 working days)                    |
| **Primary Focus**   | Frontend Development                                               |
| **Secondary Focus** | Backend Integration using Backend-as-a-Service (Supabase)          |

## **Project Vision**

Develop a premium SaaS-inspired agency platform that showcases GM Digital Studio's services while providing a secure client portal and admin dashboard for project management, communication, invoices, and file sharing.

The project emphasizes modern frontend engineering practices, including reusable components, responsive design, accessibility, performance optimization, and seamless backend integration.

## **Objectives**

### **Primary (Frontend)**

- Build a professional agency website
- Develop a reusable React component architecture
- Implement fully responsive UI across all breakpoints
- Create a premium, dashboard-grade user experience
- Apply modern frontend engineering best practices

### **Secondary (Backend-supporting)**

- Integrate Supabase as the backend service
- Implement authentication and role-based access
- Store and sync project, client, and invoice data
- Enable realtime communication and live updates
- Send transactional emails via Resend

## **Target Users**

| **Visitors**      | Potential clients browsing services, portfolio, and pricing.        |
| ----------------- | ------------------------------------------------------------------- |
| **Clients**       | Track projects, download invoices, view files, and receive updates. |
| **Administrator** | Manage projects, clients, website content, and invoices.            |

# **2\. Design Philosophy**

## **Inspiration**

- Stripe
- Linear
- Vercel
- Framer
- Webflow
- Relume

## **Characteristics**

- Minimal and professional
- Premium SaaS feel
- Generous whitespace
- Clean, legible typography
- Thin borders and soft shadows
- Fully responsive
- Fast-loading and accessible

## **Explicitly Avoided**

- Glassmorphism
- Neumorphism
- AI-style gradients

# **3\. Technology Stack**

## **Frontend**

- React
- Vite
- TypeScript
- Tailwind CSS
- React Router
- Framer Motion
- React Hook Form
- Zod
- TanStack Query
- React Icons
- Recharts
- React Dropzone
- React PDF / jsPDF

## **Backend - Supabase**

- Authentication
- PostgreSQL Database
- Storage
- Realtime
- Row Level Security (RLS)

## **Email - Resend**

- Contact form submissions
- Welcome emails
- Invoice notifications
- Project update alerts
- Password reset emails

## **Deployment**

- Vercel (production hosting)
- GitHub (version control & repository)

## **Technology-to-Feature Mapping**

| **React + Vite**          | Entire frontend application                 |
| ------------------------- | ------------------------------------------- |
| **TypeScript**            | Project-wide type safety and architecture   |
| **Tailwind CSS**          | UI styling and design system                |
| **React Router**          | Navigation and protected routes             |
| **Supabase Auth**         | Login and role-based authentication         |
| **Supabase Database**     | Clients, Projects, Invoices, Messages       |
| **Supabase Storage**      | File uploads and downloads                  |
| **Supabase Realtime**     | Live project progress and notifications     |
| **Resend**                | Contact form, invoice emails, notifications |
| **Framer Motion**         | Professional UI animations                  |
| **React Hook Form + Zod** | Form handling and validation                |
| **Recharts**              | Dashboard analytics and charts              |
| **React PDF / jsPDF**     | Invoice PDF export                          |
| **PWA**                   | Installable, offline-capable application    |
| **Vercel**                | Production deployment                       |

## **Folder Structure**

src/ assets/ components/ layouts/ pages/ hooks/ services/ context/ types/ utils/ constants/ routes/ features/ dashboard/ admin/ client/

# **4\. Public Website**

## **Pages**

- Home
- About
- Services
- Portfolio
- Case Studies
- Process
- Pricing
- FAQ
- Blog
- Careers
- Contact
- Privacy Policy
- Terms
- 404

## **Homepage Sections**

- Hero
- Trusted Companies
- Services
- Portfolio
- Process
- Why Choose Us
- Testimonials
- Technology Stack
- Pricing
- FAQ
- Latest Blogs
- Call to Action
- Footer

## **Services Offered**

- Website Development
- UI/UX Design
- Graphic Design
- Brand Identity
- SEO
- Social Media Marketing
- Video Editing
- AI Automation
- Maintenance

## **Portfolio**

- Project gallery
- Case studies
- Technology used per project
- Results / outcomes
- Client reviews

# **5\. Authentication & User Roles**

## **Authentication Flows**

- Login
- Register
- Forgot Password
- Reset Password
- Email Verification
- Protected Routes
- Role-Based Authentication

## **User Roles**

### **Admin**

- Full access - manages everything across the platform

### **Client**

- Access to assigned projects
- Invoices
- Files
- Messages

# **6\. Admin Dashboard**

- Dashboard (overview)
- Clients
- Projects
- Invoices
- Payments
- Messages
- Files
- Blog CMS
- Portfolio CMS
- Testimonials
- Website Settings
- Analytics
- Notifications
- Activity Logs
- Profile
- Settings

# **7\. Client Dashboard**

- Dashboard (overview)
- Projects
- Milestones
- Timeline
- Invoices
- Payments
- Files
- Messages
- Notifications
- Support
- Profile
- Settings

# **8\. Core Features**

## **Project Management**

- Create project
- Assign client
- Project status
- Deadlines
- Progress tracking
- Deliverables

## **Client Management**

- Create client
- Edit client
- Assign projects
- Deactivate client

## **Invoice Management**

- Generate invoice
- Download as PDF
- Payment status
- Due dates
- Invoice history

## **File Management**

- Upload / download
- Folders
- Version history

## **Activity Logs**

- Login activity
- Uploads
- Project updates
- Invoices
- Messages

## **Notifications**

- Project updates
- Invoice created
- New files
- Messages
- Milestones
- Realtime alerts

# **9\. Platform Capabilities**

## **Realtime Features (Supabase Realtime)**

- Live project progress
- Live notifications
- Live messages
- Live activity updates
- Milestone completion alerts

## **Storage (Supabase Storage)**

- Invoices
- Project files
- Profile images
- Portfolio images
- Blog images

## **Forms (React Hook Form + Zod Validation)**

- Contact
- Login
- Register
- Client
- Projects
- Invoices
- Settings

## **Global Search**

- Projects
- Clients
- Invoices
- Files
- Blogs

## **Analytics Dashboard**

- Revenue
- Projects
- Clients
- Invoices
- Growth charts
- Recent activity

## **Animations (Framer Motion)**

- Page transitions
- Cards
- Modals
- Dropdowns
- Sidebar
- Toast
- Hover effects

## **UI Component Library**

- Navbar
- Footer
- Button
- Input
- Card
- Badge
- Avatar
- Modal
- Dialog
- Drawer
- Dropdown
- Tabs
- Table
- Pagination
- Breadcrumb
- Toast
- Tooltip
- Accordion
- Timeline
- Progress Bar
- Chart
- Sidebar
- Header
- Skeleton
- Empty State

# **10\. Quality Attributes**

## **Performance**

- Lazy loading
- Code splitting
- Image optimization
- Caching
- Prefetching
- SEO optimization
- Accessibility (a11y)

## **Security**

- Supabase authentication
- Protected routes
- Role permissions
- Input validation
- Secure storage
- Environment variables

## **Responsive Design**

- Desktop
- Laptop
- Tablet
- Mobile

## **Dark Mode**

- Theme switch
- System theme detection
- Saved user preference

## **Progressive Web App (PWA)**

- Installable
- Offline support
- Manifest
- Service worker

## **Documentation**

- README
- Folder structure
- Installation guide
- Configuration
- Environment variables
- Deployment guide
- Feature list
- Screenshots

# **11\. Development Phases (High-Level)**

| **Phase**   | **Theme**            | **Covers**                                                             |
| ----------- | -------------------- | ---------------------------------------------------------------------- |
| **Phase 1** | Planning             | Research, architecture, design system, project setup                   |
| **Phase 2** | Public Website       | Homepage, business pages, responsive design, animations, SEO           |
| **Phase 3** | Authentication       | Supabase auth, protected routes, user roles                            |
| **Phase 4** | Admin Dashboard      | Client management, project management, invoices, analytics, CMS        |
| **Phase 5** | Client Dashboard     | Projects, files, messages, timeline, invoices, notifications, realtime |
| **Phase 6** | Advanced Features    | Dark mode, PWA, email integration, activity logs, search, performance  |
| **Phase 7** | Testing & Deployment | Testing, bug fixes, deployment, documentation, final review            |

# **12\. Daily Module Execution Tracker**

The plan is intentionally framed around frontend deliverables. Supabase and Resend are mentioned only where they directly support a frontend feature (authentication screens, realtime UI updates, invoice emails), consistent with a Frontend Development Internship.

## **Module 1 - Foundation & Public Website**

_Timeline: 20 July - 26 July 2026_

### **Day 1 · Mon, Jul 20**

- Project planning & feature roadmap
- Research premium SaaS UI (Stripe, Linear, Vercel, Framer, Webflow)
- Initialize React + Vite + TypeScript
- Configure Tailwind CSS
- Configure ESLint, Prettier & Git
- Create project folder architecture
- Define design system (typography, colors, components)
- Create Supabase project & environment variables
- Create GitHub repository

### **Day 2 · Tue, Jul 21**

- Build global layout
- Responsive navbar
- Footer
- Theme provider (light/dark mode)
- Create reusable UI components
- Configure React Router
- Define application routes

### **Day 3 · Wed, Jul 22**

- Homepage: hero section
- Services section
- Featured projects
- Company statistics
- Testimonials preview
- CTA sections
- Responsive optimization
- Add Framer Motion animations

### **Day 4 · Thu, Jul 23**

- About page
- Services page
- Process page
- Contact page
- Contact form UI
- Integrate Resend API for contact emails
- Form validation

### **Day 5 · Fri, Jul 24**

- Portfolio page
- Case studies
- Blog listing
- FAQ page
- Pricing page
- SEO meta tags
- Performance optimization

### **Weekend · Sat-Sun, Jul 25-26**

- Responsive testing
- Lighthouse optimization
- Update README
- Weekly report
- GitHub cleanup

## **Module 2 - Authentication & Admin Dashboard**

_Timeline: 27 July - 2 August 2026_

### **Day 6 · Mon, Jul 27**

- Configure Supabase authentication
- Role-based authentication (Admin & Client)
- Protected routes
- Session management
- Dashboard layout

### **Day 7 · Tue, Jul 28**

- Client management UI
- Client CRUD
- Connect client module with Supabase database

### **Day 8 · Wed, Jul 29**

- Project management
- Project CRUD
- Project status
- Milestones
- Connect projects with Supabase

### **Day 9 · Thu, Jul 30**

- Invoice management
- Analytics dashboard
- Charts
- Search & filtering
- Export invoice as PDF

### **Day 10 · Fri, Jul 31**

- Blog CMS
- Portfolio CMS
- Website settings
- Notifications UI
- Dashboard polishing

### **Weekend · Sat-Sun, Aug 1-2**

- Testing
- Bug fixes
- Weekly report
- GitHub cleanup

## **Module 3 - Client Dashboard**

_Timeline: 3 August - 9 August 2026_

### **Day 11 · Mon, Aug 3**

- Client dashboard layout
- Overview cards
- Assigned projects
- Dashboard widgets

### **Day 12 · Tue, Aug 4**

- Project progress
- Milestones
- Timeline
- Completion percentage
- Supabase Realtime integration

### **Day 13 · Wed, Aug 5**

- File manager
- Upload & download
- Supabase Storage integration
- Activity logs

### **Day 14 · Thu, Aug 6**

- Invoice module
- Payment history
- Export PDF
- Notifications
- Resend email integration for invoices

### **Day 15 · Fri, Aug 7**

- Real-time notifications
- Messaging interface
- Dashboard testing
- UI polish
- Performance improvements

### **Weekend · Sat-Sun, Aug 8-9**

- Testing
- Bug fixes
- Weekly report
- GitHub cleanup

## **Module 4 - Final Polish & Deployment**

_Timeline: 10 August - 15 August 2026_

### **Day 16 · Mon, Aug 10**

- Dark mode
- Theme persistence
- Accessibility improvements
- Responsive fixes

### **Day 17 · Tue, Aug 11**

- Progressive Web App (PWA)
- Manifest
- Offline support
- Icons & splash screens

### **Day 18 · Wed, Aug 12**

- Bug fixing
- Performance optimization
- Code cleanup
- Lazy loading
- Image optimization

### **Day 19 · Thu, Aug 13**

- Production deployment (Vercel)
- Configure environment variables
- Final Resend testing
- Final Supabase testing
- End-to-end testing

### **Day 20 · Fri, Aug 14**

- Documentation
- README
- Folder structure documentation
- GitHub cleanup
- Final QA

### **Day 21 - Final Submission · Sat, Aug 15**

- Final deployment review
- Verify admin dashboard
- Verify client dashboard
- Verify authentication
- Verify realtime updates
- Verify email system
- Generate final internship report
- Submit GitHub repository
- Submit live demo
- Submit documentation

# **13\. Deliverables**

- ✔ Premium agency website
- ✔ Responsive design across all breakpoints
- ✔ Admin dashboard
- ✔ Client dashboard
- ✔ Authentication with role-based access
- ✔ Supabase integration
- ✔ Realtime features
- ✔ Storage integration
- ✔ Email integration (Resend)
- ✔ Invoice PDF export
- ✔ Analytics dashboard
- ✔ Progressive Web App
- ✔ Documentation
- ✔ GitHub repository
- ✔ Live production deployment

# **14\. Future Roadmap (Beyond Internship - Version 2)**

Kept as a backlog rather than in-scope, to demonstrate long-term product thinking without overloading the current internship timeline.

- Team member accounts (Designer, Developer, Project Manager)
- Kanban board for project tasks
- Meeting scheduler with calendar integration
- Client feedback and approval workflow
- Stripe payment gateway integration
- Multi-language support
- AI-powered content assistant
- CRM lead management
- Public client testimonials submission
- Advanced audit logs
- Custom report builder
- Mobile app (React Native)