import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type PageType = 'board' | 'table' | 'document';
export type TaskStatus = 'Todo' | 'In Progress' | 'In Review' | 'Done' | 'Blocked';
export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export type ColumnType = 'text' | 'number' | 'status' | 'owner' | 'priority' | 'epic' | 'date' | 'labels';

export type Column = {
  id: string;
  title: string;
  type: ColumnType;
  field: string;
  width: number;
};

export type Label = {
  id: string;
  name: string;
  color: string;
};

export type Comment = {
  id: string;
  author: string;
  content: string;
  createdAt: string;
};

export type Epic = {
  id: string;
  key: string; // e.g., "PROJ-E1"
  name: string;
  description?: string;
  color: string;
  status: 'To Do' | 'In Progress' | 'Done';
  startDate?: string;
  targetDate?: string;
  owner?: string;
  createdAt: string;
};

export type Subtask = {
  id: string;
  title: string;
  status: 'Todo' | 'Done';
  assignee?: string;
  createdAt: string;
};

export type TimeLog = {
  id: string;
  userId: string;
  userName: string;
  hours: number;
  description?: string;
  date: string;
  createdAt: string;
};

export type Activity = {
  id: string;
  taskId?: string;
  sprintId?: string;
  type: 'created' | 'updated' | 'status_changed' | 'assigned' | 'commented' | 'moved' | 'time_logged' | 'sprint_started' | 'sprint_completed';
  field?: string;
  oldValue?: string;
  newValue?: string;
  userId: string;
  userName: string;
  createdAt: string;
};

export type Task = {
  id: string;
  key: string; // e.g., "PROJ-123"
  title: string;
  description?: string;
  status: TaskStatus;
  priority?: TaskPriority;
  owner?: string;
  reporter?: string;
  epicId?: string;
  estimatedPoints?: number;
  originalEstimate?: number; // hours
  remainingEstimate?: number; // hours
  sprintId?: string; // 'backlog' or a specific sprint ID
  dueDate?: string;
  startDate?: string;
  labels?: string[];
  comments?: Comment[];
  subtasks?: Subtask[];
  timeLogs?: TimeLog[];
  blockedBy?: string[]; // Task IDs that block this task
  blocks?: string[]; // Task IDs that this task blocks
  watchers?: string[]; // User IDs watching this task
  attachments?: { id: string; name: string; url: string; size: number; uploadedAt: string }[];
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  order?: number;
  customValues?: Record<string, any>;
};

export type Sprint = {
  id: string;
  name: string;
  goal?: string;
  startDate: string;
  endDate: string;
  status: 'planning' | 'active' | 'completed';
  velocity?: number;
};

export type TeamMember = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
};

export type Page = {
  id: string;
  title: string;
  type: PageType;
  columns?: Column[];
  content?: string; // HTML or JSON content for the page
};

export type Group = {
  id: string;
  title: string;
  icon?: string; // Icon name from lucide-react
  groups?: Group[]; // Nested subgroups
  pages: Page[];
};

export type Workspace = {
  id: string;
  title: string;
  key: string; // Project key for task IDs, e.g., "PROJ"
  plan: 'Free' | 'Pro';
  groups: Group[];
  tasks: Task[]; // Flat list of tasks for the workspace
  sprints: Sprint[];
  epics: Epic[];
  labels: Label[];
  teamMembers: TeamMember[];
  activities: Activity[];
  taskCounter: number; // For generating task keys
  epicCounter: number; // For generating epic keys
};

interface AppState {
  workspaces: Workspace[];
  currentWorkspaceId: string | null;

  // Actions
  createWorkspace: (title: string) => void;
  selectWorkspace: (id: string) => void;
  addGroup: (workspaceId: string, title: string, icon?: string) => void;
  addPage: (workspaceId: string, groupId: string, title: string, type: PageType) => void;
  updatePage: (workspaceId: string, groupId: string, pageId: string, updates: Partial<Page>) => void;

