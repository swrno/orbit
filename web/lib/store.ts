import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type PageType = 'board' | 'table' | 'document';
export type TaskStatus = 'Todo' | 'In Progress' | 'Done' | 'Blocked';
export type TaskPriority = 'Low' | 'Medium' | 'High';

export type ColumnType = 'text' | 'number' | 'status' | 'owner' | 'priority' | 'epic' | 'date';

export type Column = {
  id: string;
  title: string;
  type: ColumnType;
  field: string;
  width: number;
};

export type Task = {
  id: string;
  title: string;
  status: TaskStatus;
  priority?: TaskPriority;
  owner?: string;
  epic?: string;
  estimatedPoints?: number;
  sprintId?: string; // 'backlog' or a specific sprint ID
  customValues?: Record<string, any>;
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
  plan: 'Free' | 'Pro';
  groups: Group[];
  tasks: Task[]; // Flat list of tasks for the workspace
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
  addTask: (workspaceId: string, task: Omit<Task, 'id'>) => void;
  updateTask: (workspaceId: string, taskId: string, updates: Partial<Task>) => void;
  deleteTask: (workspaceId: string, taskId: string) => void;

  // Update Actions
  renameGroup: (workspaceId: string, groupId: string, newTitle: string) => void;
  renamePage: (workspaceId: string, groupId: string, pageId: string, newTitle: string) => void;
  updateGroupIcon: (workspaceId: string, groupId: string, icon: string) => void;

  // Delete Actions
  deleteGroup: (workspaceId: string, groupId: string) => void;
  deletePage: (workspaceId: string, groupId: string, pageId: string) => void;
}

// Initial Mock Data
const INITIAL_WORKSPACES: Workspace[] = [
  {
    id: 'ws-1',
    title: 'ForgeAI',
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
    tasks: [
      { id: 't-1', title: 'Design new sidebar', status: 'In Progress', priority: 'High', owner: 'Swarnendu', sprintId: 'sprint-1', estimatedPoints: 3, epic: 'Infrastructure' },
      { id: 't-2', title: 'Fix auth redirect', status: 'Todo', priority: 'High', owner: 'Swarnendu', sprintId: 'sprint-1', estimatedPoints: 3, epic: 'Infrastructure' },
      { id: 't-3', title: 'Integrate OpenAI Stream', status: 'Done', priority: 'Medium', owner: 'Swarnendu', sprintId: 'backlog', estimatedPoints: 5, epic: 'AI Core' },
    ]
  },
  {
    id: 'ws-2',
    title: 'Personal',
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
    tasks: []
  }
];

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      workspaces: INITIAL_WORKSPACES,
      currentWorkspaceId: 'ws-1', // Default to first

      createWorkspace: (title) => set((state) => ({
        workspaces: [...state.workspaces, {
          id: `ws-${Date.now()}`,
          title,
          plan: 'Free',
          groups: [],
          tasks: []
        }]
      })),

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
        workspaces: state.workspaces.map(ws =>
          ws.id === workspaceId
            ? { ...ws, tasks: [...ws.tasks, { ...task, id: `t-${Date.now()}` }] }
            : ws
        )
      })),

      updateTask: (workspaceId, taskId, updates) => set((state) => ({
        workspaces: state.workspaces.map(ws =>
          ws.id === workspaceId
            ? {
                ...ws,
                tasks: ws.tasks.map(t => t.id === taskId ? { ...t, ...updates } : t)
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
    }
  )
);
