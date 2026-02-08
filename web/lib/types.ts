// Core data types for the workspace

export type PageType = 'table' | 'board' | 'gantt' | 'chart' | 'calendar' | 'roadmap' | 'list' | 'document';

// Access Control Types
export type WorkspaceRole = 'OWNER' | 'EDITOR' | 'VIEWER';
export type TeamRole = 'LEADER' | 'EDITOR' | 'VIEWER';

// Workspace Member (with access control)
export type WorkspaceMember = {
  id: string; // Firebase UID or user ID
  name: string;
  avatar?: string;
  email?: string;
  role: WorkspaceRole;
  addedAt?: Date | string;
};

// Team Member
export type TeamMember = {
  id: string;
  name: string;
  avatar?: string;
  email?: string;
  role?: string;
  teamRole?: TeamRole; // Team-specific role
};

// Bug Item
export type BugItem = {
  id: string;
  bug: string;
  description: string;
  dueDate?: Date;
  reporter: TeamMember;
  assignee?: TeamMember;
  timeUntilResolution?: string;
  status: 'Awaiting Review' | 'Pending Review' | 'Ready for Dev' | 'Done' | 'Fixed';
  priority: 'Critical' | 'High' | 'Low' | 'Medium';
  connectedTasks: string[]; // Task IDs
  bugId: string;
  group: 'Incoming Bugs' | 'Development Work' | 'Resolved';
  workspaceId: string;
  teamId: string;
  pageId: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
};

// Task Item
export type TaskItem = {
  id: string;
  task: string;
  owner: TeamMember;
  status: 'Ready to start' | 'In Progress' | 'Done';
  type: 'Bug' | 'Feature' | 'Other';
  taskId: string;
  estimatedSP: number;
  epic: string; // Epic ID
  githubLink?: string;
  sprint: string; // Sprint ID or group name
  group: string; // Sprint-based groups like 'Sprint 1', 'Backlog'
  workspaceId: string;
  teamId: string;
  pageId: string;
};

// Sprint Item
export type SprintItem = {
  id: string;
  sprint: string;
  sprintGoals: string;
  activeSprintStatus: 'Active' | 'Planned' | 'Completed';
  sprintTimeline: { start: Date; end: Date };
  connectedTasks: string[]; // Task IDs
  completed: boolean;
  sprintStartDate: Date;
  sprintEndDate: Date;
  workspaceId: string;
  teamId: string;
  pageId: string;
  owner: TeamMember;
};

// Epic Item
export type EpicItem = {
  id: string;
  epic: string;
  owner: TeamMember;
  phase: 'Dev WIP' | 'Product discovery' | 'Backlog' | 'Nice to Have' | 'Best Effort';
  priority: 'Must Have' | 'Critical' | 'Nice to Have';
  hierarchy?: number; // For nested structure
  children?: EpicItem[]; // Sub-epics
  workspaceId: string;
  teamId: string;
  pageId: string;
};

// Retrospective Item
export type RetrospectiveItem = {
  id: string;
  feedback: string;
  submitter: TeamMember;
  type: 'Discussion' | 'Improve' | 'Keep';
  repeating: boolean;
  vote: number;
  owner: TeamMember;
  sprint: string; // Sprint name/ID for grouping
  workspaceId: string;
  teamId: string;
  pageId: string;
};

// Column Definition
export type ColumnDefinition = {
  id: string;
  label: string;
  type: 'text' | 'person' | 'status' | 'date' | 'number' | 'priority' | 'timeline' | 'connect' | 'vote' | 'checkbox';
  width?: number;
  options?: string[]; // For status, priority dropdowns
  connectTo?: 'tasks' | 'epics' | 'bugs' | 'sprints'; // For relationship columns
  editable?: boolean;
};

// Page Schema
export type PageSchema = {
  pageType: 'bugs' | 'tasks' | 'sprints' | 'epics' | 'retrospectives' | 'document';
  columns: ColumnDefinition[];
  defaultGroups?: string[];
  allowedViews: PageType[];
};

// Page structure
export type Page = {
  id: string;
  title: string;
  type: PageType;
  icon?: string;
  columns?: ColumnDefinition[];
  content?: string; // HTML or JSON content for document pages
  views?: PageType[]; // Active views for this page (for multi-view tabs)
  activeViewIndex?: number; // Which view is currently active
  pageType?: 'bugs' | 'tasks' | 'sprints' | 'epics' | 'retrospectives' | 'document'; // Schema type
};

// Team (formerly Group)
export type Team = {
  id: string;
  title: string;
  icon?: string; // Icon name from lucide-react
  teams?: Team[]; // Nested sub-teams
  pages: Page[];
  members: TeamMember[]; // Members specific to this team
  leaderId?: string; // User ID of team leader who can manage team members

  // Data is stored in separate MongoDB collections and fetched via references
  // Use the following API endpoints to fetch:
  // - GET /api/bugs?teamId={teamId}
  // - GET /api/tasks?teamId={teamId}
  // - GET /api/epics?teamId={teamId}
  // - GET /api/sprints?teamId={teamId}
  // - GET /api/retrospectives?teamId={teamId}

  // For backward compatibility with client-side store:
  bugs?: BugItem[];
  tasks?: TaskItem[];
  epics?: EpicItem[];
  sprints?: SprintItem[];
  retrospectives?: RetrospectiveItem[];
};

// Workspace
export type Workspace = {
  id: string;
  title: string;
  name: string; // Display name for workspace
  color: string; // Color for workspace icon
  key: string; // Project key for task IDs, e.g., "PROJ"
  plan: string;
  teams: Team[];
  ownerId: string; // Firebase UID of the workspace owner (creator by default)
  members: WorkspaceMember[]; // Workspace members with access control

  // Data is stored in separate MongoDB collections and fetched via references
  // Use the following API endpoints to fetch:
  // - GET /api/bugs?workspaceId={workspaceId}&pageId={pageId}
  // - GET /api/tasks?workspaceId={workspaceId}&pageId={pageId}
  // - GET /api/epics?workspaceId={workspaceId}&pageId={pageId}
  // - GET /api/sprints?workspaceId={workspaceId}&pageId={pageId}
  // - GET /api/retrospectives?workspaceId={workspaceId}&pageId={pageId}

  // For backward compatibility with client-side store (optional):
  bugs?: Record<string, BugItem[]>; // pageId -> BugItem[]
  tasks?: Record<string, TaskItem[]>;
  sprints?: Record<string, SprintItem[]>;
  epics?: Record<string, EpicItem[]>;
  retrospectives?: Record<string, RetrospectiveItem[]>;

  // Shared resources (keeping for backward compatibility)
  teamMembers: TeamMember[];
};