  // Task Actions
  addTask: (workspaceId: string, task: Omit<Task, 'id' | 'key' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (workspaceId: string, taskId: string, updates: Partial<Task>) => void;
  deleteTask: (workspaceId: string, taskId: string) => void;
  moveTask: (workspaceId: string, taskId: string, newStatus: TaskStatus) => void;
  assignTaskToSprint: (workspaceId: string, taskId: string, sprintId: string) => void;

  // Subtask Actions
  addSubtask: (workspaceId: string, taskId: string, title: string) => void;
  updateSubtask: (workspaceId: string, taskId: string, subtaskId: string, updates: Partial<Subtask>) => void;
  deleteSubtask: (workspaceId: string, taskId: string, subtaskId: string) => void;

  // Time Log Actions
  logTime: (workspaceId: string, taskId: string, timeLog: Omit<TimeLog, 'id' | 'createdAt'>) => void;
  deleteTimeLog: (workspaceId: string, taskId: string, timeLogId: string) => void;

  // Dependency Actions
  addBlocker: (workspaceId: string, taskId: string, blockerTaskId: string) => void;
  removeBlocker: (workspaceId: string, taskId: string, blockerTaskId: string) => void;

  // Sprint Actions
  addSprint: (workspaceId: string, sprint: Omit<Sprint, 'id'>) => void;
  updateSprint: (workspaceId: string, sprintId: string, updates: Partial<Sprint>) => void;
  deleteSprint: (workspaceId: string, sprintId: string) => void;
  startSprint: (workspaceId: string, sprintId: string) => void;
  completeSprint: (workspaceId: string, sprintId: string) => void;

  // Epic Actions
  addEpic: (workspaceId: string, epic: Omit<Epic, 'id' | 'key' | 'createdAt'>) => void;
  updateEpic: (workspaceId: string, epicId: string, updates: Partial<Epic>) => void;
  deleteEpic: (workspaceId: string, epicId: string) => void;

  // Label Actions
  addLabel: (workspaceId: string, label: Omit<Label, 'id'>) => void;
  updateLabel: (workspaceId: string, labelId: string, updates: Partial<Label>) => void;
  deleteLabel: (workspaceId: string, labelId: string) => void;

  // Team Member Actions
  addTeamMember: (workspaceId: string, member: Omit<TeamMember, 'id'>) => void;
  updateTeamMember: (workspaceId: string, memberId: string, updates: Partial<TeamMember>) => void;
  removeTeamMember: (workspaceId: string, memberId: string) => void;

  // Comment Actions
  addComment: (workspaceId: string, taskId: string, comment: Omit<Comment, 'id' | 'createdAt'>) => void;

  // Activity Actions
  addActivity: (workspaceId: string, activity: Omit<Activity, 'id' | 'createdAt'>) => void;

  // Update Actions
  renameGroup: (workspaceId: string, groupId: string, newTitle: string) => void;
  renamePage: (workspaceId: string, groupId: string, pageId: string, newTitle: string) => void;
  updateGroupIcon: (workspaceId: string, groupId: string, icon: string) => void;

  // Delete Actions
  deleteGroup: (workspaceId: string, groupId: string) => void;
  deletePage: (workspaceId: string, groupId: string, pageId: string) => void;
}

// Default Labels
const DEFAULT_LABELS: Label[] = [
  { id: 'l-1', name: 'Bug', color: '#ef4444' },
  { id: 'l-2', name: 'Feature', color: '#3b82f6' },
  { id: 'l-3', name: 'Enhancement', color: '#8b5cf6' },
  { id: 'l-4', name: 'Documentation', color: '#06b6d4' },
  { id: 'l-5', name: 'Urgent', color: '#f97316' },
];

// Default Team Members
const DEFAULT_TEAM: TeamMember[] = [
  { id: 'tm-1', name: 'Swarnendu', email: 'swarnendu@forge.ai', role: 'admin', avatar: '' },
  { id: 'tm-2', name: 'Alex Chen', email: 'alex@forge.ai', role: 'member', avatar: '' },
  { id: 'tm-3', name: 'Sarah Miller', email: 'sarah@forge.ai', role: 'member', avatar: '' },
];

// Default Sprints
const DEFAULT_SPRINTS: Sprint[] = [
  {
    id: 'sprint-1',
    name: 'Sprint 1',
    goal: 'Complete core authentication and dashboard features',
    startDate: '2026-01-27',
    endDate: '2026-02-09',
    status: 'active',
    velocity: 21
  },
  {
    id: 'sprint-2',
    name: 'Sprint 2',
    goal: 'Implement AI integration and analytics',
    startDate: '2026-02-10',
    endDate: '2026-02-23',
    status: 'planning',
    velocity: 0
  },
];

// Initial Mock Data
const INITIAL_WORKSPACES: Workspace[] = [
  {
    id: 'ws-1',
    title: 'ForgeAI',
    key: 'FORGE',
    plan: 'Pro',
    groups: [
      {
        id: 'g-1',
        title: 'Engineering',
        pages: [
          { id: 'p-1', title: 'Sprint Board', type: 'board' },
          { id: 'p-2', title: 'Backlog', type: 'table' },
        ]
      },
      {
        id: 'g-2',
        title: 'Product',
        pages: [
          { id: 'p-3', title: 'Roadmap', type: 'board' },
          { id: 'p-4', title: 'Specs', type: 'document' },
        ]
      }
    ],
    sprints: DEFAULT_SPRINTS,
    labels: DEFAULT_LABELS,
    teamMembers: DEFAULT_TEAM,
    activities: [],
    taskCounter: 7,
    epicCounter: 4,
    epics: [
      { id: 'epic-1', key: 'FORGE-E1', name: 'Infrastructure', description: 'Core platform infrastructure', color: '#8b5cf6', status: 'In Progress', createdAt: '2026-01-20T00:00:00Z' },
      { id: 'epic-2', key: 'FORGE-E2', name: 'AI Core', description: 'AI and ML integration', color: '#3b82f6', status: 'In Progress', createdAt: '2026-01-20T00:00:00Z' },
      { id: 'epic-3', key: 'FORGE-E3', name: 'Analytics', description: 'Reporting and analytics features', color: '#10b981', status: 'To Do', createdAt: '2026-01-20T00:00:00Z' },
      { id: 'epic-4', key: 'FORGE-E4', name: 'UI/UX', description: 'User interface improvements', color: '#f59e0b', status: 'To Do', createdAt: '2026-01-20T00:00:00Z' },
    ],
    tasks: [
      {
        id: 't-1',
        key: 'FORGE-1',
        title: 'Design new sidebar navigation',
        description: 'Create a modern sidebar with collapsible groups and smooth transitions',
        status: 'In Progress',
        priority: 'High',
        owner: 'Swarnendu',
        reporter: 'Swarnendu',
        sprintId: 'sprint-1',
        estimatedPoints: 3,
        originalEstimate: 8,
        epicId: 'epic-1',
        labels: ['l-3'],
        dueDate: '2026-02-05',
        createdAt: '2026-01-28T10:00:00Z',
        updatedAt: '2026-02-01T14:30:00Z',
        order: 0,
        subtasks: [
          { id: 'st-1', title: 'Create sidebar component structure', status: 'Done', createdAt: '2026-01-28T10:00:00Z' },
          { id: 'st-2', title: 'Add collapsible group animations', status: 'Todo', createdAt: '2026-01-28T10:00:00Z' },
        ],
        timeLogs: [
          { id: 'tl-1', userId: 'tm-1', userName: 'Swarnendu', hours: 4, description: 'Initial implementation', date: '2026-02-01', createdAt: '2026-02-01T14:30:00Z' }
        ]
      },
      {
        id: 't-2',
        key: 'FORGE-2',
        title: 'Fix authentication redirect loop',
        description: 'Users are experiencing infinite redirects after login',
        status: 'Todo',
        priority: 'Critical',
        owner: 'Alex Chen',
        reporter: 'Sarah Miller',
        sprintId: 'sprint-1',
        estimatedPoints: 2,
        originalEstimate: 4,
        epicId: 'epic-1',
        labels: ['l-1', 'l-5'],
        dueDate: '2026-02-03',
        createdAt: '2026-01-29T09:00:00Z',
        updatedAt: '2026-01-29T09:00:00Z',
        order: 1
      },
      {
        id: 't-3',
        key: 'FORGE-3',
        title: 'Integrate OpenAI Stream API',
        description: 'Implement streaming responses for AI chat feature',
        status: 'Done',
        priority: 'High',
        owner: 'Swarnendu',
        reporter: 'Swarnendu',
        sprintId: 'sprint-1',
        estimatedPoints: 5,
        originalEstimate: 12,
        epicId: 'epic-2',
        labels: ['l-2'],
        createdAt: '2026-01-25T11:00:00Z',
        updatedAt: '2026-02-01T16:00:00Z',
        resolvedAt: '2026-02-01T16:00:00Z',
        order: 2,
        timeLogs: [
          { id: 'tl-2', userId: 'tm-1', userName: 'Swarnendu', hours: 10, description: 'Full implementation', date: '2026-02-01', createdAt: '2026-02-01T16:00:00Z' }
        ]
      },
      {
        id: 't-4',
        key: 'FORGE-4',
        title: 'Create analytics dashboard',
        description: 'Build comprehensive analytics with charts and metrics',
        status: 'In Review',
        priority: 'Medium',
        owner: 'Sarah Miller',
        reporter: 'Swarnendu',
        sprintId: 'sprint-1',
        estimatedPoints: 8,
        originalEstimate: 16,
        epicId: 'epic-3',
        labels: ['l-2'],
        dueDate: '2026-02-07',
        createdAt: '2026-01-26T08:00:00Z',
        updatedAt: '2026-02-02T10:00:00Z',
        order: 3
      },
      {
        id: 't-5',
        key: 'FORGE-5',
        title: 'Implement dark mode toggle',
        description: 'Add theme switching capability with system preference detection',
        status: 'Todo',
        priority: 'Low',
        owner: 'Alex Chen',
        reporter: 'Alex Chen',
        sprintId: 'backlog',
        estimatedPoints: 2,
        originalEstimate: 4,
        epicId: 'epic-4',
        labels: ['l-3'],
        createdAt: '2026-01-20T14:00:00Z',
        updatedAt: '2026-01-20T14:00:00Z',
        order: 4
      },
      {
        id: 't-6',
        key: 'FORGE-6',
        title: 'API rate limiting middleware',
        description: 'Implement rate limiting to prevent abuse',
        status: 'Todo',
        priority: 'Medium',
        owner: 'Swarnendu',
        reporter: 'Swarnendu',
        sprintId: 'backlog',
        estimatedPoints: 3,
        originalEstimate: 6,
        epicId: 'epic-1',
        labels: ['l-2'],
        createdAt: '2026-01-22T09:00:00Z',
        updatedAt: '2026-01-22T09:00:00Z',
        order: 5,
        blockedBy: ['t-2'] // Blocked by auth fix
      },
      {
        id: 't-7',
        key: 'FORGE-7',
        title: 'Write API documentation',
        description: 'Document all REST endpoints with examples',
        status: 'Blocked',
        priority: 'Medium',
        owner: 'Sarah Miller',
        reporter: 'Swarnendu',
        sprintId: 'sprint-1',
        estimatedPoints: 3,
        originalEstimate: 8,
        epicId: 'epic-1',
        labels: ['l-4'],
        createdAt: '2026-01-30T11:00:00Z',
        updatedAt: '2026-02-01T09:00:00Z',
        order: 6,
        blockedBy: ['t-6'],
        comments: [
          { id: 'c-1', author: 'Swarnendu', content: 'Waiting for API finalization', createdAt: '2026-02-01T09:00:00Z' }
        ]
      },
    ]
  },
  {
    id: 'ws-2',
    title: 'Personal',
    key: 'PERS',
    plan: 'Free',
    groups: [
      {
        id: 'g-3',
        title: 'Life',
        pages: [
          { id: 'p-5', title: 'Goals', type: 'document' },
        ]
      }
    ],
    sprints: [],
    epics: [],
    labels: DEFAULT_LABELS,
    teamMembers: [],
    activities: [],
    tasks: [],
    taskCounter: 0,
    epicCounter: 0
  }
];

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      workspaces: INITIAL_WORKSPACES,
      currentWorkspaceId: 'ws-1', // Default to first

