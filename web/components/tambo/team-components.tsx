"use client";

import { useState } from "react";
import { useAppStore, TeamMember } from "@/lib/store";
import {
  Users, UserPlus, Trash2, Mail, Shield, ShieldAlert, User,
  Loader2, CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { WorkspaceSelector } from "@/components/tambo/workspace-selector";

// --- Team List ---

export function TeamList() {
  const { workspaces, currentWorkspaceId, removeTeamMember } = useAppStore();
  const workspace = workspaces.find(w => w.id === currentWorkspaceId);
  const team = workspace?.teamMembers || [];

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!currentWorkspaceId) return;
    setDeletingId(id);
    await new Promise(resolve => setTimeout(resolve, 600)); // Fake delay
    removeTeamMember(currentWorkspaceId, id);
    setDeletingId(null);
  };

  if (!workspace) return null;

  return (
    <div className="bg-card border border-border rounded-lg shadow-sm w-full max-w-md overflow-hidden flex flex-col">
      <div className="p-3 bg-muted/30 border-b border-border flex items-center justify-between">
        <h3 className="font-medium text-sm flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          Team Members ({team.length})
        </h3>
      </div>
      <div className="max-h-[300px] overflow-y-auto">
        {team.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-xs">
            No team members yet.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {team.map((member) => (
              <div key={member.id} className="p-3 flex items-center justify-between hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-medium">
                    {member.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={member.avatar} alt={member.name} className="h-full w-full rounded-full object-cover" />
                    ) : (
                      member.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-medium leading-none">{member.name}</div>
                    <div className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                      <Mail className="h-3 w-3" /> {member.email}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded-full font-medium border",
                    member.role === 'admin'
                      ? "bg-amber-50 text-amber-700 border-amber-200"
                      : "bg-slate-50 text-slate-700 border-slate-200"
                  )}>
                    {member.role === 'admin' ? 'Admin' : 'Member'}
                  </div>
                  <button
                    onClick={() => handleDelete(member.id)}
                    disabled={deletingId === member.id}
                    className="h-6 w-6 flex items-center justify-center rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    {deletingId === member.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Trash2 className="h-3 w-3" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// --- Team Member Creator ---

interface TeamMemberCreatorProps {
  defaultName?: string;
  defaultEmail?: string;
}

export function TeamMemberCreator({ defaultName = "", defaultEmail = "" }: TeamMemberCreatorProps) {
  const { currentWorkspaceId, workspaces, addTeamMember } = useAppStore();

  const [name, setName] = useState(defaultName);
  const [email, setEmail] = useState(defaultEmail);
  const [role, setRole] = useState("member");
  const [targetWorkspaceId, setTargetWorkspaceId] = useState(currentWorkspaceId || (workspaces[0]?.id ?? ""));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetWorkspaceId || !name.trim() || !email.trim()) return;

    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 800));

    addTeamMember(targetWorkspaceId, {
      name,
      email,
      role,
      avatar: ""
    });

    setIsSubmitting(false);
    setIsSuccess(true);
  };

  if (isSuccess) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex flex-col items-center text-green-700 animate-in fade-in zoom-in duration-300">
        <UserPlus className="h-8 w-8 text-green-600 mb-2" />
        <p className="font-medium">Member Added!</p>
        <p className="text-xs text-muted-foreground mt-1">To {workspaces.find(w => w.id === targetWorkspaceId)?.name}</p>
        <button
          onClick={() => { setIsSuccess(false); setName(""); setEmail(""); }}
          className="text-xs underline mt-2 hover:text-green-800"
        >
          Add another
        </button>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg shadow-sm w-full max-w-sm overflow-hidden">
      <div className="p-3 bg-muted/30 border-b border-border">
        <h3 className="font-medium text-sm flex items-center gap-2">
          <UserPlus className="h-4 w-4 text-primary" />
          Add Team Member
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-3">
        <WorkspaceSelector />

        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="john@example.com"
            type="email"
            className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Role</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setRole("member")}
              className={cn(
                "flex-1 px-3 py-2 text-xs rounded-md border transition-colors flex items-center justify-center gap-1.5",
                role === "member"
                  ? "bg-primary/10 border-primary text-primary font-medium"
                  : "bg-background border-border hover:bg-muted text-muted-foreground"
              )}
            >
              <User className="h-3 w-3" /> Member
            </button>
            <button
              type="button"
              onClick={() => setRole("admin")}
              className={cn(
                "flex-1 px-3 py-2 text-xs rounded-md border transition-colors flex items-center justify-center gap-1.5",
                role === "admin"
                  ? "bg-amber-50 border-amber-500 text-amber-700 font-medium"
                  : "bg-background border-border hover:bg-muted text-muted-foreground"
              )}
            >
              <ShieldAlert className="h-3 w-3" /> Admin
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={!name.trim() || !email.trim() || isSubmitting}
          className="w-full mt-2 inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2 transition-colors disabled:opacity-50"
        >
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add Member"}
        </button>
      </form>
    </div>
  );
}

// --- Team Member Card ---

interface TeamMemberCardProps {
  memberId: string;
}

export function TeamMemberCard({ memberId }: TeamMemberCardProps) {
  const { workspaces, currentWorkspaceId } = useAppStore();
  const workspace = workspaces.find(w => w.id === currentWorkspaceId);
  const member = workspace?.teamMembers.find(m => m.id === memberId);

  if (!member) {
    return (
      <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
        Member not found.
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg shadow-sm w-full max-w-xs overflow-hidden p-4 flex flex-col items-center text-center">
      <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl font-medium mb-3">
        {member.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={member.avatar} alt={member.name} className="h-full w-full rounded-full object-cover" />
        ) : (
          member.name.charAt(0).toUpperCase()
        )}
      </div>

      <h3 className="font-medium text-lg">{member.name}</h3>
      <div className="text-muted-foreground text-xs mb-3 flex items-center gap-1">
        <Mail className="h-3 w-3" /> {member.email}
      </div>

      <div className={cn(
        "text-xs px-2 py-0.5 rounded-full font-medium border mb-4 inline-flex items-center gap-1",
        member.role === 'admin'
          ? "bg-amber-50 text-amber-700 border-amber-200"
          : "bg-slate-50 text-slate-700 border-slate-200"
      )}>
        <Shield className="h-3 w-3" />
        {member.role === 'admin' ? 'Admin' : 'Team Member'}
      </div>

      <div className="w-full pt-3 border-t border-border grid grid-cols-2 gap-2 text-center">
        <div>
          <div className="text-xl font-semibold">12</div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Tasks</div>
        </div>
        <div>
          <div className="text-xl font-semibold text-green-600">5</div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Completed</div>
        </div>
      </div>
    </div>
  );
}
