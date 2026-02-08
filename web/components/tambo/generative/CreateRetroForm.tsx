import React, { useState } from 'react';
import { CheckCircle2, AlertTriangle, MessageSquare, RefreshCw } from "lucide-react";

const TYPE_CONFIG = {
  "Keep": { icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500/10", border: "border-green-500", label: "Keep", desc: "What went right?" },
  "Improve": { icon: AlertTriangle, color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500", label: "Improve", desc: "What needs work?" },
  "Discussion": { icon: MessageSquare, color: "text-yellow-500", bg: "bg-yellow-500/10", border: "border-yellow-500", label: "Discuss", desc: "Topics to discuss" }
};

interface CreateRetroFormProps {
  teamId?: string;
  pageId?: string;
  sprint?: string;
  className?: string;
  onInsertText?: (text: string) => void;
}

import { useAppStore } from '@/lib/store';
import { useParams } from 'next/navigation';

export default function CreateRetroForm({ teamId, pageId, sprint: defaultSprint, className, onInsertText }: CreateRetroFormProps) {
  const { workspaceId: currentWorkspaceId } = useParams();
  const { workspaces } = useAppStore();

  // State for selections
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState(currentWorkspaceId as string || '');
  const [selectedTeamId, setSelectedTeamId] = useState(teamId || '');
  const [selectedPageId, setSelectedPageId] = useState(pageId || '');

  // Derived data based on selections
  const workspace = workspaces.find(w => w.id === selectedWorkspaceId);
  const teams = workspace?.teams || [];
  const selectedTeam = teams.find(t => t.id === selectedTeamId);
  const pages = selectedTeam?.pages || [];

  // Auto-select defaults when workspace changes
  React.useEffect(() => {
    if (workspace && !selectedTeamId) {
        const firstTeam = workspace.teams[0];
        if (firstTeam) {
            setSelectedTeamId(firstTeam.id);
            if (firstTeam.pages.length > 0) {
                setSelectedPageId(firstTeam.pages[0].id);
            }
        }
    }
  }, [workspace, selectedTeamId]);

  // Auto-select page when team changes
  React.useEffect(() => {
    if (selectedTeam && !selectedPageId) {
        if (selectedTeam.pages.length > 0) {
            setSelectedPageId(selectedTeam.pages[0].id);
        }
    }
  }, [selectedTeam, selectedPageId]);

  const [feedback, setFeedback] = useState('');
  const [type, setType] = useState('Keep');
  const [sprint, setSprint] = useState(defaultSprint || 'Sprint 1');
  const [repeating, setRepeating] = useState(false);

  const handleSubmit = () => {
    let prompt = `Create a retro item with feedback "${feedback}"`;
    prompt += `, type "${type}"`;
    if (sprint) prompt += `, sprint "${sprint}"`;
    if (repeating) prompt += `, repeating true`;
    
    if (selectedTeamId) prompt += `, teamId "${selectedTeamId}"`;
    if (selectedPageId) prompt += `, pageId "${selectedPageId}"`;
    if (selectedWorkspaceId) prompt += `, workspaceId "${selectedWorkspaceId}"`;

    if (onInsertText) {
      onInsertText(prompt);
    }
  };

  return (
    <div className={`w-full max-w-md border rounded-lg shadow-sm bg-card text-card-foreground p-4 ${className}`}>
      <h3 className="text-lg font-semibold mb-4">Capture Feedback</h3>
      <div className="space-y-4">
          {/* Context Selectors */}
        <div className="grid grid-cols-2 gap-4 p-3 bg-muted/30 rounded-lg border border-border/50">
            <div className="col-span-2 space-y-1">
                <label className="text-xs font-medium text-muted-foreground uppercase">Workspace</label>
                <select 
                    value={selectedWorkspaceId} 
                    onChange={(e) => {
                        setSelectedWorkspaceId(e.target.value);
                        setSelectedTeamId('');
                        setSelectedPageId('');
                    }}
                    className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <option value="" disabled>Select Workspace</option>
                    {workspaces.map(w => (
                        <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                </select>
            </div>

            <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground uppercase">Team</label>
                <select 
                    value={selectedTeamId} 
                    onChange={(e) => {
                        setSelectedTeamId(e.target.value);
                        setSelectedPageId('');
                    }}
                     className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={!selectedWorkspaceId}
                >
                    <option value="" disabled>Select Team</option>
                    {teams.map(t => (
                        <option key={t.id} value={t.id}>{t.title}</option>
                    ))}
                </select>
            </div>
        </div>
        <div className="space-y-2">
          <label htmlFor="feedback" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Feedback</label>
          <textarea 
            id="feedback" 
            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="What went well or need improvement?" 
            value={feedback} 
            onChange={(e) => setFeedback(e.target.value)} 
          />
        </div>
        
        <div className="space-y-2">
            <label className="text-sm font-medium leading-none text-muted-foreground">What kind of feedback is this?</label>
            <div className="flex gap-2">
                {Object.entries(TYPE_CONFIG).map(([key, config]) => {
                  const Icon = config.icon;
                  const isSelected = type === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setType(key)}
                      className={`flex-1 flex flex-col items-center gap-1 p-3 rounded-lg border transition-all ${isSelected ? `${config.border} ${config.bg}` : "border-border bg-background hover:bg-muted/50"}`}
                    >
                      <Icon className={`w-6 h-6 ${isSelected ? config.color : "text-muted-foreground"}`} />
                      <div className="text-center">
                        <div className={`text-sm font-semibold ${isSelected ? config.color : "text-foreground"}`}>{config.label}</div>
                        <div className="text-[10px] text-muted-foreground">{config.desc}</div>
                      </div>
                    </button>
                  );
                })}
            </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="sprint" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Sprint</label>
          <input 
            id="sprint" 
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="e.g., Sprint 1" 
            value={sprint} 
            onChange={(e) => setSprint(e.target.value)} 
          />
        </div>

        <div className="flex items-center space-x-2">
            <input 
                type="checkbox" 
                id="repeating" 
                checked={repeating} 
                onChange={(e) => setRepeating(e.target.checked)}
                className="h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
            />
          <label htmlFor="repeating" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Repeating Issue</label>
        </div>

        <button 
             className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full"
            onClick={handleSubmit} 
            disabled={!feedback || !selectedTeamId || !selectedPageId}
        >
          Add Feedback
        </button>
      </div>
    </div>
  );
}