      createWorkspace: (title) => set((state) => {
        // Generate a key from the title (uppercase, first 4 letters, no spaces)
        const key = title.toUpperCase().replace(/[^A-Z]/g, '').substring(0, 4) || 'PROJ';
        return {
          workspaces: [...state.workspaces, {
            id: `ws-${Date.now()}`,
            title,
            key,
            plan: 'Free',
            groups: [],
            tasks: [],
            sprints: [],
            epics: [],
            labels: DEFAULT_LABELS,
            teamMembers: [],
            activities: [],
            taskCounter: 0,
            epicCounter: 0
          }]
        };
      }),

      selectWorkspace: (id) => set({ currentWorkspaceId: id }),

      addGroup: (workspaceId, title, icon) => set((state) => ({
        workspaces: state.workspaces.map(ws =>
          ws.id === workspaceId
            ? { ...ws, groups: [...ws.groups, { id: `g-${Date.now()}`, title, icon, pages: [] }] }
            : ws
        )
      })),

      addPage: (workspaceId, groupId, title, type) => set((state) => ({
        workspaces: state.workspaces.map(ws =>
          ws.id === workspaceId
            ? {
              ...ws,
              groups: ws.groups.map(g =>
                g.id === groupId
                  ? { ...g, pages: [...g.pages, { id: `p-${Date.now()}`, title, type }] }
                  : g
              )
            }
            : ws
        )
      })),

