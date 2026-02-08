import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { useParams } from 'next/navigation';

interface CreateTaskFormProps {
  teamId?: string;
  pageId?: string;
  sprint?: string; // Optional default sprint
  className?: string;
  onInsertText?: (text: string) => void;
}

export default function CreateTaskForm({ teamId, pageId, sprint: defaultSprint, className, onInsertText }: CreateTaskFormProps) {
  const { workspaceId } = useParams();
  const { workspaces } = useAppStore();
  
  // State for selections
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState(workspaceId as string || '');
  const [selectedTeamId, setSelectedTeamId] = useState(teamId || '');
  const [selectedPageId, setSelectedPageId] = useState(pageId || '');

  // Derived data based on selections
  const workspace = workspaces.find(w => w.id === selectedWorkspaceId);
  const teams = workspace?.teams || [];
  const selectedTeam = teams.find(t => t.id === selectedTeamId);
  const pages = selectedTeam?.pages || [];
  const sprints = workspace?.sprints || [];
  const epics = workspace?.epics || [];
  const members = workspace?.teamMembers || [];

  // Auto-select defaults when workspace changes
  React.useEffect(() => {
    if (workspace && !selectedTeamId) {
        const firstTeam = workspace.teams[0];
        if (firstTeam) {
            setSelectedTeamId(firstTeam.id);
            // Try to find a "Tasks" page, otherwise first page
            const taskPage = firstTeam.pages.find(p => p.title.toLowerCase().includes('task')) || firstTeam.pages[0];
            if (taskPage) {
                setSelectedPageId(taskPage.id);
            }
        }
    }
  }, [workspace, selectedTeamId]);

  // Auto-select page when team changes
  React.useEffect(() => {
    if (selectedTeam && !selectedPageId) {
         // Try to find a "Tasks" page, otherwise first page
        const taskPage = selectedTeam.pages.find(p => p.title.toLowerCase().includes('task')) || selectedTeam.pages[0];
        if (taskPage) {
            setSelectedPageId(taskPage.id);
        }
    }
  }, [selectedTeam, selectedPageId]);

  const [task, setTask] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('Feature');
  const [status, setStatus] = useState('Ready to start');
  const [sprint, setSprint] = useState(defaultSprint || '');
  const [epic, setEpic] = useState('');
  const [assignee, setAssignee] = useState('');
  const [estimatedSP, setEstimatedSP] = useState('');
  const [githubLink, setGithubLink] = useState('');

  const handleSubmit = () => {
    let prompt = `Create a task with title "${task}"`;
    if (description) prompt += `, description "${description}"`;
    prompt += `, type "${type}", status "${status}"`;
    if (estimatedSP) prompt += `, estimatedSP ${estimatedSP}`;
    
    if (sprint) {
        const selectedSprint = sprints.find(s => s.id === sprint);
        if (selectedSprint) prompt += `, sprint "${selectedSprint.name}" (ID: ${sprint})`;
    }
    if (epic) {
        const selectedEpic = epics.find(e => e.id === epic);
        if (selectedEpic) prompt += `, epic "${selectedEpic.name}" (ID: ${epic})`;
    }
    if (assignee) {
        const selectedMember = members.find(m => m.id === assignee);
        if (selectedMember) prompt += `, assignee "${selectedMember.name}" (ID: ${assignee})`;
    }
    if (githubLink) prompt += `, githubLink "${githubLink}"`;
    
    if (selectedTeamId) prompt += `, teamId "${selectedTeamId}"`;
    if (selectedPageId) prompt += `, pageId "${selectedPageId}"`;
    if (selectedWorkspaceId) prompt += `, workspaceId "${selectedWorkspaceId}"`;

    if (onInsertText) {
      onInsertText(prompt);
    }
  };

  return (
    <div className={`w-full max-w-md border rounded-lg shadow-sm bg-card text-card-foreground p-4 ${className}`}>
      <h3 className="text-lg font-semibold mb-4">Create Task</h3>
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
          <label htmlFor="task" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Task Title</label>
          <input 
            id="task" 
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="e.g., Implement login flow" 
            value={task} 
            onChange={(e) => setTask(e.target.value)} 
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Description (Optional)</label>
          <textarea 
            id="description" 
            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Details about the task..." 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="type" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Type</label>
            <select 
              value={type} 
              onChange={(e) => setType(e.target.value)}
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
                <option value="Feature">Feature</option>
                <option value="Bug">Bug</option>
                <option value="Other">Other</option>
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="status" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Status</label>
            <select 
              value={status} 
              onChange={(e) => setStatus(e.target.value)}
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
                <option value="Ready to start">Ready to start</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
            </select>
          </div>
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
            <label htmlFor="sprint" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Sprint</label>
            <select 
              id="sprint" 
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={sprint} 
              onChange={(e) => setSprint(e.target.value)} 
            >
                <option value="">No Sprint</option>
                <option value="backlog">Backlog</option>
                {sprints.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="sp" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Estimated SP (Optional)</label>
            <input 
              id="sp" 
              type="number"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="e.g., 3" 
              value={estimatedSP} 
              onChange={(e) => setEstimatedSP(e.target.value)} 
            />
          </div>
        </div>

        <div className="space-y-2">
            <label htmlFor="epic" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Epic</label>
            <select 
              id="epic" 
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={epic} 
              onChange={(e) => setEpic(e.target.value)} 
            >
                <option value="">No Epic</option>
                {epics.map(e => (
                    <option key={e.id} value={e.id}>{e.name}</option>
                ))}
            </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="githubLink" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">GitHub Link</label>
          <input 
            id="githubLink" 
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="https://github.com/..." 
            value={githubLink} 
            onChange={(e) => setGithubLink(e.target.value)} 
          />
        </div>

        <button 
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full"
            onClick={handleSubmit} 
            disabled={!task || !selectedTeamId || !selectedPageId}
        >
          Create Task
        </button>
      </div>
    </div>
  );
}
