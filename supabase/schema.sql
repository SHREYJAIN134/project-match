-- ProjectMatch Supabase Postgres DDL Schema

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    full_name TEXT NOT NULL,
    title TEXT NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    skills TEXT[] NOT NULL DEFAULT '{}',
    availability_hours INT NOT NULL CHECK (availability_hours >= 0),
    experience_years INT NOT NULL DEFAULT 0,
    github_url TEXT,
    linkedin_url TEXT
);

-- 3. Projects Table
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    title TEXT NOT NULL,
    tagline TEXT NOT NULL,
    description TEXT NOT NULL,
    required_skills TEXT[] NOT NULL DEFAULT '{}',
    critical_skills TEXT[] NOT NULL DEFAULT '{}',
    required_hours INT NOT NULL CHECK (required_hours > 0),
    min_experience_years INT NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'matched', 'closed'))
);

-- 4. Matches Table
CREATE TABLE IF NOT EXISTS public.matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    total_score NUMERIC(5, 2) NOT NULL,
    jaccard_score NUMERIC(5, 2) NOT NULL,
    availability_score NUMERIC(5, 2) NOT NULL,
    critical_skill_bonus BOOLEAN NOT NULL DEFAULT FALSE,
    hard_gated BOOLEAN NOT NULL DEFAULT FALSE,
    llm_explanation TEXT,
    UNIQUE(project_id, profile_id)
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- Allow public read access for demo purposes
CREATE POLICY "Public profiles select" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Public projects select" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Public matches select" ON public.matches FOR SELECT USING (true);