      updatePage: (workspaceId, groupId, pageId, updates) => set((state) => ({
        workspaces: state.workspaces.map(ws =>
          ws.id === workspaceId
            ? {
              ...ws,
              groups: ws.groups.map(g =>
                g.id === groupId
                  ? {
                    ...g,
                    pages: g.pages.map(p =>
                      p.id === pageId ? { ...p, ...updates } : p
                    )
                  }
                  : g
              )
            }
            : ws
        )
      })),

      addTask: (workspaceId, task) => set((state) => ({
        workspaces: state.workspaces.map(ws => {
          if (ws.id !== workspaceId) return ws;
          const newCounter = ws.taskCounter + 1;
          return {
            ...ws,
            taskCounter: newCounter,
            tasks: [...ws.tasks, {
              ...task,
              id: `t-${Date.now()}`,
              key: `${ws.key}-${newCounter}`,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }]
          };
        })
      })),

      updateTask: (workspaceId, taskId, updates) => set((state) => ({
        workspaces: state.workspaces.map(ws =>
          ws.id === workspaceId
            ? {
              ...ws,
              tasks: ws.tasks.map(t => t.id === taskId ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t)
            }
            : ws
        )
      })),

      deleteTask: (workspaceId, taskId) => set((state) => ({
        workspaces: state.workspaces.map(ws =>
          ws.id === workspaceId
            ? {
              ...ws,
              tasks: ws.tasks.filter(t => t.id !== taskId)
            }
            : ws
        )
      })),

