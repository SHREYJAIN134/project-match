'use client';

import React, { useState, useEffect, useTransition, useRef } from 'react';
import { Profile, Project, MatchScoreResult, PlaygroundWeights, ProjectPoolAnalytics, RankChangeItem } from '@/types';
import { DEFAULT_WEIGHTS, runMatchingPipeline, calculateProjectPoolAnalytics, calculateBeforeAfterRankings } from '@/lib/matching';
import { enrichResultsWithExplanations } from '@/lib/llm-explanation';
import { fetchProfiles, fetchProjects, createProfile, createProject, resetToSeedData } from '@/lib/supabase';
import { ArchitecturePlayground } from '@/components/architecture-playground';
import { CandidateCard } from '@/components/candidate-card';
import { CandidateComparisonTable } from '@/components/candidate-comparison-table';
import { CandidateComparisonModal } from '@/components/candidate-comparison-modal';
import { CandidateAnalyticsModal } from '@/components/candidate-analytics-modal';
import { PoolAnalyticsWidget } from '@/components/pool-analytics-widget';
import { RankChangeTracker } from '@/components/rank-change-tracker';
import { ProfileModal } from '@/components/profile-modal';
import { ProjectModal } from '@/components/project-modal';
import { UserPlus, FolderPlus, RotateCcw, Cpu, Sparkles, Filter, Briefcase, CheckCircle2, BarChart2, LayoutGrid, PieChart, GitCompare, PlayCircle } from 'lucide-react';
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

  // Analytics View Modes: 'cards' | 'table' | 'pool'
  const [viewMode, setViewMode] = useState<'cards' | 'table' | 'pool'>('cards');

  // Candidate Selection & Modals State
  const [selectedCandidateDetail, setSelectedCandidateDetail] = useState<MatchScoreResult | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  // Rank Change Tracking
  const [rankChanges, setRankChanges] = useState<RankChangeItem[]>([]);
  const previousMatchesRef = useRef<MatchScoreResult[]>(matchResults);

  // Modals for creation
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

    // Phase 2 Matching Pipeline with Analytics
    const computedMatches = runMatchingPipeline(profiles, selectedProject, weights, includeUnderAvailable);

    // Track Rank Shifts from previous matches
    if (previousMatchesRef.current.length > 0) {
      const changes = calculateBeforeAfterRankings(previousMatchesRef.current, computedMatches);
      setRankChanges(changes);
    }
    previousMatchesRef.current = computedMatches;

    // Enrich top 5 matches with LLM complementarity rationales
    startTransition(async () => {
      const enriched = await enrichResultsWithExplanations(computedMatches, 5);
      setMatchResults(enriched);
    });
  }, [profiles, projects, selectedProjectId, weights, includeUnderAvailable]);

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  // Pool Analytics
  const poolAnalytics: ProjectPoolAnalytics | null = selectedProject
    ? calculateProjectPoolAnalytics(profiles, selectedProject)
    : null;

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
    setSelectedForCompare([]);
    setRankChanges([]);
  };

  const handleToggleCompare = (profileId: string) => {
    if (selectedForCompare.includes(profileId)) {
      setSelectedForCompare(selectedForCompare.filter((id) => id !== profileId));
    } else {
      if (selectedForCompare.length >= 3) {
        alert('You can compare a maximum of 3 candidates at a time.');
        return;
      }
      setSelectedForCompare([...selectedForCompare, profileId]);
    }
  };

  const selectedCompareMatches = matchResults.filter((m) => selectedForCompare.includes(m.profile.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            Candidate Suitability Analytics Platform
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Event-Driven Hybrid-Intelligence Matching & Multi-Candidate Intelligence Engine
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

      {/* Active Project Specs */}
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
              Required Commitment: <strong className="text-cyan-400">{selectedProject.required_hours}h/wk</strong>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
              Critical Skills: <strong className="text-emerald-400">{selectedProject.critical_skills.join(', ')}</strong>
            </span>
          </div>
        </div>
      )}

      {/* Interactive Architecture Playground */}
      <div className="mb-6">
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

      {/* Live Rank Change Tracker */}
      <div className="mb-8">
        <RankChangeTracker rankChanges={rankChanges} />
      </div>

      {/* Analytics View Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-2xl border border-slate-800">
          <button
            onClick={() => setViewMode('cards')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              viewMode === 'cards'
                ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            Ranked Cards
          </button>

          <button
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              viewMode === 'table'
                ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            Analytical Table
          </button>

          <button
            onClick={() => setViewMode('pool')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              viewMode === 'pool'
                ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <PieChart className="w-4 h-4" />
            Product Pool Analytics
          </button>
        </div>

        {selectedForCompare.length > 0 && (
          <button
            onClick={() => setIsCompareModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/20"
          >
            <GitCompare className="w-4 h-4" />
            Compare Selected ({selectedForCompare.length})
          </button>
        )}
      </div>

      {/* Main Analytics View Content */}
      {viewMode === 'cards' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <h2 className="text-lg font-bold text-white">
                Evaluated Candidate Suitability Cards
              </h2>
              <span className="text-xs font-mono bg-cyan-950 text-cyan-300 border border-cyan-800 px-2 py-0.5 rounded-full">
                {matchResults.length} Evaluated
              </span>
            </div>
            <p className="text-xs font-mono text-slate-500">
              Click &quot;Detail&quot; on any card to view complete suitability breakdown
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {matchResults.map((result, idx) => (
              <div key={result.profile.id} className="relative group">
                <CandidateCard matchResult={result} rank={idx + 1} />
                <div className="absolute top-6 right-20">
                  <button
                    onClick={() => {
                      setSelectedCandidateDetail(result);
                      setIsDetailModalOpen(true);
                    }}
                    className="px-3 py-1 rounded-lg bg-slate-950/90 hover:bg-cyan-500 hover:text-slate-950 border border-cyan-800 text-cyan-400 text-xs font-mono font-bold transition-all shadow-md"
                  >
                    Deep Analytics &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {viewMode === 'table' && (
        <CandidateComparisonTable
          matchResults={matchResults}
          onSelectCandidateForDetail={(res) => {
            setSelectedCandidateDetail(res);
            setIsDetailModalOpen(true);
          }}
          selectedForCompare={selectedForCompare}
          onToggleCompare={handleToggleCompare}
          onOpenCompareModal={() => setIsCompareModalOpen(true)}
        />
      )}

      {viewMode === 'pool' && poolAnalytics && selectedProject && (
        <PoolAnalyticsWidget analytics={poolAnalytics} project={selectedProject} />
      )}

      {/* Modals */}
      <CandidateAnalyticsModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        matchResult={selectedCandidateDetail}
      />

      <CandidateComparisonModal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        selectedMatches={selectedCompareMatches}
      />

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
