import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { useParams } from 'next/navigation';

interface CreateBugFormProps {
  teamId?: string;
  pageId?: string;
  className?: string;
  onInsertText?: (text: string) => void; 
}

export default function CreateBugForm({ teamId, pageId, className, onInsertText }: CreateBugFormProps) {
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
  // Filter pages to only showing "Bug" related pages
  const pages = selectedTeam?.pages.filter(p => p.title.toLowerCase().includes('bug')) || [];
  const members = workspace?.teamMembers || [];

  // Auto-select defaults when workspace changes
  React.useEffect(() => {
    if (workspace && !selectedTeamId) {
        const firstTeam = workspace.teams[0];
        if (firstTeam) {
            setSelectedTeamId(firstTeam.id);
            const bugPages = firstTeam.pages.filter(p => p.title.toLowerCase().includes('bug'));
            if (bugPages.length > 0) {
                setSelectedPageId(bugPages[0].id);
            }
        }
    }
  }, [workspace, selectedTeamId]);

  // Auto-select page when team changes
  React.useEffect(() => {
    if (selectedTeam && !selectedPageId) {
        const bugPages = selectedTeam.pages.filter(p => p.title.toLowerCase().includes('bug'));
        if (bugPages.length > 0) {
            setSelectedPageId(bugPages[0].id);
        }
    }
  }, [selectedTeam, selectedPageId]);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [status, setStatus] = useState('Awaiting Review');
  const [assignee, setAssignee] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [group, setGroup] = useState('Incoming Bugs');

  const handleSubmit = () => {
    // Construct the prompt for the AI
    let prompt = `Create a bug with title "${title}"`;
    if (description) prompt += `, description "${description}"`;
    prompt += `, priority "${priority}", status "${status}"`;
    if (assignee) {
        const selectedMember = members.find(m => m.id === assignee);
        if (selectedMember) prompt += `, assignee "${selectedMember.name}" (ID: ${assignee})`;
    }
    if (dueDate) prompt += `, dueDate "${dueDate}"`;
    if (group) prompt += `, group "${group}"`;
    
    if (selectedTeamId) prompt += `, teamId "${selectedTeamId}"`;
    if (selectedPageId) prompt += `, pageId "${selectedPageId}"`;
    if (selectedWorkspaceId) prompt += `, workspaceId "${selectedWorkspaceId}"`;
    
    console.log("CreateBugForm Prompt:", prompt); // Debug log

    if (onInsertText) {
      onInsertText(prompt);
    }
  };

  return (
    <div className={`w-full max-w-md border rounded-lg shadow-sm bg-card text-card-foreground p-4 ${className}`}>
        <h3 className="text-lg font-semibold mb-4">Create Bug Report</h3>
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
          <label htmlFor="title" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Bug Title</label>
          <input 
            id="title" 
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="e.g., Login button not working" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Description</label>
          <textarea 
            id="description" 
            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Describe the issue..." 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
          />
        </div>
        
        <div className="space-y-2">
            <label htmlFor="dueDate" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Due Date</label>
            <input 
                id="dueDate" 
                type="date"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
            />
        </div>

        <div className="space-y-2">
            <label htmlFor="assignee" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Assignee</label>
            <select 
                id="assignee"
                value={assignee} 
                onChange={(e) => setAssignee(e.target.value)}
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
                <option value="">Unassigned</option>
                {members.map(member => (
                    <option key={member.id} value={member.id}>{member.name}</option>
                ))}
            </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="priority" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Priority</label>
            <select 
              value={priority} 
              onChange={(e) => setPriority(e.target.value)}
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="status" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Status</label>
            <select 
              value={status} 
              onChange={(e) => setStatus(e.target.value)}
               className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
                <option value="Awaiting Review">Awaiting Review</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
            </select>
          </div>

          <div className="space-y-2">
             <label htmlFor="group" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Group</label>
            <select 
              value={group} 
              onChange={(e) => setGroup(e.target.value)}
               className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
                <option value="Incoming Bugs">Incoming Bugs</option>
                <option value="Development Work">Development Work</option>
                <option value="Resolved">Resolved</option>
            </select>
          </div>
        </div>

        <button 
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full"
            onClick={handleSubmit} 
            disabled={!title || !selectedTeamId || !selectedPageId}
        >
          Create Bug
        </button>
      </div>
    </div>
  );
}