      moveTask: (workspaceId, taskId, newStatus) => set((state) => ({
        workspaces: state.workspaces.map(ws =>
          ws.id === workspaceId
            ? {
              ...ws,
              tasks: ws.tasks.map(t =>
                t.id === taskId
                  ? { ...t, status: newStatus, updatedAt: new Date().toISOString() }
                  : t
              )
            }
            : ws
        )
      })),

      assignTaskToSprint: (workspaceId, taskId, sprintId) => set((state) => ({
        workspaces: state.workspaces.map(ws =>
          ws.id === workspaceId
            ? {
              ...ws,
              tasks: ws.tasks.map(t =>
                t.id === taskId
                  ? { ...t, sprintId, updatedAt: new Date().toISOString() }
                  : t
              )
            }
            : ws
        )
      })),

      // Subtask Actions
      addSubtask: (workspaceId, taskId, title) => set((state) => ({
        workspaces: state.workspaces.map(ws =>
          ws.id === workspaceId
            ? {
              ...ws,
              tasks: ws.tasks.map(t =>
                t.id === taskId
                  ? {
                    ...t,
                    subtasks: [...(t.subtasks || []), {
                      id: `st-${Date.now()}`,
                      title,
                      status: 'Todo' as const,
                      createdAt: new Date().toISOString()
                    }],
                    updatedAt: new Date().toISOString()
                  }
                  : t
              )
            }
            : ws
        )
      })),

      updateSubtask: (workspaceId, taskId, subtaskId, updates) => set((state) => ({
        workspaces: state.workspaces.map(ws =>
          ws.id === workspaceId
            ? {
              ...ws,
              tasks: ws.tasks.map(t =>
                t.id === taskId
                  ? {
                    ...t,
                    subtasks: t.subtasks?.map(st =>
                      st.id === subtaskId ? { ...st, ...updates } : st
                    ),
                    updatedAt: new Date().toISOString()
                  }
                  : t
              )
            }
            : ws
        )
      })),

      deleteSubtask: (workspaceId, taskId, subtaskId) => set((state) => ({
        workspaces: state.workspaces.map(ws =>
          ws.id === workspaceId
            ? {
              ...ws,
              tasks: ws.tasks.map(t =>
                t.id === taskId
                  ? {
                    ...t,
                    subtasks: t.subtasks?.filter(st => st.id !== subtaskId),
                    updatedAt: new Date().toISOString()
                  }
                  : t
              )
            }
            : ws
        )
      })),

