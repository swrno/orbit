import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useAppStore } from '@/lib/store';

interface CreateEpicFormProps {
  teamId?: string;
  pageId?: string;
  className?: string;
  onInsertText?: (text: string) => void;
}

export default function CreateEpicForm({ teamId, pageId, className, onInsertText }: CreateEpicFormProps) {
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

  const [epic, setEpic] = useState('');
  const [description, setDescription] = useState('');
  const [phase, setPhase] = useState('Backlog');
  const [priority, setPriority] = useState('Nice to Have');
  const [hierarchy, setHierarchy] = useState(0);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleSubmit = () => {
    let prompt = `Create an epic with title "${epic}"`;
    if (description) prompt += `, description "${description}"`;
    prompt += `, phase "${phase}", priority "${priority}", hierarchy ${hierarchy}`;
    
    if (startDate) prompt += `, startDate "${new Date(startDate).toISOString()}"`;
    if (endDate) prompt += `, endDate "${new Date(endDate).toISOString()}"`;
    
    if (selectedTeamId) prompt += `, teamId "${selectedTeamId}"`;
    if (selectedPageId) prompt += `, pageId "${selectedPageId}"`;
    if (selectedWorkspaceId) prompt += `, workspaceId "${selectedWorkspaceId}"`;

    if (onInsertText) {
      onInsertText(prompt);
    }
  };

  return (
    <div className={`w-full max-w-md border rounded-lg shadow-sm bg-card text-card-foreground p-4 ${className}`}>
      <h3 className="text-lg font-semibold mb-4">Create Epic</h3>
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
          <label htmlFor="epic" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Epic Title</label>
          <input 
            id="epic" 
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="e.g., Q3 Analytics Revamp" 
            value={epic} 
            onChange={(e) => setEpic(e.target.value)} 
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Description</label>
          <textarea 
            id="description" 
            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="High-level goals..." 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
          />
        </div>

        <div className="space-y-2">
           <div className="flex gap-4">
              <div className="flex-1 space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Start Date</label>
                 <input 
                    type="date"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                />
            </div>
            
             <div className="flex-1 space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Due Date</label>
                <input 
                    type="date"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                />
            </div>
            </div>
        </div>

        <div className="space-y-2">
            <label htmlFor="phase" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Phase</label>
             <select 
              value={phase} 
              onChange={(e) => setPhase(e.target.value)}
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
                <option value="Product discovery">Product discovery</option>
                <option value="Backlog">Backlog</option>
                <option value="Dev WIP">Dev WIP</option>
                <option value="Nice to Have">Nice to Have</option>
                <option value="Best Effort">Best Effort</option>
            </select>
        </div>

        <div className="space-y-2">
            <label htmlFor="priority" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Priority</label>
            <select 
              value={priority} 
              onChange={(e) => setPriority(e.target.value)}
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
                <option value="Must Have">Must Have</option>
                <option value="Critical">Critical</option>
                <option value="Nice to Have">Nice to Have</option>
            </select>
        </div>

         <div className="space-y-2">
            <label htmlFor="hierarchy" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Hierarchy Level</label>
            <select 
              value={hierarchy} 
              onChange={(e) => setHierarchy(parseInt(e.target.value))}
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
                <option value={0}>Top Level (0)</option>
                <option value={1}>Sub-epic (1)</option>
                <option value={2}>Sub-sub-epic (2)</option>
            </select>
             <p className="text-[0.8rem] text-muted-foreground">0 = Top level, 1 = Sub-epic, 2 = Sub-sub-epic</p>
        </div>

        <button 
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full"
            onClick={handleSubmit} 
            disabled={!epic || !selectedTeamId || !selectedPageId}
        >
          Create Epic
        </button>
      </div>
    </div>
  );
}
