'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { Profile, Project, MatchScoreResult, PlaygroundWeights } from '@/types';
import { DEFAULT_WEIGHTS, runMatchingPipeline } from '@/lib/matching';
import { enrichResultsWithExplanations } from '@/lib/llm-explanation';
import { fetchProfiles, fetchProjects, createProfile, createProject, resetToSeedData } from '@/lib/supabase';
import { ArchitecturePlayground } from '@/components/architecture-playground';
import { CandidateCard } from '@/components/candidate-card';
import { ProfileModal } from '@/components/profile-modal';
import { ProjectModal } from '@/components/project-modal';
import { UserPlus, FolderPlus, RotateCcw, Cpu, Sparkles, Filter, Briefcase, CheckCircle2 } from 'lucide-react';

import { INITIAL_PROFILES, INITIAL_PROJECTS } from '@/lib/seed-data';

export default function DashboardPage() {
  const [profiles, setProfiles] = useState<Profile[]>(INITIAL_PROFILES);
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(INITIAL_PROJECTS[0]?.id || '');
  const [weights, setWeights] = useState<PlaygroundWeights>(DEFAULT_WEIGHTS);
  const [includeUnderAvailable, setIncludeUnderAvailable] = useState<boolean>(false);
  const [matchResults, setMatchResults] = useState<MatchScoreResult[]>(() => 
    INITIAL_PROJECTS[0] ? runMatchingPipeline(INITIAL_PROFILES, INITIAL_PROJECTS[0], DEFAULT_WEIGHTS, false) : []
  );

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Load Initial Data
  useEffect(() => {
    async function loadData() {
      const pList = await fetchProfiles();
      const prjList = await fetchProjects();
      setProfiles(pList);
      setProjects(prjList);
      if (prjList.length > 0) {
        setSelectedProjectId(prjList[0].id);
      }
    }
    loadData();
  }, []);

  // Compute matches whenever profiles, selected project, or weights change
  useEffect(() => {
    const selectedProject = projects.find((p) => p.id === selectedProjectId);
    if (!selectedProject || profiles.length === 0) return;

    // Phase 2 Matching Pipeline
    const computedMatches = runMatchingPipeline(profiles, selectedProject, weights, includeUnderAvailable);

    // Enrich top 5 matches with LLM complementarity rationales
    startTransition(async () => {
      const enriched = await enrichResultsWithExplanations(computedMatches, 5);
      setMatchResults(enriched);
    });
  }, [profiles, projects, selectedProjectId, weights, includeUnderAvailable]);

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  const handleAddProfile = async (newProf: Omit<Profile, 'id'>) => {
    const saved = await createProfile(newProf);
    setProfiles((prev) => [saved, ...prev]);
  };

  const handleAddProject = async (newPrj: Omit<Project, 'id'>) => {
    const saved = await createProject(newPrj);
    setProjects((prev) => [saved, ...prev]);
    setSelectedProjectId(saved.id);
  };

  const handleReset = () => {
    resetToSeedData();
    fetchProfiles().then(setProfiles);
    fetchProjects().then((prjList) => {
      setProjects(prjList);
      if (prjList.length > 0) setSelectedProjectId(prjList[0].id);
    });
    setWeights(DEFAULT_WEIGHTS);
    setIncludeUnderAvailable(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            Matching Dashboard & Architecture Playground
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Real-time candidate score synthesis & dynamic weight control engine
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsProfileModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-cyan-950 hover:bg-cyan-900 border border-cyan-800 text-cyan-300 text-xs font-semibold transition-all"
          >
            <UserPlus className="w-4 h-4" />
            + Profile
          </button>

          <button
            onClick={() => setIsProjectModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-950 hover:bg-indigo-900 border border-indigo-800 text-indigo-300 text-xs font-semibold transition-all"
          >
            <FolderPlus className="w-4 h-4" />
            + Project
          </button>

          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 text-xs font-mono transition-all"
            title="Reset dataset to default 10 profiles & 3 project briefs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Data
          </button>
        </div>
      </div>

      {/* Project Selector Header Cards */}
      <div className="mb-8">
        <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">
          Select Active Project Brief
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {projects.map((prj) => {
            const isSelected = prj.id === selectedProjectId;
            return (
              <button
                key={prj.id}
                onClick={() => setSelectedProjectId(prj.id)}
                className={`text-left p-4 rounded-2xl border transition-all ${
                  isSelected
                    ? 'bg-slate-900 border-cyan-500 shadow-lg shadow-cyan-500/10'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-xs font-mono font-bold ${isSelected ? 'text-cyan-400' : 'text-slate-400'}`}>
                    {prj.title}
                  </span>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
                </div>
                <p className="text-xs text-slate-300 line-clamp-1 mb-2">{prj.tagline}</p>
                <div className="flex items-center gap-3 text-[11px] font-mono text-slate-500">
                  <span>Req: {prj.required_hours}h/wk</span>
                  <span>•</span>
                  <span>Skills: {prj.required_skills.length}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Project Specs Header */}
      {selectedProject && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">{selectedProject.title}</h3>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">{selectedProject.description}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
            <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
              Commitment: <strong className="text-cyan-400">{selectedProject.required_hours}h/wk</strong>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
              Critical Skills: <strong className="text-emerald-400">{selectedProject.critical_skills.join(', ')}</strong>
            </span>
          </div>
        </div>
      )}

      {/* Interactive Architecture Playground */}
      <div className="mb-10">
        <ArchitecturePlayground
          weights={weights}
          includeUnderAvailable={includeUnderAvailable}
          onWeightsChange={(newW, inc) => {
            setWeights(newW);
            setIncludeUnderAvailable(inc);
          }}
          onResetWeights={() => setWeights(DEFAULT_WEIGHTS)}
          candidateCount={profiles.length}
          filteredCount={matchResults.length}
        />
      </div>

      {/* Candidate Results Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <h2 className="text-lg font-bold text-white">
              Ranked Candidate Results
            </h2>
            <span className="text-xs font-mono bg-cyan-950 text-cyan-300 border border-cyan-800 px-2 py-0.5 rounded-full">
              {matchResults.length} Qualified Candidates
            </span>
          </div>

          <p className="text-xs font-mono text-slate-500">
            Sorted strictly by mathematical totalScore desc
          </p>
        </div>

        {matchResults.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/40 border border-slate-800 rounded-2xl">
            <Filter className="w-8 h-8 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-300">No candidates match current gate criteria</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              Try reducing the Minimum Score Gate slider or checking &quot;Show under-available candidates&quot;.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {matchResults.map((result, idx) => (
              <CandidateCard key={result.profile.id} matchResult={result} rank={idx + 1} />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onAddProfile={handleAddProfile}
      />
      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onAddProject={handleAddProject}
      />
    </div>
  );
}
