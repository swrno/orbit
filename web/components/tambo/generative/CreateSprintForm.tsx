import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useAppStore } from '@/lib/store';

interface CreateSprintFormProps {
  teamId?: string;
  pageId?: string;
  className?: string;
  onInsertText?: (text: string) => void;
}

export default function CreateSprintForm({ teamId, pageId, className, onInsertText }: CreateSprintFormProps) {
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

  const [sprint, setSprint] = useState('');
  const [sprintGoals, setSprintGoals] = useState('');
  const [activeSprintStatus, setActiveSprintStatus] = useState('Planned');
  const [sprintStartDate, setSprintStartDate] = useState('');
  const [sprintEndDate, setSprintEndDate] = useState('');

  const handleSubmit = () => {
    let prompt = `Create a sprint with name "${sprint}"`;
    if (sprintGoals) prompt += `, goals "${sprintGoals}"`;
    prompt += `, status "${activeSprintStatus}"`;
    
    if (sprintStartDate) prompt += `, startDate "${new Date(sprintStartDate).toISOString()}"`;
    if (sprintEndDate) prompt += `, endDate "${new Date(sprintEndDate).toISOString()}"`;
    
    if (selectedTeamId) prompt += `, teamId "${selectedTeamId}"`;
    if (selectedPageId) prompt += `, pageId "${selectedPageId}"`;
    if (selectedWorkspaceId) prompt += `, workspaceId "${selectedWorkspaceId}"`;

    if (onInsertText) {
       onInsertText(prompt);
    }
  };

  return (
    <div className={`w-full max-w-md border rounded-lg shadow-sm bg-card text-card-foreground p-4 ${className}`}>
      <h3 className="text-lg font-semibold mb-4">Create Sprint</h3>
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
          <label htmlFor="sprint" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Sprint Name</label>
          <input 
            id="sprint" 
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="e.g., Sprint 4" 
            value={sprint} 
            onChange={(e) => setSprint(e.target.value)} 
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="goals" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Sprint Goals</label>
          <textarea 
            id="goals" 
            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Key objectives..." 
            value={sprintGoals} 
            onChange={(e) => setSprintGoals(e.target.value)} 
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="status" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Status</label>
          <select 
            value={activeSprintStatus} 
            onChange={(e) => setActiveSprintStatus(e.target.value)}
            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
              <option value="Planned">Planned</option>
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
          </select>
        </div>

        {/* Date Pickers */}
        <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Start Date</label>
                 <input 
                    type="date"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={sprintStartDate}
                    onChange={(e) => setSprintStartDate(e.target.value)}
                />
            </div>
            
             <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">End Date</label>
                <input 
                    type="date"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={sprintEndDate}
                    onChange={(e) => setSprintEndDate(e.target.value)}
                />
            </div>
        </div>

        <button 
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full"
            onClick={handleSubmit} 
            disabled={!sprint || !sprintStartDate || !sprintEndDate || !selectedTeamId || !selectedPageId}
        >
          Create Sprint
        </button>
      </div>
    </div>
  );
}
