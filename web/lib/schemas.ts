import { PageSchema, PageType } from './types';

// Page schema configurations
export const PAGE_SCHEMAS: Record<string, PageSchema> = {
  'Bugs Queue': {
    pageType: 'bugs',
    columns: [
      { id: 'bug', label: 'Bug', type: 'text', width: 250, editable: true },
      { id: 'reporter', label: 'Reporter', type: 'person', width: 150 },
      { id: 'timeUntilResolution', label: 'Time until resolution', type: 'text', width: 150 },
      { id: 'status', label: 'Status', type: 'status', width: 150, 
        options: ['Awaiting Review', 'Pending Review', 'Ready for Dev', 'Done', 'Fixed'] },
      { id: 'priority', label: 'Priority', type: 'priority', width: 120,
        options: ['Critical', 'High', 'Medium', 'Low'] },
      { id: 'connectedTasks', label: 'Connected tasks', type: 'connect', connectTo: 'tasks', width: 150 },
      { id: 'bugId', label: 'Bug ID', type: 'text', width: 120, editable: false }
    ],
    defaultGroups: ['Incoming Bugs', 'Development Work', 'Resolved'],
    allowedViews: ['table', 'gantt', 'board', 'chart']
  },
  
  'Tasks': {
    pageType: 'tasks',
    columns: [
      { id: 'task', label: 'Task', type: 'text', width: 250, editable: true },
      { id: 'owner', label: 'Owner', type: 'person', width: 150 },
      { id: 'status', label: 'Status', type: 'status', width: 150,
        options: ['Ready to start', 'In Progress', 'Done'] },
      { id: 'type', label: 'Type', type: 'status', width: 100,
        options: ['Bug', 'Feature', 'Other'] },
      { id: 'taskId', label: 'Task ID', type: 'text', width: 120, editable: false },
      { id: 'estimatedSP', label: 'Estimated SP', type: 'number', width: 120 },
      { id: 'epic', label: 'Epic', type: 'connect', connectTo: 'epics', width: 150 },
      { id: 'githubLink', label: 'GitHub link', type: 'text', width: 150 }
    ],
    defaultGroups: ['Sprint 1', 'Backlog'],
    allowedViews: ['table', 'gantt', 'board', 'chart']
  },
  
  'Sprints': {
    pageType: 'sprints',
    columns: [
      { id: 'sprint', label: 'Sprint', type: 'text', width: 200, editable: true },
      { id: 'sprintGoals', label: 'Sprint goals', type: 'text', width: 300 },
      { id: 'activeSprintStatus', label: 'Active sprint status', type: 'status', width: 150,
        options: ['Active', 'Planned', 'Completed'] },
      { id: 'sprintTimeline', label: 'Sprint timeline', type: 'timeline', width: 200 },
      { id: 'connectedTasks', label: 'Connected tasks', type: 'connect', connectTo: 'tasks', width: 150 },
      { id: 'completed', label: 'Completed?', type: 'checkbox', width: 100 },
      { id: 'sprintStartDate', label: 'Sprint start date', type: 'date', width: 150 },
      { id: 'sprintEndDate', label: 'Sprint end date', type: 'date', width: 150 }
    ],
    defaultGroups: [],
    allowedViews: ['table', 'calendar', 'gantt']
  },
  
  'Epics': {
    pageType: 'epics',
    columns: [
      { id: 'epic', label: 'Epic', type: 'text', width: 300, editable: true },
      { id: 'owner', label: 'Owner', type: 'person', width: 150 },
      { id: 'phase', label: 'Phase', type: 'status', width: 150,
        options: ['Dev WIP', 'Product discovery', 'Backlog', 'Nice to Have', 'Best Effort'] },
      { id: 'priority', label: 'Priority', type: 'priority', width: 120,
        options: ['Must Have', 'Critical', 'Nice to Have'] }
    ],
    defaultGroups: ['Epics'],
    allowedViews: ['table', 'board', 'chart']
  },
  
  'Retrospectives': {
    pageType: 'retrospectives',
    columns: [
      { id: 'feedback', label: 'Feedback', type: 'text', width: 300, editable: true },
      { id: 'submitter', label: 'Submitter', type: 'person', width: 150 },
      { id: 'type', label: 'Type', type: 'status', width: 120,
        options: ['Discussion', 'Improve', 'Keep'] },
      { id: 'repeating', label: 'Repeating?', type: 'checkbox', width: 100 },
      { id: 'vote', label: 'Vote', type: 'vote', width: 100 },
      { id: 'owner', label: 'Owner', type: 'person', width: 150 }
    ],
    defaultGroups: ['Sprint 1'],
    allowedViews: ['table', 'board']
  }
};

// Helper to get schema for a page
export function getPageSchema(pageTitle: string): PageSchema | null {
  return PAGE_SCHEMAS[pageTitle] || null;
}

// Helper to get allowed views for a page
export function getAllowedViews(pageTitle: string): PageType[] {
  const schema = getPageSchema(pageTitle);
  return schema?.allowedViews || ['table'];
}
