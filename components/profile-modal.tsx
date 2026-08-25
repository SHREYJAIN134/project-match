'use client';

import React, { useState } from 'react';
import { Profile } from '@/types';
import { UserPlus, X, Plus, Trash2 } from 'lucide-react';
import { z } from 'zod';

const profileSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  title: z.string().min(2, 'Title is required'),
  bio: z.string().min(5, 'Bio must be at least 5 characters'),
  skills: z.array(z.string()).min(1, 'At least 1 skill is required'),
  availability_hours: z.number().min(1, 'Hours must be at least 1').max(80, 'Max 80 hours/week'),
  experience_years: z.number().min(0, 'Experience years cannot be negative'),
});

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProfile: (profile: Omit<Profile, 'id'>) => void;
}

export function ProfileModal({ isOpen, onClose, onAddProfile }: ProfileModalProps) {
  const [fullName, setFullName] = useState('');
  const [title, setTitle] = useState('');
  const [bio, setBio] = useState('');
  const [skillsInput, setSkillsInput] = useState('');
  const [skillsList, setSkillsList] = useState<string[]>(['React', 'Next.js', 'TypeScript', 'Tailwind CSS']);
  const [availabilityHours, setAvailabilityHours] = useState(30);
  const [experienceYears, setExperienceYears] = useState(4);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const handleAddSkill = () => {
    if (skillsInput.trim() && !skillsList.includes(skillsInput.trim())) {
      setSkillsList([...skillsList, skillsInput.trim()]);
      setSkillsInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkillsList(skillsList.filter((s) => s !== skillToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const formData = {
      full_name: fullName,
      title,
      bio,
      skills: skillsList,
      availability_hours: Number(availabilityHours),
      experience_years: Number(experienceYears),
    };

    const validation = profileSchema.safeParse(formData);

    if (!validation.success) {
      const formattedErrors: Record<string, string> = {};
      validation.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          formattedErrors[issue.path[0].toString()] = issue.message;
        }
      });
      setErrors(formattedErrors);
      return;
    }

    const randomAvatars = [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    ];

    onAddProfile({
      ...formData,
      avatar_url: randomAvatars[Math.floor(Math.random() * randomAvatars.length)],
      github_url: 'https://github.com',
      linkedin_url: 'https://linkedin.com',
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative glow-box">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-cyan-950 border border-cyan-800 text-cyan-400">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Create Developer Profile</h3>
            <p className="text-xs text-slate-400">Add candidate profile with skills & commitment availability</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Alex Morgan"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-cyan-500"
            />
            {errors.full_name && <p className="text-xs text-rose-400 mt-1 font-mono">{errors.full_name}</p>}
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1">Professional Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Senior Full-Stack Engineer"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-cyan-500"
            />
            {errors.title && <p className="text-xs text-rose-400 mt-1 font-mono">{errors.title}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">Availability (Hours/Wk)</label>
              <input
                type="number"
                value={availabilityHours}
                onChange={(e) => setAvailabilityHours(Number(e.target.value))}
                min="1"
                max="80"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-cyan-500 font-mono"
              />
              {errors.availability_hours && <p className="text-xs text-rose-400 mt-1 font-mono">{errors.availability_hours}</p>}
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">Experience (Years)</label>
              <input
                type="number"
                value={experienceYears}
                onChange={(e) => setExperienceYears(Number(e.target.value))}
                min="0"
                max="30"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-cyan-500 font-mono"
              />
              {errors.experience_years && <p className="text-xs text-rose-400 mt-1 font-mono">{errors.experience_years}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1">Bio Summary</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={2}
              placeholder="Brief summary of engineering background & interests..."
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-cyan-500"
            />
            {errors.bio && <p className="text-xs text-rose-400 mt-1 font-mono">{errors.bio}</p>}
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1">Skills Array</label>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="text"
                value={skillsInput}
                onChange={(e) => setSkillsInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
                placeholder="Type skill and press Add (e.g. Python)"
                className="flex-1 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-cyan-500"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-xl text-xs font-mono font-medium border border-slate-700 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 min-h-[36px] p-2 bg-slate-950 rounded-xl border border-slate-800">
              {skillsList.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-cyan-950 border border-cyan-800/80 text-cyan-300 text-xs font-medium"
                >
                  {skill}
                  <button type="button" onClick={() => handleRemoveSkill(skill)} className="hover:text-rose-400">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            {errors.skills && <p className="text-xs text-rose-400 mt-1 font-mono">{errors.skills}</p>}
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-xs font-bold text-slate-950 shadow-lg shadow-cyan-500/20"
            >
              Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