      // Time Log Actions
      logTime: (workspaceId, taskId, timeLog) => set((state) => ({
        workspaces: state.workspaces.map(ws =>
          ws.id === workspaceId
            ? {
              ...ws,
              tasks: ws.tasks.map(t =>
                t.id === taskId
                  ? {
                    ...t,
                    timeLogs: [...(t.timeLogs || []), {
                      ...timeLog,
                      id: `tl-${Date.now()}`,
                      createdAt: new Date().toISOString()
                    }],
                    updatedAt: new Date().toISOString()
                  }
                  : t
              )
            }
            : ws
        )
      })),

      deleteTimeLog: (workspaceId, taskId, timeLogId) => set((state) => ({
        workspaces: state.workspaces.map(ws =>
          ws.id === workspaceId
            ? {
              ...ws,
              tasks: ws.tasks.map(t =>
                t.id === taskId
                  ? {
                    ...t,
                    timeLogs: t.timeLogs?.filter(tl => tl.id !== timeLogId),
                    updatedAt: new Date().toISOString()
                  }
                  : t
              )
            }
            : ws
        )
      })),

      // Dependency Actions
      addBlocker: (workspaceId, taskId, blockerTaskId) => set((state) => ({
        workspaces: state.workspaces.map(ws =>
          ws.id === workspaceId
            ? {
              ...ws,
              tasks: ws.tasks.map(t => {
                if (t.id === taskId) {
                  return {
                    ...t,
                    blockedBy: [...(t.blockedBy || []), blockerTaskId],
                    updatedAt: new Date().toISOString()
                  };
                }
                if (t.id === blockerTaskId) {
                  return {
                    ...t,
                    blocks: [...(t.blocks || []), taskId],
                    updatedAt: new Date().toISOString()
                  };
                }
                return t;
              })
            }
            : ws
        )
      })),

      removeBlocker: (workspaceId, taskId, blockerTaskId) => set((state) => ({
        workspaces: state.workspaces.map(ws =>
          ws.id === workspaceId
            ? {
              ...ws,
              tasks: ws.tasks.map(t => {
                if (t.id === taskId) {
                  return {
                    ...t,
                    blockedBy: t.blockedBy?.filter(id => id !== blockerTaskId),
                    updatedAt: new Date().toISOString()
                  };
                }
                if (t.id === blockerTaskId) {
                  return {
                    ...t,
                    blocks: t.blocks?.filter(id => id !== taskId),
                    updatedAt: new Date().toISOString()
                  };
                }
                return t;
              })
            }
            : ws
        )
      })),

      // Sprint Actions
      addSprint: (workspaceId, sprint) => set((state) => ({
        workspaces: state.workspaces.map(ws =>
          ws.id === workspaceId
            ? { ...ws, sprints: [...ws.sprints, { ...sprint, id: `sprint-${Date.now()}` }] }
            : ws
        )
      })),

      updateSprint: (workspaceId, sprintId, updates) => set((state) => ({
        workspaces: state.workspaces.map(ws =>
          ws.id === workspaceId
            ? {
              ...ws,
              sprints: ws.sprints.map(s => s.id === sprintId ? { ...s, ...updates } : s)
            }
            : ws
        )
      })),

      deleteSprint: (workspaceId, sprintId) => set((state) => ({
        workspaces: state.workspaces.map(ws =>
          ws.id === workspaceId
            ? {
              ...ws,
              sprints: ws.sprints.filter(s => s.id !== sprintId),
              // Move tasks from deleted sprint to backlog
              tasks: ws.tasks.map(t => t.sprintId === sprintId ? { ...t, sprintId: 'backlog' } : t)
            }
            : ws
        )
      })),

      startSprint: (workspaceId, sprintId) => set((state) => ({
        workspaces: state.workspaces.map(ws =>
          ws.id === workspaceId
            ? {
              ...ws,
              sprints: ws.sprints.map(s =>
                s.id === sprintId
                  ? { ...s, status: 'active' as const }
                  : s.status === 'active'
                    ? { ...s, status: 'completed' as const }
                    : s
              )
            }
            : ws
        )
      })),

