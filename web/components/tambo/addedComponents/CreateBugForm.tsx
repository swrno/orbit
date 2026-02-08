"use client";

import React, { useState, useEffect } from "react";
import { Bug, AlertCircle, Calendar, User, Flag, FolderOpen, Building, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAppStore } from "@/lib/store";

interface CreateBugFormProps {
  bug?: string;
  description?: string;
  dueDate?: string;
  priority?: "Critical" | "High" | "Medium" | "Low";
  status?: string;
  group?: string;
  teamId?: string;
  pageId?: string;
  workspaceId?: string;
}

const PRIORITIES = ["Critical", "High", "Medium", "Low"] as const;
const STATUSES = ["Awaiting Review", "Pending Review", "Ready for Dev", "Fixed", "Done"];
const GROUPS = ["Incoming Bugs", "Development Work", "Resolved"];

export default function CreateBugForm({
  bug: initialBug = "",
  description: initialDescription = "",
  dueDate: initialDueDate = "",
  priority: initialPriority = "Medium",
  status: initialStatus = "Awaiting Review",
  group: initialGroup = "Incoming Bugs",
  teamId: initialTeamId,
  pageId,
  workspaceId: initialWorkspaceId,
}: CreateBugFormProps) {
  const { user } = useAuth();
  const { workspaces, fetchWorkspaces } = useAppStore();

  // Validate initial values against constants
  const validPriority = PRIORITIES.includes(initialPriority as any) ? initialPriority : "Medium";
  const validStatus = STATUSES.includes(initialStatus) ? initialStatus : "Awaiting Review";
  const validGroup = GROUPS.includes(initialGroup) ? initialGroup : "Incoming Bugs";

  const [formData, setFormData] = useState({
    bug: initialBug,
    description: initialDescription,
    dueDate: initialDueDate,
    priority: validPriority,
    status: validStatus,
    group: validGroup,
  });

  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState(initialWorkspaceId || "");
  const [selectedTeamId, setSelectedTeamId] = useState(initialTeamId || "");
  const [selectedPageId, setSelectedPageId] = useState(pageId || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  // Fetch workspaces if missing
  // Fetch workspaces (force refresh on mount)
  useEffect(() => {
    if (user) {
      console.log("CreateBugForm: Fetching workspaces for", user.uid, user.email);
      fetchWorkspaces(user.uid, user.email)
        .then(() => console.log("CreateBugForm: Fetched workspaces"))
        .catch((err) => console.error("CreateBugForm: Failed to fetch", err));
    } else {
      console.log("CreateBugForm: No user found yet");
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

  // Update selected team and page when workspace changes
  useEffect(() => {
    if (teams.length > 0) {
      const teamExists = teams.find(t => t.id === selectedTeamId);
      if (!teamExists) {
        const firstTeam = teams[0];
        setSelectedTeamId(firstTeam.id);
        // Default to first page of new team
        if (firstTeam.pages && firstTeam.pages.length > 0) {
          setSelectedPageId(firstTeam.pages[0].id);
        } else {
            setSelectedPageId("");
        }
      } else {
         // Team exists, ensure page is valid or set default
         if (!selectedPageId && teamExists.pages && teamExists.pages.length > 0) {
             setSelectedPageId(teamExists.pages[0].id);
         }
      }
    } else {
      setSelectedTeamId("");
      setSelectedPageId("");
    }
  }, [selectedWorkspaceId, teams, selectedTeamId, selectedPageId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorkspaceId || !selectedTeamId) {
      setResult({ success: false, message: "Please select a workspace and team" });
      return;
    }

    setIsSubmitting(true);
    setResult(null);

    try {
      // Use selected page ID or fallback
      const effectivePageId = selectedPageId || "chat-generated";

      const response = await fetch("/api/bugs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          teamId: selectedTeamId,
          pageId: effectivePageId,
          workspaceId: selectedWorkspaceId,
          reporter: {
            id: user?.uid,
            name: user?.displayName || user?.email || "Unknown",
            email: user?.email || "",
          },
          assignee: {
            id: "",
            name: "",
            email: ""
          },
          timeUntilResolution: "",
          connectedTasks: []
        }),
      });

      const data = await response.json();
      if (data.success) {
        setResult({ success: true, message: `Bug created successfully!` });
        setFormData({
          bug: "",
          description: "",
          dueDate: "",
          priority: "Medium",
          status: "Awaiting Review",
          group: "Incoming Bugs",
        });
      } else {
        setResult({ success: false, message: data.error || "Failed to create bug" });
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
        <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <Bug className="w-5 h-5 text-red-600 dark:text-red-400" />
        </div>
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Create New Bug</h3>
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
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                 <option value="" disabled>Select Workspace</option>
                {workspaces.length === 0 ? (
                  <option disabled>No workspaces found (Loading...)</option>
                ) : (
                  workspaces.map((ws) => (
                    <option key={ws.id} value={ws.id}>{ws.title}</option>
                  ))
                )}
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
                onChange={(e) => {
                    const newTeamId = e.target.value;
                    setSelectedTeamId(newTeamId);
                    // Update page default
                    const newTeam = teams.find(t => t.id === newTeamId);
                    if (newTeam && newTeam.pages && newTeam.pages.length > 0) {
                        setSelectedPageId(newTeam.pages[0].id);
                    } else {
                        setSelectedPageId("");
                    }
                }}
                disabled={!selectedWorkspaceId || teams.length === 0}
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:opacity-50"
              >
                <option value="" disabled>Select Team</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>{t.title}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Page Selection */}
        {selectedTeamId && teams.find(t => t.id === selectedTeamId)?.pages && teams.find(t => t.id === selectedTeamId)!.pages.length > 0 && (
          <div className="mb-4">
             <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">
              Page
            </label>
            <div className="relative">
              <FolderOpen className="absolute left-2 top-2 w-4 h-4 text-zinc-400" />
              <select
                value={selectedPageId}
                onChange={(e) => setSelectedPageId(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                {teams.find(t => t.id === selectedTeamId)?.pages.map((p: any) => (
                  <option key={p.id} value={p.id}>{p.title || p.name || 'Untitled Page'}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Bug Title */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Title *
          </label>
          <input
            type="text"
            value={formData.bug}
            onChange={(e) => setFormData({ ...formData, bug: e.target.value })}
            placeholder="Brief summary of the bug"
            required
            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
            placeholder="Detailed description..."
            rows={3}
            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>

        {/* Due Date */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            <Calendar className="w-4 h-4 inline mr-1" /> Due Date
          </label>
          <input
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>

        {/* Priority & Status Row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              <Flag className="w-4 h-4 inline mr-1" /> Priority
            </label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Group */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            <FolderOpen className="w-4 h-4 inline mr-1" /> Group
          </label>
          <select
            value={formData.group}
            onChange={(e) => setFormData({ ...formData, group: e.target.value })}
            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            {GROUPS.map((g) => (
              <option key={g} value={g}>{g}</option>
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
          disabled={isSubmitting || !formData.bug || !selectedWorkspaceId || !selectedTeamId}
          className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 disabled:bg-zinc-400 text-white font-medium rounded-lg transition-colors"
        >
          {isSubmitting ? "Creating..." : "Create Bug"}
        </button>
      </form>
    </div>
  );
}
