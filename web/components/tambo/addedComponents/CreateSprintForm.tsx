"use client";

import React, { useState, useEffect } from "react";
import { Timer, Calendar, Target, Flag, Building, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAppStore } from "@/lib/store";

interface CreateSprintFormProps {
  sprint?: string;
  sprintGoals?: string;
  activeSprintStatus?: "Planned" | "Active" | "Completed";
  sprintStartDate?: string;
  sprintEndDate?: string;
  teamId?: string;
  pageId?: string;
  workspaceId?: string;
}

const STATUSES = ["Planned", "Active", "Completed"] as const;

export default function CreateSprintForm({
  sprint: initialSprint = "",
  sprintGoals: initialGoals = "",
  activeSprintStatus: initialStatus = "Planned",
  sprintStartDate: initialStartDate = "",
  sprintEndDate: initialEndDate = "",
  teamId: initialTeamId,
  pageId,
  workspaceId: initialWorkspaceId,
}: CreateSprintFormProps) {
  const { user } = useAuth();
  const { workspaces, fetchWorkspaces } = useAppStore();

  const [formData, setFormData] = useState({
    sprint: initialSprint,
    sprintGoals: initialGoals,
    activeSprintStatus: initialStatus,
    sprintStartDate: initialStartDate,
    sprintEndDate: initialEndDate,
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
      const response = await fetch("/api/sprints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          teamId: selectedTeamId,
          pageId: pageId || "chat-generated",
          workspaceId: selectedWorkspaceId,
          createdBy: {
            id: user?.uid,
            name: user?.displayName || user?.email || "Unknown",
            email: user?.email || "",
          },
        }),
      });

      const data = await response.json();
      if (data.success) {
        setResult({ success: true, message: "Sprint created successfully!" });
        setFormData({
          sprint: "",
          sprintGoals: "",
          activeSprintStatus: "Planned",
          sprintStartDate: "",
          sprintEndDate: "",
        });
      } else {
        setResult({ success: false, message: data.error || "Failed to create sprint" });
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
        <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
          <Timer className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Create New Sprint</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Workspace & Team Selection */}
        <div className="grid grid-cols-2 gap-3 mb-4 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-100 dark:border-zinc-800">
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 uppercase mb-1">
              <Building className="w-3.5 h-3.5" /> Workspace
            </label>
            <div className="relative">
              <select
                value={selectedWorkspaceId}
                onChange={(e) => setSelectedWorkspaceId(e.target.value)}
                className="w-full px-3 py-1.5 text-sm border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="" disabled>Select Workspace</option>
                {workspaces.map((ws) => (
                  <option key={ws.id} value={ws.id}>{ws.title}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 uppercase mb-1">
              <Users className="w-3.5 h-3.5" /> Team
            </label>
            <div className="relative">
              <select
                value={selectedTeamId}
                onChange={(e) => setSelectedTeamId(e.target.value)}
                disabled={!selectedWorkspaceId || teams.length === 0}
                className="w-full px-3 py-1.5 text-sm border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50"
              >
                <option value="" disabled>Select Team</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>{t.title}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Sprint Name */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Sprint Name *
          </label>
          <input
            type="text"
            value={formData.sprint}
            onChange={(e) => setFormData({ ...formData, sprint: e.target.value })}
            placeholder="e.g., Sprint 12"
            required
            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        {/* Sprint Goals */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            <Target className="w-4 h-4 inline mr-1" /> Sprint Goals
          </label>
          <textarea
            value={formData.sprintGoals}
            onChange={(e) => setFormData({ ...formData, sprintGoals: e.target.value })}
            placeholder="Key goals for this sprint..."
            rows={3}
            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
              value={formData.sprintStartDate}
              onChange={(e) => setFormData({ ...formData, sprintStartDate: e.target.value })}
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              <Calendar className="w-4 h-4 inline mr-1" /> End Date
            </label>
            <input
              type="date"
              value={formData.sprintEndDate}
              onChange={(e) => setFormData({ ...formData, sprintEndDate: e.target.value })}
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            <Flag className="w-4 h-4 inline mr-1" /> Status
          </label>
          <select
            value={formData.activeSprintStatus}
            onChange={(e) => setFormData({ ...formData, activeSprintStatus: e.target.value as any })}
            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
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
          disabled={isSubmitting || !formData.sprint || !selectedWorkspaceId || !selectedTeamId}
          className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-zinc-400 text-white font-medium rounded-lg transition-colors"
        >
          {isSubmitting ? "Creating..." : "Create Sprint"}
        </button>
      </form>
    </div>
  );
}