      completeSprint: (workspaceId, sprintId) => set((state) => {
        const workspace = state.workspaces.find(ws => ws.id === workspaceId);
        if (!workspace) return state;

        const sprintTasks = workspace.tasks.filter(t => t.sprintId === sprintId);
        const completedPoints = sprintTasks
          .filter(t => t.status === 'Done')
          .reduce((sum, t) => sum + (t.estimatedPoints || 0), 0);

        return {
          workspaces: state.workspaces.map(ws =>
            ws.id === workspaceId
              ? {
                ...ws,
                sprints: ws.sprints.map(s =>
                  s.id === sprintId
                    ? { ...s, status: 'completed' as const, velocity: completedPoints }
                    : s
                ),
                // Move incomplete tasks to backlog
                tasks: ws.tasks.map(t =>
                  t.sprintId === sprintId && t.status !== 'Done'
                    ? { ...t, sprintId: 'backlog' }
                    : t
                )
              }
              : ws
          )
        };
      }),

      // Label Actions
      addLabel: (workspaceId, label) => set((state) => ({
        workspaces: state.workspaces.map(ws =>
          ws.id === workspaceId
            ? { ...ws, labels: [...ws.labels, { ...label, id: `l-${Date.now()}` }] }
            : ws
        )
      })),

      updateLabel: (workspaceId, labelId, updates) => set((state) => ({
        workspaces: state.workspaces.map(ws =>
          ws.id === workspaceId
            ? {
              ...ws,
              labels: ws.labels.map(l => l.id === labelId ? { ...l, ...updates } : l)
            }
            : ws
        )
      })),

      deleteLabel: (workspaceId, labelId) => set((state) => ({
        workspaces: state.workspaces.map(ws =>
          ws.id === workspaceId
            ? {
              ...ws,
              labels: ws.labels.filter(l => l.id !== labelId),
              tasks: ws.tasks.map(t => ({
                ...t,
                labels: t.labels?.filter(lid => lid !== labelId)
              }))
            }
            : ws
        )
      })),

      // Team Member Actions
      addTeamMember: (workspaceId, member) => set((state) => ({
        workspaces: state.workspaces.map(ws =>
          ws.id === workspaceId
            ? { ...ws, teamMembers: [...ws.teamMembers, { ...member, id: `tm-${Date.now()}` }] }
            : ws
        )
      })),

      updateTeamMember: (workspaceId, memberId, updates) => set((state) => ({
        workspaces: state.workspaces.map(ws =>
          ws.id === workspaceId
            ? {
              ...ws,
              teamMembers: ws.teamMembers.map(m => m.id === memberId ? { ...m, ...updates } : m)
            }
            : ws
        )
      })),

      removeTeamMember: (workspaceId, memberId) => set((state) => ({
        workspaces: state.workspaces.map(ws =>
          ws.id === workspaceId
            ? {
              ...ws,
              teamMembers: ws.teamMembers.filter(m => m.id !== memberId)
            }
            : ws
        )
      })),

      // Comment Actions
      addComment: (workspaceId, taskId, comment) => set((state) => ({
        workspaces: state.workspaces.map(ws =>
          ws.id === workspaceId
            ? {
              ...ws,
              tasks: ws.tasks.map(t =>
                t.id === taskId
                  ? {
                    ...t,
                    comments: [...(t.comments || []), {
                      ...comment,
                      id: `c-${Date.now()}`,
                      createdAt: new Date().toISOString()
                    }],
                    updatedAt: new Date().toISOString()
                  }
                  : t
              )
            }
            : ws
        )
      })),

      // Epic Actions
      addEpic: (workspaceId, epic) => set((state) => ({
        workspaces: state.workspaces.map(ws => {
          if (ws.id !== workspaceId) return ws;
          const newCounter = ws.epicCounter + 1;
          return {
            ...ws,
            epicCounter: newCounter,
            epics: [...ws.epics, {
              ...epic,
              id: `epic-${Date.now()}`,
              key: `${ws.key}-E${newCounter}`,
              createdAt: new Date().toISOString()
            }]
          };
        })
      })),

      updateEpic: (workspaceId, epicId, updates) => set((state) => ({
        workspaces: state.workspaces.map(ws =>
          ws.id === workspaceId
            ? {
              ...ws,
              epics: ws.epics.map(e => e.id === epicId ? { ...e, ...updates } : e)
            }
            : ws
        )
      })),

