"use client";

import React, { useState, useEffect } from "react";
import { Bug, Building, Users, User, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAppStore } from "@/lib/store";

interface AssignBugFormProps {
  bugId?: string;
  assigneeId?: string;
  teamId?: string;
  workspaceId?: string;
}

export default function AssignBugForm({
  bugId: initialBugId = "",
  assigneeId: initialAssigneeId = "",
  teamId: initialTeamId = "",
  workspaceId: initialWorkspaceId,
}: AssignBugFormProps) {
  const { user } = useAuth();
  const { workspaces, fetchWorkspaces } = useAppStore();

  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState(initialWorkspaceId || "");
  const [selectedTeamId, setSelectedTeamId] = useState(initialTeamId || "");
  const [selectedBugId, setSelectedBugId] = useState(initialBugId || "");
  const [selectedAssigneeId, setSelectedAssigneeId] = useState(initialAssigneeId || "");
  
  const [bugs, setBugs] = useState<any[]>([]);
  const [loadingBugs, setLoadingBugs] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  // Fetch workspaces on mount
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

  // Derived state
  const activeWorkspace = workspaces.find(w => w.id === selectedWorkspaceId);
  const teams = activeWorkspace?.teams || [];
  // Get members from workspace. If not populated, we might need to rely on what's available or fetch.
  // Assuming workspace object has members.
  const members = activeWorkspace?.members || activeWorkspace?.teamMembers || [];

  // Default team
  useEffect(() => {
    if (teams.length > 0 && !selectedTeamId) {
      setSelectedTeamId(teams[0].id);
    }
  }, [teams, selectedTeamId]);

  // Fetch bugs when team changes
  useEffect(() => {
    if (selectedWorkspaceId && selectedTeamId) {
      setLoadingBugs(true);
      fetch(`/api/bugs?workspaceId=${selectedWorkspaceId}&teamId=${selectedTeamId}`)
        .then(res => res.json())
        .then(data => {
            if (data.success && Array.isArray(data.data)) {
                setBugs(data.data);
            } else {
                setBugs([]);
            }
        })
        .catch(err => {
            console.error("Failed to fetch bugs", err);
            setBugs([]);
        })
        .finally(() => setLoadingBugs(false));
    } else {
        setBugs([]);
    }
  }, [selectedWorkspaceId, selectedTeamId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBugId || !selectedAssigneeId) {
      setResult({ success: false, message: "Please select a bug and an assignee" });
      return;
    }

    setIsSubmitting(true);
    setResult(null);

    try {
      // Find the selected user details
      const assigneeUser = members.find(m => m.id === selectedAssigneeId);
      if (!assigneeUser) {
          throw new Error("Selected user not found in workspace");
      }

      const response = await fetch("/api/bugs", {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "X-User-Id": user?.uid || ""
        },
        body: JSON.stringify({
          id: selectedBugId,
          workspaceId: selectedWorkspaceId,
          teamId: selectedTeamId,
          assignee: {
            id: assigneeUser.id,
            name: assigneeUser.name,
            email: assigneeUser.email,
            avatar: assigneeUser.avatar
          }
        }),
      });

      const data = await response.json();
      if (data.success) {
        setResult({ success: true, message: `Bug assigned to ${assigneeUser.name}!` });
        // Optionally refresh bugs list? 
        // We might want to keep the form open for more assignments.
      } else {
        setResult({ success: false, message: data.error || "Failed to assign bug" });
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
          <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Assign Bug</h3>
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
                className="w-full px-3 py-1.5 text-sm border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="w-full px-3 py-1.5 text-sm border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
              >
                <option value="" disabled>Select Team</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>{t.title}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Bug Selection */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
             <Bug className="w-4 h-4 inline mr-1" /> Select Bug
          </label>
          <select
            value={selectedBugId}
            onChange={(e) => setSelectedBugId(e.target.value)}
            disabled={loadingBugs || bugs.length === 0}
            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
          >
            <option value="" disabled>{loadingBugs ? "Loading bugs..." : "Choose a bug..."}</option>
            {bugs.map((b) => (
               <option key={b._id || b.id} value={b._id || b.id}>
                 {b.bug || b.title || "Untitled Bug"} ({b.status})
               </option>
            ))}
          </select>
          {bugs.length === 0 && !loadingBugs && selectedTeamId && (
              <p className="text-xs text-amber-600 mt-1">No bugs found in this team.</p>
          )}
        </div>

        {/* Assignee Selection */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
             <ArrowRight className="w-4 h-4 inline mr-1" /> Assign To
          </label>
          <select
            value={selectedAssigneeId}
            onChange={(e) => setSelectedAssigneeId(e.target.value)}
            disabled={members.length === 0}
            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
          >
            <option value="" disabled>Choose a member...</option>
             {members.map((m: any) => (
               <option key={m.id} value={m.id}>
                 {m.name || m.email || "Unknown User"}
               </option>
            ))}
          </select>
           {members.length === 0 && selectedWorkspaceId && (
              <p className="text-xs text-amber-600 mt-1">No members found in this workspace.</p>
          )}
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
          disabled={isSubmitting || !selectedBugId || !selectedAssigneeId}
          className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-400 text-white font-medium rounded-lg transition-colors"
        >
          {isSubmitting ? "Assigning..." : "Assign Bug"}
        </button>
      </form>
    </div>
  );
}
