import { createClient } from '@supabase/supabase-js';
import { Profile, Project } from '@/types';
import { INITIAL_PROFILES, INITIAL_PROJECTS } from './seed-data';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Local Memory State Cache
let localProfiles: Profile[] = [...INITIAL_PROFILES];
let localProjects: Project[] = [...INITIAL_PROJECTS];

export async function fetchProfiles(): Promise<Profile[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('profiles').select('*');
      if (!error && data && data.length > 0) {
        return data as Profile[];
      }
    } catch (e) {
      console.warn('Supabase fetch error, returning local store:', e);
    }
  }
  return localProfiles;
}

export async function fetchProjects(): Promise<Project[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('projects').select('*');
      if (!error && data && data.length > 0) {
        return data as Project[];
      }
    } catch (e) {
      console.warn('Supabase fetch error, returning local store:', e);
    }
  }
  return localProjects;
}

export async function createProfile(profileData: Omit<Profile, 'id'>): Promise<Profile> {
  const newProfile: Profile = {
    ...profileData,
    id: `prof-${Date.now()}`
  };

  if (supabase) {
    try {
      const { data, error } = await supabase.from('profiles').insert([newProfile]).select().single();
      if (!error && data) {
        return data as Profile;
      }
    } catch (e) {
      console.warn('Supabase insert error, saving locally:', e);
    }
  }

  localProfiles.unshift(newProfile);
  return newProfile;
}

export async function createProject(projectData: Omit<Project, 'id'>): Promise<Project> {
  const newProject: Project = {
    ...projectData,
    id: `proj-${Date.now()}`
  };

  if (supabase) {
    try {
      const { data, error } = await supabase.from('projects').insert([newProject]).select().single();
      if (!error && data) {
        return data as Project;
      }
    } catch (e) {
      console.warn('Supabase insert error, saving locally:', e);
    }
  }

  localProjects.unshift(newProject);
  return newProject;
}

export function resetToSeedData() {
  localProfiles = [...INITIAL_PROFILES];
  localProjects = [...INITIAL_PROJECTS];
}
