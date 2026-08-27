'use client';

import React, { useState, useEffect, useTransition, useRef } from 'react';
import {
  Profile,
  Project,
  MatchScoreResult,
  PlaygroundWeights,
  ProjectPoolAnalytics,
  RankChangeItem,
  ProjectTask,
  ProjectActivityItem,
} from '@/types';
import { DEFAULT_WEIGHTS, runMatchingPipeline, calculateProjectPoolAnalytics, calculateBeforeAfterRankings } from '@/lib/matching';
import { enrichResultsWithExplanations } from '@/lib/llm-explanation';
import { fetchProfiles, fetchProjects, createProfile, createProject, resetToSeedData } from '@/lib/supabase';
import { calculateProjectHealth, calculateTeamWorkload, INITIAL_PROJECT_TASKS, INITIAL_PROJECT_ACTIVITIES } from '@/lib/project-intelligence';
import { ArchitecturePlayground } from '@/components/architecture-playground';
import { CandidateCard } from '@/components/candidate-card';
import { CandidateComparisonTable } from '@/components/candidate-comparison-table';
import { CandidateComparisonModal } from '@/components/candidate-comparison-modal';
import { CandidateAnalyticsModal } from '@/components/candidate-analytics-modal';
import { PoolAnalyticsWidget } from '@/components/pool-analytics-widget';
import { RankChangeTracker } from '@/components/rank-change-tracker';
import { AICandidateAdvisor } from '@/components/ai-candidate-advisor';
import { ArchitectureModal } from '@/components/architecture-modal';
import { ProjectLeadDashboard } from '@/components/project-lead-dashboard';
import { GanttTimelineView } from '@/components/gantt-timeline-view';
import { TeamWorkloadWidget } from '@/components/team-workload-widget';
import { EmployeeMyTasks } from '@/components/employee-my-tasks';
import { ProfileModal } from '@/components/profile-modal';
import { ProjectModal } from '@/components/project-modal';
import {
  UserPlus,
  FolderPlus,
  RotateCcw,
  Cpu,
  Sparkles,
  Filter,
  Briefcase,
  CheckCircle2,
  BarChart2,
  LayoutGrid,
  PieChart,
  GitCompare,
  Bot,
  Info,
  Layers,
  Calendar,
  Users,
  UserCheck,
  Activity,
} from 'lucide-react';
import { INITIAL_PROFILES, INITIAL_PROJECTS } from '@/lib/seed-data';

