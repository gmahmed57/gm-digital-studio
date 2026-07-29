# GM Digital Studio - Master Supabase Database Schema

This document maintains the canonical PostgreSQL database schema definitions and migration scripts for Supabase.

---

## 1. Clients Table (`public.clients`)

```sql
CREATE TABLE IF NOT EXISTS public.clients (
  id TEXT PRIMARY KEY,
  fullName TEXT NOT NULL,
  company TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  portalPassword TEXT,
  avatarUrl TEXT,
  status TEXT DEFAULT 'active',
  joinedDate TEXT,
  activeProjectsCount INT DEFAULT 0,
  totalBilled TEXT DEFAULT '$0',
  assignedPackage TEXT,
  allowedToolIds TEXT[] DEFAULT '{}',
  requestedToolIds TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Safe Migration ALTER TABLE statements for existing clients table
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS "fullName" TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS "portalPassword" TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS "allowedToolIds" TEXT[] DEFAULT '{}';
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS "requestedToolIds" TEXT[] DEFAULT '{}';

-- Row Level Security (RLS)
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read clients" ON public.clients;
CREATE POLICY "Allow public read clients" ON public.clients FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public write clients" ON public.clients;
CREATE POLICY "Allow public write clients" ON public.clients FOR ALL USING (true);
```

---

## 2. Projects Table (`public.projects`)

```sql
DROP TABLE IF EXISTS public.projects CASCADE;

CREATE TABLE public.projects (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'Enterprise Web Development',
  client_id TEXT,
  client_name TEXT,
  client_company TEXT,
  client_email TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  progress INTEGER DEFAULT 0,
  budget TEXT,
  spent TEXT DEFAULT '$0',
  start_date TEXT,
  due_date TEXT,
  milestones JSONB DEFAULT '[]'::jsonb,
  deliverables JSONB DEFAULT '[]'::jsonb,
  tech_stack JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Row Level Security (RLS)
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read projects" ON public.projects;
CREATE POLICY "Allow public read projects" ON public.projects FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public write projects" ON public.projects;
CREATE POLICY "Allow public write projects" ON public.projects FOR ALL USING (true);
```

---

## 3. Invoices Table (`public.invoices`)

```sql
CREATE TABLE IF NOT EXISTS public.invoices (
  id TEXT PRIMARY KEY,
  client_id TEXT,
  client_name TEXT,
  client_company TEXT,
  client_email TEXT,
  description TEXT NOT NULL,
  amount TEXT NOT NULL,
  status TEXT DEFAULT 'Pending',
  date TEXT NOT NULL,
  due_date TEXT,
  pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS)
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read invoices" ON public.invoices;
CREATE POLICY "Allow public read invoices" ON public.invoices FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public write invoices" ON public.invoices;
CREATE POLICY "Allow public write invoices" ON public.invoices FOR ALL USING (true);
```

---

## 4. Notifications Table (`public.notifications`) *(Realtime Role-Based Persistence)*

```sql
CREATE TABLE IF NOT EXISTS public.notifications (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  timestamp TEXT DEFAULT 'Just now',
  read BOOLEAN DEFAULT false,
  type TEXT DEFAULT 'system',
  link TEXT,
  target_role TEXT,
  target_email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Safe Migration ALTER TABLE statements for existing notifications table
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS target_role TEXT;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS target_email TEXT;

-- Row Level Security (RLS)
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read notifications" ON public.notifications;
CREATE POLICY "Allow public read notifications" ON public.notifications FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public write notifications" ON public.notifications;
CREATE POLICY "Allow public write notifications" ON public.notifications FOR ALL USING (true);
```
