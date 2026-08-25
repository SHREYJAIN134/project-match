'use client';

import React, { useState } from 'react';
import { Project } from '@/types';
import { FolderPlus, X, Plus, Trash2 } from 'lucide-react';
import { z } from 'zod';

const projectSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  tagline: z.string().min(5, 'Tagline is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  required_skills: z.array(z.string()).min(1, 'At least 1 required skill is required'),
  critical_skills: z.array(z.string()),
  required_hours: z.number().min(1, 'Required commitment hours must be at least 1').max(80),
  min_experience_years: z.number().min(0),
});

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProject: (project: Omit<Project, 'id'>) => void;
}

export function ProjectModal({ isOpen, onClose, onAddProject }: ProjectModalProps) {
  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [reqSkillInput, setReqSkillInput] = useState('');
  const [reqSkillsList, setReqSkillsList] = useState<string[]>(['React', 'Next.js', 'TypeScript']);
  const [critSkillInput, setCritSkillInput] = useState('');
  const [critSkillsList, setCritSkillsList] = useState<string[]>(['Next.js']);
  const [requiredHours, setRequiredHours] = useState(25);
  const [minExperienceYears, setMinExperienceYears] = useState(3);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const handleAddReqSkill = () => {
    if (reqSkillInput.trim() && !reqSkillsList.includes(reqSkillInput.trim())) {
      setReqSkillsList([...reqSkillsList, reqSkillInput.trim()]);
      setReqSkillInput('');
    }
  };

  const handleAddCritSkill = () => {
    if (critSkillInput.trim() && !critSkillsList.includes(critSkillInput.trim())) {
      setCritSkillsList([...critSkillsList, critSkillInput.trim()]);
      setCritSkillInput('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const formData = {
      title,
      tagline,
      description,
      required_skills: reqSkillsList,
      critical_skills: critSkillsList,
      required_hours: Number(requiredHours),
      min_experience_years: Number(minExperienceYears),
      status: 'open' as const,
    };

    const validation = projectSchema.safeParse(formData);

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

    onAddProject(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative glow-box">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-indigo-950 border border-indigo-800 text-indigo-400">
            <FolderPlus className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Create Project Brief</h3>
            <p className="text-xs text-slate-400">Specify project stack, critical skills, and hour commitment</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1">Project Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Next.js Autonomous Agent Pipeline"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
            {errors.title && <p className="text-xs text-rose-400 mt-1 font-mono">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1">Tagline</label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="e.g. Real-time candidate matching dashboard"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
            {errors.tagline && <p className="text-xs text-rose-400 mt-1 font-mono">{errors.tagline}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">Required Commitment (H/Wk)</label>
              <input
                type="number"
                value={requiredHours}
                onChange={(e) => setRequiredHours(Number(e.target.value))}
                min="1"
                max="80"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
              {errors.required_hours && <p className="text-xs text-rose-400 mt-1 font-mono">{errors.required_hours}</p>}
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">Min Experience (Years)</label>
              <input
                type="number"
                value={minExperienceYears}
                onChange={(e) => setMinExperienceYears(Number(e.target.value))}
                min="0"
                max="20"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1">Project Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Detailed description of technical requirements and goals..."
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
            {errors.description && <p className="text-xs text-rose-400 mt-1 font-mono">{errors.description}</p>}
          </div>

          {/* Required Skills */}
          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1">Required Skills (Jaccard denominator)</label>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="text"
                value={reqSkillInput}
                onChange={(e) => setReqSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddReqSkill();
                  }
                }}
                placeholder="Add skill (e.g. Supabase)"
                className="flex-1 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={handleAddReqSkill}
                className="px-3 py-1.5 bg-slate-800 text-indigo-400 rounded-xl text-xs font-mono font-medium border border-slate-700 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 p-2 bg-slate-950 rounded-xl border border-slate-800">
              {reqSkillsList.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-indigo-950 border border-indigo-800/80 text-indigo-300 text-xs font-medium"
                >
                  {skill}
                  <button type="button" onClick={() => setReqSkillsList(reqSkillsList.filter(s => s !== skill))}>
                    <Trash2 className="w-3 h-3 hover:text-rose-400" />
                  </button>
                </span>
              ))}
            </div>
            {errors.required_skills && <p className="text-xs text-rose-400 mt-1 font-mono">{errors.required_skills}</p>}
          </div>

          {/* Critical Skills */}
          <div>
            <label className="block text-xs font-mono text-emerald-400 mb-1">Critical Skills (+15% Bonus Match)</label>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="text"
                value={critSkillInput}
                onChange={(e) => setCritSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCritSkill();
                  }
                }}
                placeholder="Add critical skill (e.g. Next.js)"
                className="flex-1 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={handleAddCritSkill}
                className="px-3 py-1.5 bg-slate-800 text-emerald-400 rounded-xl text-xs font-mono font-medium border border-slate-700 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 p-2 bg-slate-950 rounded-xl border border-slate-800">
              {critSkillsList.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-emerald-950 border border-emerald-800/80 text-emerald-300 text-xs font-medium"
                >
                  {skill}
                  <button type="button" onClick={() => setCritSkillsList(critSkillsList.filter(s => s !== skill))}>
                    <Trash2 className="w-3 h-3 hover:text-rose-400" />
                  </button>
                </span>
              ))}
            </div>
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
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-xs font-bold text-slate-950 shadow-lg shadow-indigo-500/20"
            >
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
