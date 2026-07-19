"use client";

import { useState, useMemo } from "react";
import {
  Goal,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Plus,
  X,
  Pencil,
  Trash2,
} from "lucide-react";
import { useGoals } from "@/lib/hooks/use-goals";
import type { Goal as GoalType, Project } from "@/lib/types/goals";

const formatNaira = (value: number) => `₦${Math.round(value).toLocaleString()}`;

let nextGoalId = 100;
let nextProjectId = 100;

export default function GoalsPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "financial" | "projects">("overview");
  const { data, isLoading, error } = useGoals();

  const [addedGoals, setAddedGoals] = useState<GoalType[]>([]);
  const [addedProjects, setAddedProjects] = useState<Project[]>([]);
  const [editedGoalKeys, setEditedGoalKeys] = useState<Record<string, GoalType>>({});
  const [editedProjectKeys, setEditedProjectKeys] = useState<Record<string, Project>>({});

  const [deletedGoalSet, setDeletedGoalSet] = useState(() => new Set<string>());
  const [deletedProjectSet, setDeletedProjectSet] = useState(() => new Set<string>());

  const allGoals: GoalType[] = useMemo(() => {
    const originals: GoalType[] = (data?.goals ?? []).map((g, i) => ({ ...g, _key: `orig-${i}` }));
    const added: GoalType[] = addedGoals.map((g, i) => ({ ...g, _key: `add-${i}` }));
    return [...originals, ...added]
      .filter((g) => !deletedGoalSet.has((g as GoalType & { _key: string })._key ?? g.id))
      .map((g) => editedGoalKeys[(g as GoalType & { _key: string })._key ?? g.id] ?? g);
  }, [data, addedGoals, deletedGoalSet, editedGoalKeys]);

  const allProjects: Project[] = useMemo(() => {
    const originals: Project[] = (data?.projects ?? []).map((p, i) => ({ ...p, _key: `orig-${i}` }));
    const added: Project[] = addedProjects.map((p, i) => ({ ...p, _key: `add-${i}` }));
    return [...originals, ...added]
      .filter((p) => !deletedProjectSet.has((p as Project & { _key: string })._key ?? p.id))
      .map((p) => editedProjectKeys[(p as Project & { _key: string })._key ?? p.id] ?? p);
  }, [data, addedProjects, deletedProjectSet, editedProjectKeys]);

  const [goalFormOpen, setGoalFormOpen] = useState(false);
  const [editingGoalKey, setEditingGoalKey] = useState<string | null>(null);
  const [goalName, setGoalName] = useState("");
  const [goalTarget, setGoalTarget] = useState("");
  const [goalDeadline, setGoalDeadline] = useState("");
  const [goalCategory, setGoalCategory] = useState("");

  const [projectFormOpen, setProjectFormOpen] = useState(false);
  const [editingProjectKey, setEditingProjectKey] = useState<string | null>(null);
  const [projName, setProjName] = useState("");
  const [projBudget, setProjBudget] = useState("");
  const [projDeadline, setProjDeadline] = useState("");
  const [projStatus, setProjStatus] = useState("In Progress");

  const getGoalKey = (g: GoalType) => (g as GoalType & { _key: string })._key ?? g.id;
  const getProjectKey = (p: Project) => (p as Project & { _key: string })._key ?? p.id;

  const resetGoalForm = () => {
    setGoalName(""); setGoalTarget(""); setGoalDeadline(""); setGoalCategory("");
    setEditingGoalKey(null); setGoalFormOpen(false);
  };

  const resetProjectForm = () => {
    setProjName(""); setProjBudget(""); setProjDeadline(""); setProjStatus("In Progress");
    setEditingProjectKey(null); setProjectFormOpen(false);
  };

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalName || !goalTarget || !goalDeadline || !goalCategory) return;
    if (editingGoalKey) {
      setEditedGoalKeys((prev) => ({ ...prev, [editingGoalKey]: { ...allGoals.find((g) => getGoalKey(g) === editingGoalKey)!, name: goalName, target: Number(goalTarget), deadline: goalDeadline, category: goalCategory } }));
    } else {
      const newGoal: GoalType = { id: String(nextGoalId++), name: goalName, target: Number(goalTarget), current: 0, deadline: goalDeadline, category: goalCategory };
      setAddedGoals((prev) => [...prev, newGoal]);
    }
    resetGoalForm();
  };

  const handleEditGoal = (g: GoalType) => {
    setEditingGoalKey(getGoalKey(g)); setGoalName(g.name); setGoalTarget(String(g.target));
    setGoalDeadline(g.deadline); setGoalCategory(g.category); setGoalFormOpen(true);
  };

  const handleDeleteGoal = (g: GoalType) => {
    const key = getGoalKey(g);
    setDeletedGoalSet((prev) => { const next = new Set(prev); next.add(key); return next; });
  };

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projName || !projBudget || !projDeadline) return;
    if (editingProjectKey) {
      setEditedProjectKeys((prev) => ({ ...prev, [editingProjectKey]: { ...allProjects.find((p) => getProjectKey(p) === editingProjectKey)!, name: projName, budget: Number(projBudget), deadline: projDeadline, status: projStatus } }));
    } else {
      const newProject: Project = { id: String(nextProjectId++), name: projName, budget: Number(projBudget), spent: 0, revenue: 0, deadline: projDeadline, status: projStatus };
      setAddedProjects((prev) => [...prev, newProject]);
    }
    resetProjectForm();
  };

  const handleEditProject = (p: Project) => {
    setEditingProjectKey(getProjectKey(p)); setProjName(p.name); setProjBudget(String(p.budget));
    setProjDeadline(p.deadline); setProjStatus(p.status); setProjectFormOpen(true);
  };

  const handleDeleteProject = (p: Project) => {
    const key = getProjectKey(p);
    setDeletedProjectSet((prev) => { const next = new Set(prev); next.add(key); return next; });
  };

  if (isLoading) {
    return <div className="flex h-96 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;
  }

  if (error || !data) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-zinc-500">Failed to load goals. Please try again.</p>
        </div>
      </div>
    );
  }

  const goals = allGoals.map((g) => {
    const progress = Math.min(100, Math.round((g.current / g.target) * 100));
    const status = progress >= 80 ? "on-track" : progress >= 50 ? "at-risk" : "behind";
    return { ...g, progress, status };
  });

  const projects = allProjects;

  return (
    <div className="space-y-8 pb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <Goal className="w-6 h-6 text-emerald-500" /> Goals & Projects
          </h1>
          <p className="text-zinc-500">Track financial goals, project budgets, and profitability.</p>
        </div>
        <div className="flex gap-2">
          {activeTab === "financial" && (
            <button onClick={() => { resetGoalForm(); setGoalFormOpen(!goalFormOpen); }}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-50 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 rounded-lg font-medium transition-colors text-sm">
              {goalFormOpen ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {goalFormOpen ? "Cancel" : "Add Goal"}
            </button>
          )}
          {activeTab === "projects" && (
            <button onClick={() => { resetProjectForm(); setProjectFormOpen(!projectFormOpen); }}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-50 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 rounded-lg font-medium transition-colors text-sm">
              {projectFormOpen ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {projectFormOpen ? "Cancel" : "Add Project"}
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
        {(["overview", "financial", "projects"] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === tab
                ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50"
            }`}>
            {tab === "overview" ? "Goals Overview" : tab === "financial" ? "Financial Goals" : "Projects"}
          </button>
        ))}
      </div>

      {goalFormOpen && (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6 animate-in slide-in-from-top-4 fade-in duration-300">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-4 flex items-center gap-2">
            <Goal className="w-5 h-5 text-zinc-500" /> {editingGoalKey ? "Edit Goal" : "Add Goal"}
          </h2>
          <form onSubmit={handleAddGoal} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Name</label>
              <input type="text" required value={goalName} onChange={(e) => setGoalName(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. Reach ₦10M MRR" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Target (₦)</label>
              <input type="number" required min="0" value={goalTarget} onChange={(e) => setGoalTarget(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="5000000" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Deadline</label>
              <input type="date" required value={goalDeadline} onChange={(e) => setGoalDeadline(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Category</label>
              <input type="text" required value={goalCategory} onChange={(e) => setGoalCategory(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. Revenue" />
            </div>
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm transition-colors h-[38px]">
              {editingGoalKey ? "Update" : "Add Goal"}
            </button>
          </form>
        </div>
      )}

      {projectFormOpen && (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6 animate-in slide-in-from-top-4 fade-in duration-300">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-4 flex items-center gap-2">
            <Goal className="w-5 h-5 text-zinc-500" /> {editingProjectKey ? "Edit Project" : "Add Project"}
          </h2>
          <form onSubmit={handleAddProject} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Name</label>
              <input type="text" required value={projName} onChange={(e) => setProjName(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. New Feature" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Budget (₦)</label>
              <input type="number" required min="0" value={projBudget} onChange={(e) => setProjBudget(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="2000000" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Deadline</label>
              <input type="date" required value={projDeadline} onChange={(e) => setProjDeadline(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Status</label>
              <select value={projStatus} onChange={(e) => setProjStatus(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Planned">Planned</option>
              </select>
            </div>
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm transition-colors h-[38px]">
              {editingProjectKey ? "Update" : "Add Project"}
            </button>
          </form>
        </div>
      )}

      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <p className="text-xs font-medium text-zinc-500">Active Goals</p>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mt-1">{goals.filter((g) => g.status !== "completed").length}</h3>
          </div>
          <div className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <p className="text-xs font-medium text-zinc-500">Completed Goals</p>
            <h3 className="text-xl font-bold text-green-500 mt-1">{goals.filter((g) => g.status === "completed").length}</h3>
          </div>
          <div className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <p className="text-xs font-medium text-zinc-500">At Risk</p>
            <h3 className="text-xl font-bold text-amber-500 mt-1">{goals.filter((g) => g.status === "at-risk").length}</h3>
          </div>
          <div className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <p className="text-xs font-medium text-zinc-500">Active Projects</p>
            <h3 className="text-xl font-bold text-indigo-500 mt-1">{projects.filter((p) => p.status === "In Progress").length}</h3>
          </div>
        </div>
      )}

      {activeTab === "financial" && (
        <div className="space-y-6">
          {goals.map((goal) => (
            <div key={goal.id} className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">{goal.name}</h3>
                  <p className="text-sm text-zinc-500 mt-1">
                    {formatNaira(goal.current)} / {formatNaira(goal.target)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleEditGoal(goal)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDeleteGoal(goal)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                    goal.status === "on-track" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                      : goal.status === "at-risk" ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                      : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                  }`}>
                    {goal.status === "on-track" ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                    {goal.status === "on-track" ? "On Track" : goal.status === "at-risk" ? "At Risk" : "Behind"}
                  </span>
                </div>
              </div>
              <div className="h-2.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-500 ${
                  goal.status === "on-track" ? "bg-green-500" : goal.status === "at-risk" ? "bg-amber-500" : "bg-red-500"
                }`} style={{ width: `${goal.progress}%` }}></div>
              </div>
              <p className="text-xs text-zinc-400 mt-2">{goal.progress}% complete</p>
            </div>
          ))}
        </div>
      )}

      {activeTab === "projects" && (
        <div className="space-y-6">
          {projects.map((project) => {
            const remaining = project.budget - project.spent;
            return (
              <div key={project.id} className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">{project.name}</h3>
                    <p className="text-xs text-zinc-500 mt-1">Status: {project.status}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleEditProject(project)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDeleteProject(project)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      project.status === "Completed" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                    }`}>{project.status}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                    <p className="text-[10px] text-zinc-500">Budget</p>
                    <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{formatNaira(project.budget)}</p>
                  </div>
                  <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                    <p className="text-[10px] text-zinc-500">Spent</p>
                    <p className="text-sm font-bold text-red-500">{formatNaira(project.spent)}</p>
                  </div>
                  <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                    <p className="text-[10px] text-zinc-500">Remaining</p>
                    <p className="text-sm font-bold text-green-500">{formatNaira(remaining)}</p>
                  </div>
                  <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                    <p className="text-[10px] text-zinc-500">Revenue</p>
                    <p className="text-sm font-bold text-blue-500">{formatNaira(project.revenue)}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
