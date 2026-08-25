import { Profile, Project } from '@/types';

export const INITIAL_PROFILES: Profile[] = [
  {
    id: 'prof-1',
    full_name: 'Elena Rostova',
    title: 'Senior Full-Stack AI Engineer',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    bio: 'Specializing in Next.js 15, LLM orchestration with LangChain/Vercel AI SDK, and real-time WebSockets.',
    skills: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Python', 'FastAPI', 'Supabase', 'Postgres', 'Vector DBs'],
    availability_hours: 35,
    experience_years: 7,
    github_url: 'https://github.com',
    linkedin_url: 'https://linkedin.com'
  },
  {
    id: 'prof-2',
    full_name: 'Marcus Chen',
    title: 'Distributed Systems & Cloud Architect',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    bio: 'Passionate about high-throughput event processing, Kubernetes, and Rust microservices.',
    skills: ['Rust', 'Go', 'Docker', 'Kubernetes', 'Postgres', 'Redis', 'Kafka', 'TypeScript'],
    availability_hours: 20,
    experience_years: 9,
    github_url: 'https://github.com',
    linkedin_url: 'https://linkedin.com'
  },
  {
    id: 'prof-3',
    full_name: 'Sophia Patel',
    title: 'UI/UX Lead & Design Systems Specialist',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    bio: 'Crafting pixel-perfect responsive web apps with Tailwind CSS, Framer Motion, and Accessibility standard WCAG AAA.',
    skills: ['Figma', 'Tailwind CSS', 'React', 'TypeScript', 'Design Systems', 'UX Research', 'CSS Animation'],
    availability_hours: 40,
    experience_years: 6,
    github_url: 'https://github.com',
    linkedin_url: 'https://linkedin.com'
  },
  {
    id: 'prof-4',
    full_name: 'David Vance',
    title: 'Backend Platform Engineer',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    bio: 'PostgreSQL optimization, GraphQL APIs, and scalable auth backends built on Supabase & Node.js.',
    skills: ['Node.js', 'Express', 'Supabase', 'Postgres', 'GraphQL', 'Zod', 'TypeScript', 'Docker'],
    availability_hours: 15, // Limited availability (triggers deterministic filter on 25h+ projects)
    experience_years: 5,
    github_url: 'https://github.com',
    linkedin_url: 'https://linkedin.com'
  },
  {
    id: 'prof-5',
    full_name: 'Aisha Kwame',
    title: 'Machine Learning & NLP Specialist',
    avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    bio: 'Fine-tuning open-source LLMs, building RAG pipelines with Pinecone/PGVector, and Groq/Gemini API integrations.',
    skills: ['Python', 'PyTorch', 'FastAPI', 'Vector DBs', 'Groq', 'Gemini API', 'LangChain', 'TypeScript'],
    availability_hours: 30,
    experience_years: 4,
    github_url: 'https://github.com',
    linkedin_url: 'https://linkedin.com'
  },
  {
    id: 'prof-6',
    full_name: 'Liam Gallagher',
    title: 'Frontend React & Next.js Developer',
    avatar_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    bio: 'Building modern frontend architectures, Zustand state, Tailwind CSS, and Next.js 15 App Router.',
    skills: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Redux', 'Zod', 'HTML5', 'CSS3'],
    availability_hours: 25,
    experience_years: 3,
    github_url: 'https://github.com',
    linkedin_url: 'https://linkedin.com'
  },
  {
    id: 'prof-7',
    full_name: 'Nadia Benali',
    title: 'Full Stack & DevOps Specialist',
    avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    bio: 'Full lifecycle product delivery from Next.js dashboards to AWS Lambda infrastructure and CI/CD pipelines.',
    skills: ['Next.js', 'React', 'Node.js', 'AWS', 'Docker', 'Postgres', 'TypeScript', 'Tailwind CSS'],
    availability_hours: 30,
    experience_years: 6,
    github_url: 'https://github.com',
    linkedin_url: 'https://linkedin.com'
  },
  {
    id: 'prof-8',
    full_name: 'Tariq Al-Mansoor',
    title: 'Cybersecurity & Data Privacy Engineer',
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    bio: 'Securing multi-tenant web platforms, OAuth2/OIDC, Supabase RLS security policies, and vulnerability auditing.',
    skills: ['Cybersecurity', 'Postgres', 'Supabase', 'Python', 'Go', 'Linux', 'OAuth2', 'Zod'],
    availability_hours: 10, // Very low availability
    experience_years: 8,
    github_url: 'https://github.com',
    linkedin_url: 'https://linkedin.com'
  },
  {
    id: 'prof-9',
    full_name: 'Chloe Kim',
    title: 'Product Engineer & Growth Specialist',
    avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    bio: 'Rapid prototyping, A/B testing analytics, Next.js dynamic routing, and Shadcn UI components.',
    skills: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Analytics', 'Supabase', 'Zod'],
    availability_hours: 40,
    experience_years: 4,
    github_url: 'https://github.com',
    linkedin_url: 'https://linkedin.com'
  },
  {
    id: 'prof-10',
    full_name: 'Vikram Sharma',
    title: 'Data Engineer & Analytics Architect',
    avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    bio: 'SQL query optimization, data warehouse architectures, and real-time streaming analytics.',
    skills: ['Python', 'Postgres', 'SQL', 'Spark', 'Docker', 'FastAPI', 'Kafka'],
    availability_hours: 25,
    experience_years: 7,
    github_url: 'https://github.com',
    linkedin_url: 'https://linkedin.com'
  }
];

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    title: 'ProjectMatch Hybrid-Intelligence Core',
    tagline: 'Event-driven candidate matching engine with LLM rationales and interactive playground',
    description: 'We are building an autonomous team matching web app leveraging Next.js 15, Supabase, Tailwind CSS, and Groq/Gemini LLM inference. Requires deep full-stack TypeScript expertise and mathematical matching algorithms.',
    required_skills: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Supabase', 'Postgres', 'Zod'],
    critical_skills: ['Next.js', 'TypeScript', 'Supabase'],
    required_hours: 25,
    min_experience_years: 3,
    status: 'open'
  },
  {
    id: 'proj-2',
    title: 'Autonomous Multi-Agent AI Orchestrator',
    tagline: 'High-throughput event streaming platform for autonomous LLM agents',
    description: 'Real-time multi-agent execution pipeline built with Python, Rust, Kafka, Vector DBs, and FastAPI backends.',
    required_skills: ['Python', 'Rust', 'FastAPI', 'Vector DBs', 'Kafka', 'Groq', 'Gemini API', 'Docker'],
    critical_skills: ['Python', 'Vector DBs', 'FastAPI'],
    required_hours: 30,
    min_experience_years: 4,
    status: 'open'
  },
  {
    id: 'proj-3',
    title: 'Enterprise Fintech Design System & Web App',
    tagline: 'Accessible, ultra-fast financial dashboard and component design system',
    description: 'Modernizing a high-scale financial platform with Tailwind CSS, custom design tokens, WCAG AAA compliance, and state management.',
    required_skills: ['Figma', 'Tailwind CSS', 'React', 'TypeScript', 'Design Systems', 'UX Research', 'CSS Animation'],
    critical_skills: ['Tailwind CSS', 'React', 'Design Systems'],
    required_hours: 35,
    min_experience_years: 5,
    status: 'open'
  }
];
