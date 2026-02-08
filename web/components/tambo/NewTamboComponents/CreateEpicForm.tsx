"use client";

import React, { useState, useEffect } from "react";
import { Target, Calendar, Layers, Flag, Building, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAppStore } from "@/lib/store";

interface CreateEpicFormProps {
  epic?: string;
  description?: string;
  startDate?: string;
  dueDate?: string;
  phase?: string;
  priority?: string;
  hierarchy?: number;
  teamId?: string;
  pageId?: string;
  workspaceId?: string;
}

const PHASES = ["Product discovery", "Backlog", "Dev WIP", "Nice to Have", "Best Effort"];
const PRIORITIES = ["Must Have", "Critical", "Nice to Have"];
const HIERARCHY_LEVELS = [
  { value: 0, label: "Top Level (0)" },
  { value: 1, label: "Sub-epic (1)" },
  { value: 2, label: "Sub-sub-epic (2)" },
];

export default function CreateEpicForm({
  epic: initialEpic = "",
  description: initialDescription = "",
  startDate: initialStartDate = "",
  dueDate: initialDueDate = "",
  phase: initialPhase = "Backlog",
  priority: initialPriority = "Nice to Have",
  hierarchy: initialHierarchy = 0,
  teamId: initialTeamId,
  pageId,
  workspaceId: initialWorkspaceId,
}: CreateEpicFormProps) {
  const { user } = useAuth();
  const { workspaces, fetchWorkspaces } = useAppStore();

  const [formData, setFormData] = useState({
    epic: initialEpic,
    description: initialDescription,
    startDate: initialStartDate,
    dueDate: initialDueDate,
    phase: initialPhase,
    priority: initialPriority,
    hierarchy: initialHierarchy,
  });

  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState(initialWorkspaceId || "");
  const [selectedTeamId, setSelectedTeamId] = useState(initialTeamId || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  // Fetch workspaces (force refresh on mount)
  useEffect(() => {
    if (user) {
      fetchWorkspaces(user.uid, user.email).catch(console.error);
    }
  }, [user, fetchWorkspaces]);

  // Default workspace
  useEffect(() => {
    if (!selectedWorkspaceId && workspaces.length > 0) {
      setSelectedWorkspaceId(workspaces[0].id);
    }
  }, [workspaces, selectedWorkspaceId]);

  // Active workspace and teams
  const activeWorkspace = workspaces.find(w => w.id === selectedWorkspaceId);
  const teams = activeWorkspace?.teams || [];

  // Default team
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorkspaceId || !selectedTeamId) {
      setResult({ success: false, message: "Please select a workspace and team" });
      return;
    }

    setIsSubmitting(true);
    setResult(null);

    try {
      const response = await fetch("/api/epics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          teamId: selectedTeamId,
          pageId: pageId || "chat-generated",
          workspaceId: selectedWorkspaceId,
          owner: {
            id: user?.uid,
            name: user?.displayName || user?.email || "Unknown",
            email: user?.email || "",
          },
        }),
      });

      const data = await response.json();
      if (data.success) {
        setResult({ success: true, message: "Epic created successfully!" });
        setFormData({
          epic: "",
          description: "",
          startDate: "",
          dueDate: "",
          phase: "Backlog",
          priority: "Nice to Have",
          hierarchy: 0,
        });
      } else {
        setResult({ success: false, message: data.error || "Failed to create epic" });
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
        <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
          <Target className="w-5 h-5 text-purple-600 dark:text-purple-400" />
        </div>
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Create New Epic</h3>
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
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
              >
                <option value="" disabled>Select Team</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>{t.title}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Epic Name */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Epic Name *
          </label>
          <input
            type="text"
            value={formData.epic}
            onChange={(e) => setFormData({ ...formData, epic: e.target.value })}
            placeholder="e.g., User Authentication System"
            required
            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Detailed description of the epic..."
            rows={3}
            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              <Calendar className="w-4 h-4 inline mr-1" /> Start Date
            </label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              <Calendar className="w-4 h-4 inline mr-1" /> Due Date
            </label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Phase */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Phase
          </label>
          <select
            value={formData.phase}
            onChange={(e) => setFormData({ ...formData, phase: e.target.value })}
            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            {PHASES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        {/* Priority & Hierarchy Row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              <Flag className="w-4 h-4 inline mr-1" /> Priority
            </label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              <Layers className="w-4 h-4 inline mr-1" /> Hierarchy
            </label>
            <select
              value={formData.hierarchy}
              onChange={(e) => setFormData({ ...formData, hierarchy: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {HIERARCHY_LEVELS.map((h) => (
                <option key={h.value} value={h.value}>{h.label}</option>
              ))}
            </select>
          </div>
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
          disabled={isSubmitting || !formData.epic || !selectedWorkspaceId || !selectedTeamId}
          className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-700 disabled:bg-zinc-400 text-white font-medium rounded-lg transition-colors"
        >
          {isSubmitting ? "Creating..." : "Create Epic"}
        </button>
      </form>
    </div>
  );
}
