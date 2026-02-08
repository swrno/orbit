import React, { useState } from 'react';

interface CreateRetroFormProps {
  teamId?: string;
  pageId?: string;
  sprint?: string;
  className?: string;
  onInsertText?: (text: string) => void;
}

export default function CreateRetroForm({ teamId, pageId, sprint: defaultSprint, className, onInsertText }: CreateRetroFormProps) {
  const [feedback, setFeedback] = useState('');
  const [type, setType] = useState('Discussion');
  const [sprint, setSprint] = useState(defaultSprint || '');
  const [repeating, setRepeating] = useState(false);

  const handleSubmit = () => {
    let prompt = `Create a retro item with feedback "${feedback}"`;
    prompt += `, type "${type}"`;
    if (sprint) prompt += `, sprint "${sprint}"`;
    if (repeating) prompt += `, repeating true`;
    
    if (teamId) prompt += `, teamId "${teamId}"`;
    if (pageId) prompt += `, pageId "${pageId}"`;

    if (onInsertText) {
      onInsertText(prompt);
    }
  };

  return (
    <div className={`w-full max-w-md border rounded-lg shadow-sm bg-card text-card-foreground p-4 ${className}`}>
      <h3 className="text-lg font-semibold mb-4">Capture Feedback</h3>
      <div className="space-y-4">
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
            <label htmlFor="type" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Type</label>
            <select 
              value={type} 
              onChange={(e) => setType(e.target.value)}
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
                <option value="Keep">Keep (Went well)</option>
                <option value="Improve">Improve (Needs work)</option>
                <option value="Discussion">Discussion (Topic)</option>
            </select>
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
            disabled={!feedback}
        >
          Add Feedback
        </button>
      </div>
    </div>
  );
}