      deleteEpic: (workspaceId, epicId) => set((state) => ({
        workspaces: state.workspaces.map(ws =>
          ws.id === workspaceId
            ? {
              ...ws,
              epics: ws.epics.filter(e => e.id !== epicId),
              // Remove epic reference from tasks
              tasks: ws.tasks.map(t => t.epicId === epicId ? { ...t, epicId: undefined } : t)
            }
            : ws
        )
      })),

      // Activity Actions
      addActivity: (workspaceId, activity) => set((state) => ({
        workspaces: state.workspaces.map(ws =>
          ws.id === workspaceId
            ? {
              ...ws,
              activities: [...ws.activities, {
                ...activity,
                id: `act-${Date.now()}`,
                createdAt: new Date().toISOString()
              }]
            }
            : ws
        )
      })),

      renameGroup: (workspaceId, groupId, newTitle) => set((state) => ({
        workspaces: state.workspaces.map(ws =>
          ws.id === workspaceId
            ? {
              ...ws,
              groups: ws.groups.map(g =>
                g.id === groupId ? { ...g, title: newTitle } : g
              )
            }
            : ws
        )
      })),

      renamePage: (workspaceId, groupId, pageId, newTitle) => set((state) => ({
        workspaces: state.workspaces.map(ws =>
          ws.id === workspaceId
            ? {
              ...ws,
              groups: ws.groups.map(g =>
                g.id === groupId
                  ? {
                    ...g,
                    pages: g.pages.map(p =>
                      p.id === pageId ? { ...p, title: newTitle } : p
                    )
                  }
                  : g
              )
            }
            : ws
        )
      })),

      updateGroupIcon: (workspaceId, groupId, icon) => set((state) => ({
        workspaces: state.workspaces.map(ws =>
          ws.id === workspaceId
            ? {
              ...ws,
              groups: ws.groups.map(g =>
                g.id === groupId ? { ...g, icon } : g
              )
            }
            : ws
        )
      })),

      deleteGroup: (workspaceId, groupId) => set((state) => ({
        workspaces: state.workspaces.map(ws =>
          ws.id === workspaceId
            ? {
              ...ws,
              groups: ws.groups.filter(g => g.id !== groupId)
            }
            : ws
        )
      })),

      deletePage: (workspaceId, groupId, pageId) => set((state) => ({
        workspaces: state.workspaces.map(ws =>
          ws.id === workspaceId
            ? {
              ...ws,
              groups: ws.groups.map(g =>
                g.id === groupId
                  ? { ...g, pages: g.pages.filter(p => p.id !== pageId) }
                  : g
              )
            }
            : ws
        )
      })),
    }),
    {
      name: 'forge-ai-storage',
      merge: (persistedState: any, currentState: AppState) => {
        // Quick merge - only transform when absolutely necessary
        if (!persistedState?.workspaces) {
          return currentState;
        }

        const mergedState = {
          ...currentState,
          ...persistedState,
        };

        // Only process workspaces that need migration (missing keys/counters)
        mergedState.workspaces = mergedState.workspaces.map((ws: any) => {
          // Fast path: if workspace already has all required fields, return as-is
          const needsMigration = !ws.key || ws.taskCounter === undefined || ws.epicCounter === undefined;
          const needsArrays = !ws.sprints || !ws.epics || !ws.labels || !ws.teamMembers || !ws.activities;

          if (!needsMigration && !needsArrays) {
            return ws; // No transformation needed
          }

          // Only compute expensive operations if truly needed
          const key = ws.key || ws.title?.toUpperCase().replace(/[^A-Z]/g, '').substring(0, 4) || 'PROJ';
          const taskCounter = ws.taskCounter ?? (ws.tasks?.length || 0);
          const epicCounter = ws.epicCounter ?? (ws.epics?.length || 0);

          return {
            ...ws,
            key,
            taskCounter,
            epicCounter,
            sprints: ws.sprints || [],
            epics: ws.epics || [],
            labels: ws.labels || [],
            teamMembers: ws.teamMembers || [],
            activities: ws.activities || [],
            // Only process tasks if they're missing keys
            tasks: ws.tasks?.some((t: any) => !t.key)
              ? ws.tasks.map((t: any, idx: number) => ({
                ...t,
                key: t.key || `${key}-${idx + 1}`
              }))
              : (ws.tasks || [])
          };
        });

        return mergedState;
      },
    }
  )
);
