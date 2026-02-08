"use client";

import React, { useState, useEffect } from "react";
import { CheckSquare, Zap, Hash, GitBranch, Target, Building, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAppStore } from "@/lib/store";

interface CreateTaskFormProps {
  task?: string;
  status?: string;
  type?: string;
  estimatedSP?: number;
  sprint?: string;
  epic?: string;
  githubLink?: string;
  teamId?: string;
  pageId?: string;
  workspaceId?: string;
}

const STATUSES = ["Ready to start", "In Progress", "Done"];
const TYPES = ["Feature", "Bug", "Other"];

export default function CreateTaskForm({
  task: initialTask = "",
  status: initialStatus = "Ready to start",
  type: initialType = "Feature",
  estimatedSP: initialSP = 1,
  sprint: initialSprint = "",
  epic: initialEpic = "",
  githubLink: initialGithubLink = "",
  teamId: initialTeamId,
  pageId,
  workspaceId: initialWorkspaceId,
}: CreateTaskFormProps) {
  const { user } = useAuth();
  const { workspaces, fetchWorkspaces } = useAppStore();

  // Validate initial values
  const validStatus = STATUSES.includes(initialStatus) ? initialStatus : "Ready to start";
  const validType = TYPES.includes(initialType) ? initialType : "Feature";

  const [formData, setFormData] = useState({
    task: initialTask,
    status: validStatus,
    type: validType,
    estimatedSP: initialSP,
    sprint: initialSprint,
    epic: initialEpic,
    githubLink: initialGithubLink,
  });

  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState(initialWorkspaceId || "");
  const [selectedTeamId, setSelectedTeamId] = useState(initialTeamId || "");
  
  const [sprints, setSprints] = useState<any[]>([]);
  const [epics, setEpics] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  // Fetch workspaces (force refresh on mount)
  useEffect(() => {
    if (user) {
      fetchWorkspaces(user.uid, user.email).catch(console.error);
    }
  }, [user, fetchWorkspaces]);

  // Set default workspace if none selected
  useEffect(() => {
    if (!selectedWorkspaceId && workspaces.length > 0) {
      setSelectedWorkspaceId(workspaces[0].id);
    }
  }, [workspaces, selectedWorkspaceId]);

  // Get active workspace and teams
  const activeWorkspace = workspaces.find(w => w.id === selectedWorkspaceId);
  const teams = activeWorkspace?.teams || [];

  // Update selected team when workspace changes
  useEffect(() => {
    if (teams.length > 0) {
      const teamExists = teams.find(t => t.id === selectedTeamId);
      if (!teamExists) {
        setSelectedTeamId(teams[0].id);
      }
    } else {
      setSelectedTeamId("");
    }
  }, [selectedWorkspaceId, teams, selectedTeamId]);

  // Fetch sprints and epics when workspace/team changes
  useEffect(() => {
    const fetchData = async () => {
      if (!selectedWorkspaceId || !selectedTeamId) return;
      setLoading(true);
      try {
        const [sprintsRes, epicsRes] = await Promise.all([
          fetch(`/api/sprints?workspaceId=${selectedWorkspaceId}&teamId=${selectedTeamId}`),
          fetch(`/api/epics?workspaceId=${selectedWorkspaceId}&teamId=${selectedTeamId}`),
        ]);
        const sprintsData = await sprintsRes.json();
        const epicsData = await epicsRes.json();

        if (sprintsData.success) setSprints(sprintsData.data || []);
        if (epicsData.success) setEpics(epicsData.data || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedWorkspaceId, selectedTeamId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorkspaceId || !selectedTeamId) {
      setResult({ success: false, message: "Please select a workspace and team" });
      return;
    }

    setIsSubmitting(true);
    setResult(null);

    try {
      // Get default page ID from selected team if not provided
      const activeWorkspace = workspaces.find(w => w.id === selectedWorkspaceId);
      const activeTeam = activeWorkspace?.teams?.find(t => t.id === selectedTeamId);
      const effectivePageId = pageId || activeTeam?.pages?.[0]?.id || "chat-generated";

      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          group: formData.sprint || "Backlog",
          teamId: selectedTeamId,
          pageId: effectivePageId,
          workspaceId: selectedWorkspaceId,
          reporter: {
            id: user?.uid,
            name: user?.displayName || user?.email || "Unknown",
            email: user?.email || "",
          },
          owner: {
            id: user?.uid,
            name: user?.displayName || user?.email || "Unknown",
            email: user?.email || "",
          },
          assignee: {
            id: "",
            name: "",
            email: ""
          },
          timeLogs: [],
          subtasks: [],
          comments: []
        }),
      });

      const data = await response.json();
      if (data.success) {
        setResult({ success: true, message: "Task created successfully!" });
        setFormData({
          task: "",
          status: "Ready to start",
          type: "Feature",
          estimatedSP: 1,
          sprint: "",
          epic: "",
          githubLink: "",
        });
      } else {
        setResult({ success: false, message: data.error || "Failed to create task" });
      }
    } catch (error: any) {
      setResult({ success: false, message: error.message || "An error occurred" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-800 p-6 max-w-md w-full">
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <CheckSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Create New Task</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Workspace & Team Selection */}
        <div className="grid grid-cols-2 gap-3 mb-4 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-100 dark:border-zinc-800">
           <div>
            <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">
              Workspace
            </label>
            <div className="relative">
              <Building className="absolute left-2 top-2 w-4 h-4 text-zinc-400" />
              <select
                value={selectedWorkspaceId}
                onChange={(e) => setSelectedWorkspaceId(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="" disabled>Select Workspace</option>
                {workspaces.map((ws) => (
                  <option key={ws.id} value={ws.id}>{ws.title}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">
              Team
            </label>
            <div className="relative">
              <Users className="absolute left-2 top-2 w-4 h-4 text-zinc-400" />
              <select
                value={selectedTeamId}
                onChange={(e) => setSelectedTeamId(e.target.value)}
                disabled={!selectedWorkspaceId || teams.length === 0}
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
              >
                <option value="" disabled>Select Team</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>{t.title}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Task Name */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Task Name *
          </label>
          <input
            type="text"
            value={formData.task}
            onChange={(e) => setFormData({ ...formData, task: e.target.value })}
            placeholder="e.g., Implement login page"
            required
            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Status & Type Row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              <Zap className="w-4 h-4 inline mr-1" /> Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Estimated SP & Sprint Row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              <Hash className="w-4 h-4 inline mr-1" /> Estimated SP
            </label>
            <input
              type="number"
              min={1}
              value={formData.estimatedSP}
              onChange={(e) => setFormData({ ...formData, estimatedSP: parseInt(e.target.value) || 1 })}
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Sprint
            </label>
            <select
              value={formData.sprint}
              onChange={(e) => setFormData({ ...formData, sprint: e.target.value })}
              disabled={loading}
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
            >
              <option value="">No Sprint</option>
              {loading ? (
                <option disabled>Loading...</option>
              ) : (
                sprints.map((s) => (
                  <option key={s._id || s.id} value={s.sprint}>{s.sprint}</option>
                ))
              )}
            </select>
          </div>
        </div>

        {/* Epic */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            <Target className="w-4 h-4 inline mr-1" /> Epic
          </label>
          <select
            value={formData.epic}
            onChange={(e) => setFormData({ ...formData, epic: e.target.value })}
            disabled={loading}
            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
          >
            <option value="">No Epic</option>
            {loading ? (
              <option disabled>Loading...</option>
            ) : (
              epics.map((e) => (
                <option key={e._id || e.id} value={e.epic}>{e.epic}</option>
              ))
            )}
          </select>
        </div>

        {/* GitHub Link */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            <GitBranch className="w-4 h-4 inline mr-1" /> GitHub Link
          </label>
          <input
            type="url"
            value={formData.githubLink}
            onChange={(e) => setFormData({ ...formData, githubLink: e.target.value })}
            placeholder="https://github.com/..."
            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Result Message */}
        {result && (
          <div className={`p-3 rounded-lg text-sm ${result.success ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400" : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"}`}>
            {result.message}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || !formData.task || !selectedWorkspaceId || !selectedTeamId}
          className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-400 text-white font-medium rounded-lg transition-colors"
        >
          {isSubmitting ? "Creating..." : "Create Task"}
        </button>
      </form>
    </div>
  );
}
