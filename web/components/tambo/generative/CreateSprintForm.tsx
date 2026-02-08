import React, { useState } from 'react';

interface CreateSprintFormProps {
  teamId?: string;
  pageId?: string;
  className?: string;
  onInsertText?: (text: string) => void;
}

export default function CreateSprintForm({ teamId, pageId, className, onInsertText }: CreateSprintFormProps) {
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
    
    if (teamId) prompt += `, teamId "${teamId}"`;
    if (pageId) prompt += `, pageId "${pageId}"`;

    if (onInsertText) {
       onInsertText(prompt);
    }
  };

  return (
    <div className={`w-full max-w-md border rounded-lg shadow-sm bg-card text-card-foreground p-4 ${className}`}>
      <h3 className="text-lg font-semibold mb-4">Create Sprint</h3>
      <div className="space-y-4">
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
             <div className="space-y-2 flex flex-col">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Start Date</label>
                 <input 
                    type="date"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={sprintStartDate}
                    onChange={(e) => setSprintStartDate(e.target.value)}
                />
            </div>
            
             <div className="space-y-2 flex flex-col">
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
            disabled={!sprint || !sprintStartDate || !sprintEndDate}
        >
          Create Sprint
        </button>
      </div>
    </div>
  );
}
