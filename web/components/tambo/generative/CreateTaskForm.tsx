import React, { useState } from 'react';

interface CreateTaskFormProps {
  teamId?: string;
  pageId?: string;
  sprint?: string; // Optional default sprint
  className?: string;
  onInsertText?: (text: string) => void;
}

export default function CreateTaskForm({ teamId, pageId, sprint: defaultSprint, className, onInsertText }: CreateTaskFormProps) {
  const [task, setTask] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('Feature');
  const [status, setStatus] = useState('Ready to start');
  const [sprint, setSprint] = useState(defaultSprint || '');
  const [estimatedSP, setEstimatedSP] = useState('');

  const handleSubmit = () => {
    let prompt = `Create a task with title "${task}"`;
    if (description) prompt += `, description "${description}"`;
    prompt += `, type "${type}", status "${status}"`;
    if (estimatedSP) prompt += `, estimatedSP ${estimatedSP}`;
    if (sprint) prompt += `, sprint "${sprint}"`;
    
    if (teamId) prompt += `, teamId "${teamId}"`;
    if (pageId) prompt += `, pageId "${pageId}"`;

    if (onInsertText) {
      onInsertText(prompt);
    }
  };

  return (
    <div className={`w-full max-w-md border rounded-lg shadow-sm bg-card text-card-foreground p-4 ${className}`}>
      <h3 className="text-lg font-semibold mb-4">Create Task</h3>
      <div className="space-y-4">
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

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="sprint" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Sprint (Optional)</label>
            <input 
              id="sprint" 
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="e.g., Sprint 1" 
              value={sprint} 
              onChange={(e) => setSprint(e.target.value)} 
            />
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

        <button 
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full"
            onClick={handleSubmit} 
            disabled={!task}
        >
          Create Task
        </button>
      </div>
    </div>
  );
}