export default function DashboardPage() {
  const [profiles, setProfiles] = useState<Profile[]>(INITIAL_PROFILES);
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(INITIAL_PROJECTS[0]?.id || '');
  const [weights, setWeights] = useState<PlaygroundWeights>(DEFAULT_WEIGHTS);
  const [includeUnderAvailable, setIncludeUnderAvailable] = useState<boolean>(false);

  // Main Dashboard Tab: 'matching' | 'lead' | 'gantt' | 'workload' | 'employee'
  const [mainTab, setMainTab] = useState<'matching' | 'lead' | 'gantt' | 'workload' | 'employee'>('matching');

  // Candidate Matching Analytics View Mode: 'cards' | 'table' | 'pool'
  const [viewMode, setViewMode] = useState<'cards' | 'table' | 'pool'>('cards');

  // Project Intelligence Tasks & Activities State
  const [projectTasks, setProjectTasks] = useState<ProjectTask[]>(INITIAL_PROJECT_TASKS);
  const [activities, setActivities] = useState<ProjectActivityItem[]>(INITIAL_PROJECT_ACTIVITIES);

  // Matches state
  const [matchResults, setMatchResults] = useState<MatchScoreResult[]>(() =>
    INITIAL_PROJECTS[0] ? runMatchingPipeline(INITIAL_PROFILES, INITIAL_PROJECTS[0], DEFAULT_WEIGHTS, false) : []
  );

  // Candidate Selection & Modals State
  const [selectedCandidateDetail, setSelectedCandidateDetail] = useState<MatchScoreResult | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  // AI Advisor Drawer & Architecture Specs Modal
  const [isAIAdvisorOpen, setIsAIAdvisorOpen] = useState(false);
  const [isArchitectureModalOpen, setIsArchitectureModalOpen] = useState(false);

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

    const computedMatches = runMatchingPipeline(profiles, selectedProject, weights, includeUnderAvailable);

    if (previousMatchesRef.current.length > 0) {
      const changes = calculateBeforeAfterRankings(previousMatchesRef.current, computedMatches);
      setRankChanges(changes);
    }
    previousMatchesRef.current = computedMatches;

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

  // Project Health & Team Workload calculations
  const projectHealth = selectedProject
    ? calculateProjectHealth(projectTasks, selectedProject)
    : calculateProjectHealth([], INITIAL_PROJECTS[0]);

  const teamWorkloads = calculateTeamWorkload(projectTasks, profiles);

  // Task Handlers
  const handleAddTask = (newTaskData: Omit<ProjectTask, 'id' | 'lastUpdated'>) => {
    const newTask: ProjectTask = {
      ...newTaskData,
      id: `task-${Date.now()}`,
      lastUpdated: new Date().toISOString().slice(0, 16).replace('T', ' '),
    };
    setProjectTasks((prev) => [newTask, ...prev]);

    // Log Activity
    setActivities((prev) => [
      {
        id: `act-${Date.now()}`,
        timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
        actorName: 'Project Lead',
        actorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        actionType: 'Created Task',
        taskTitle: newTask.title,
        description: `Created and assigned task to ${newTask.assignedToName}.`,
      },
      ...prev,
    ]);
  };

  const handleUpdateTaskStatus = (
    taskId: string,
    newStatus: ProjectTask['status'],
    newCompletionPct: number,
    blockerComment?: string
  ) => {
    setProjectTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            status: newStatus,
            completionPct: newCompletionPct,
            blockerComment: blockerComment !== undefined ? blockerComment : t.blockerComment,
            lastUpdated: new Date().toISOString().slice(0, 16).replace('T', ' '),
          };
        }
        return t;
      })
    );
  };

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
    setProjectTasks(INITIAL_PROJECT_TASKS);
    setActivities(INITIAL_PROJECT_ACTIVITIES);
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
      {/* Dashboard Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            ProjectMatch Control Center & Intelligence
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Hybrid-Intelligence Team Matching, Project Lead Control Center & Progress Intelligence
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsAIAdvisorOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-600 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-purple-500/20 transition-all hover:scale-105"
          >
            <Bot className="w-4 h-4 text-slate-950" />
            Ask AI Advisor
          </button>

          <button
            onClick={() => setIsArchitectureModalOpen(true)}
            className="w-9 h-9 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-indigo-400 hover:text-white flex items-center justify-center transition-all hover:scale-110"
            title="View Architecture Specifications (ⓘ)"
          >
            <Info className="w-4.5 h-4.5" />
          </button>

          <div className="h-4 w-[1px] bg-slate-800" />

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
            title="Reset dataset to default seed state"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Data
          </button>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-slate-900 p-1.5 rounded-2xl border border-slate-800 mb-8 font-mono text-xs">
        <button
          onClick={() => setMainTab('matching')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all ${
            mainTab === 'matching'
              ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Cpu className="w-4 h-4" />
          Candidate Matching & Analytics
        </button>

        <button
          onClick={() => setMainTab('lead')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all ${
            mainTab === 'lead'
              ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Activity className="w-4 h-4" />
          Project Lead Control Center
        </button>

        <button
          onClick={() => setMainTab('gantt')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all ${
            mainTab === 'gantt'
              ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Gantt Schedule Timeline
        </button>

        <button
          onClick={() => setMainTab('workload')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all ${
            mainTab === 'workload'
              ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          Team Workload
        </button>

        <button
          onClick={() => setMainTab('employee')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all ${
            mainTab === 'employee'
              ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          Employee My Tasks View
        </button>
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

      {/* Main Tab Views */}
      {mainTab === 'matching' && (
        <div className="space-y-8">
          {/* Interactive Architecture Playground */}
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

          {/* Live Rank Change Tracker */}
          <RankChangeTracker rankChanges={rankChanges} />

          {/* Analytics View Mode Switcher */}
          <div className="flex flex-wrap items-center justify-between gap-4">
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

          {/* View Mode Content */}
          {viewMode === 'cards' && (
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
        </div>
      )}

      {mainTab === 'lead' && selectedProject && (
        <ProjectLeadDashboard
          project={selectedProject}
          tasks={projectTasks}
          profiles={profiles}
          health={projectHealth}
          activities={activities}
          onAddTask={handleAddTask}
          onUpdateTaskStatus={handleUpdateTaskStatus}
        />
      )}

      {mainTab === 'gantt' && selectedProject && (
        <GanttTimelineView tasks={projectTasks} project={selectedProject} />
      )}

      {mainTab === 'workload' && (
        <TeamWorkloadWidget workloads={teamWorkloads} />
      )}

      {mainTab === 'employee' && (
        <EmployeeMyTasks
          tasks={projectTasks}
          profiles={profiles}
          onUpdateTaskStatus={handleUpdateTaskStatus}
        />
      )}

      {/* Modals & AI Advisor Drawer */}
      <AICandidateAdvisor
        isOpen={isAIAdvisorOpen}
        onClose={() => setIsAIAdvisorOpen(false)}
        project={selectedProject}
        matchResults={matchResults}
      />

      <ArchitectureModal
        isOpen={isArchitectureModalOpen}
        onClose={() => setIsArchitectureModalOpen(false)}
      />

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
