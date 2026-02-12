"use client";

import React, { useState, useEffect } from "react";
import { MessageSquare, CheckCircle2, AlertTriangle, Repeat, Building, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAppStore } from "@/lib/store";

interface CreateRetroFormProps {
  feedback?: string;
  type?: "Keep" | "Improve" | "Discussion";
  sprint?: string;
  repeating?: boolean;
  teamId?: string;
  pageId?: string;
  workspaceId?: string;
}

const TYPE_CONFIG = {
  Keep: {
    icon: CheckCircle2,
    color: "text-green-500",
    bg: "bg-green-50 dark:bg-green-900/20",
    border: "border-green-200 dark:border-green-800",
    label: "Keep",
    desc: "What went well?",
  },
  Improve: {
    icon: AlertTriangle,
    color: "text-orange-500",
    bg: "bg-orange-50 dark:bg-orange-900/20",
    border: "border-orange-200 dark:border-orange-800",
    label: "Improve",
    desc: "What can be better?",
  },
  Discussion: {
    icon: MessageSquare,
    color: "text-blue-500",
    bg: "bg-blue-50 dark:bg-blue-900/20",
    border: "border-blue-200 dark:border-blue-800",
    label: "Discuss",
    desc: "Topics to talk about",
  },
};

export default function CreateRetroForm({
  feedback: initialFeedback = "",
  type: initialType = "Keep",
  sprint: initialSprint = "",
  repeating: initialRepeating = false,
  teamId: initialTeamId,
  pageId,
  workspaceId: initialWorkspaceId,
}: CreateRetroFormProps) {
  const { user } = useAuth();
  const { workspaces, fetchWorkspaces } = useAppStore();

  // Validate initial type
  const validType = Object.keys(TYPE_CONFIG).includes(initialType) ? initialType : "Keep";

  const [formData, setFormData] = useState({
    feedback: initialFeedback,
    type: validType as keyof typeof TYPE_CONFIG,
    sprint: initialSprint,
    repeating: initialRepeating,
  });

  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState(initialWorkspaceId || "");
  const [selectedTeamId, setSelectedTeamId] = useState(initialTeamId || "");
  const [sprints, setSprints] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
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

  // Fetch sprints when workspace/team changes (for sprint dropdown)
  useEffect(() => {
    const fetchSprints = async () => {
      if (!selectedWorkspaceId || !selectedTeamId) return;
      setLoading(true);
      try {
        const response = await fetch(`/api/sprints?workspaceId=${selectedWorkspaceId}&teamId=${selectedTeamId}`);
        const data = await response.json();
        if (data.success) {
          setSprints(data.data || []);
        }
      } catch (error) {
        console.error("Error fetching sprints:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSprints();
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
      const response = await fetch("/api/retrospectives", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          sprint: formData.sprint || "General",
          teamId: selectedTeamId,
          pageId: pageId || "chat-generated",
          workspaceId: selectedWorkspaceId,
          submitter: {
            id: user?.uid,
            name: user?.displayName || user?.email || "Unknown",
            email: user?.email || "",
          },
          owner: {
            id: user?.uid,
            name: user?.displayName || user?.email || "Unknown",
            email: user?.email || "",
          },
        }),
      });

      const data = await response.json();
      if (data.success) {
        setResult({ success: true, message: "Feedback added successfully!" });
        setFormData({
          feedback: "",
          type: "Keep", // Reset to default
          sprint: formData.sprint, // Keep sprint selected
          repeating: false,
        });
      } else {
        setResult({ success: false, message: data.error || "Failed to add feedback" });
      }
    } catch (error: any) {
      setResult({ success: false, message: error.message || "An error occurred" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const TypeIcon = TYPE_CONFIG[formData.type].icon;

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-800 p-6 max-w-md w-full">
      <div className="flex items-center gap-3 mb-5">
        <div className={`p-2 rounded-lg ${TYPE_CONFIG[formData.type].bg}`}>
          <TypeIcon className={`w-5 h-5 ${TYPE_CONFIG[formData.type].color}`} />
        </div>
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Add Retro Feedback</h3>
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

        {/* Type Selection */}
        <div className="flex gap-2 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
          {(Object.keys(TYPE_CONFIG) as Array<keyof typeof TYPE_CONFIG>).map((type) => {
            const Config = TYPE_CONFIG[type];
            const Icon = Config.icon;
            const isSelected = formData.type === type;
            
            return (
              <button
                key={type}
                type="button"
                onClick={() => setFormData({ ...formData, type })}
                className={`flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-md text-xs font-medium transition-all ${
                  isSelected 
                    ? "bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-zinc-100" 
                    : "text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700/50"
                }`}
              >
                <Icon className={`w-4 h-4 mb-1 ${isSelected ? Config.color : "text-zinc-400"}`} />
                {Config.label}
              </button>
            );
          })}
        </div>

        {/* Feedback Text */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Feedback *
          </label>
          <textarea
            value={formData.feedback}
            onChange={(e) => setFormData({ ...formData, feedback: e.target.value })}
            placeholder={TYPE_CONFIG[formData.type].desc}
            required
            rows={3}
            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Sprint Selection */}
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
            <option value="">No Sprint (General)</option>
            {loading ? (
              <option disabled>Loading...</option>
            ) : (
              sprints.map((s) => (
                <option key={s._id || s.id} value={s.sprint}>{s.sprint}</option>
              ))
            )}
          </select>
        </div>

        {/* Repeating Checkbox */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="repeating"
            checked={formData.repeating}
            onChange={(e) => setFormData({ ...formData, repeating: e.target.checked })}
            className="w-4 h-4 text-blue-600 border-zinc-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="repeating" className="ml-2 text-sm text-zinc-700 dark:text-zinc-300 flex items-center">
            <Repeat className="w-3 h-3 mr-1" />
            Recurring feedback
          </label>
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
          disabled={isSubmitting || !formData.feedback || !selectedWorkspaceId || !selectedTeamId}
          className="w-full py-2.5 px-4 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:bg-zinc-400 disabled:dark:bg-zinc-700 text-white dark:text-zinc-900 font-medium rounded-lg transition-colors"
        >
          {isSubmitting ? "Submitting..." : "Add Feedback"}
        </button>
      </form>
    </div>
  );
}
