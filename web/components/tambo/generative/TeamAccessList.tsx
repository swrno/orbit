"use client";

import React from "react";
import { Users, UserMinus, Shield } from "lucide-react";
import { McpPromptButton } from "@/components/tambo/mcp-components";

interface MemberItem {
  id?: string;
  name: string;
  email: string;
  role?: string;
  teamRole?: string;
  avatar?: string;
}

interface TeamAccessListProps {
  members: MemberItem[];
  teamName?: string;
  teamId?: string;
}

export default function TeamAccessList({ members, teamName, teamId }: TeamAccessListProps) {
  if (!members || members.length === 0) {
    return (
      <div className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 text-center text-sm text-zinc-500">
        No team members found.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 w-full max-w-md">
       <div className="flex items-center justify-between px-1 mb-1">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {teamName ? `${teamName} Members` : 'Team Members'}
        </h3>
        <span className="text-xs text-zinc-500">{members.length} members</span>
      </div>
      <div className="flex flex-col gap-1">
        {members.map((member) => (
            <div
                key={member.id || member.email}
                className="group flex items-center justify-between p-2 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-lg hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xs font-semibold text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                        {member.name?.[0] || member.email?.[0] || 'U'}
                    </div>
                    <div>
                         <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                            {member.name}
                        </p>
                        <p className="text-xs text-zinc-500">
                            {member.email}
                        </p>
                    </div>
                </div>
                
                <div className="flex items-center gap-2">
                     <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 font-mono">
                        {member.teamRole || member.role || 'MEMBER'}
                    </span>
                    
                   {teamId && (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                             <McpPromptButton 
                                value={`Remove ${member.email} from team ${teamId}`}
                                onInsertText={() => {}}
                                className="p-1.5 h-auto min-h-0 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/40 rounded-md"
                            >
                                <UserMinus className="w-3 h-3" />
                            </McpPromptButton>
                        </div>
                   )}
                </div>
            </div>
        ))}
      </div>
    </div>
  );
}
