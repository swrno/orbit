import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient } from './api-client';

export type PageType = 'board' | 'table' | 'document' | 'gantt' | 'roadmap' | 'calendar' | 'chart' | 'list' | 'team-access';
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
  icon?: string;
  columns?: Column[];
  content?: string; // HTML or JSON content for the page
  views?: PageType[]; // Active views for this page (for multi-view tabs)
  activeViewIndex?: number; // Which view is currently active
};

export type Team = {
  id: string;
  title: string;
  icon?: string; // Icon name from lucide-react
  teams?: Team[]; // Nested sub-teams
  pages: Page[];
};

export type Workspace = {
  id: string;
  title: string;
  name: string; // Display name for workspace
  color?: string; // Color for workspace icon
  key: string; // Project key for task IDs, e.g., "PROJ"
  plan: 'Free' | 'Pro';
  teams: Team[];
  
  // Client-side cache of data (fetched from separate collections via references)
  tasks: Task[]; // Flat list of tasks for the workspace
  sprints: Sprint[];
  epics: Epic[];
  labels: Label[];
  teamMembers: TeamMember[];
  activities: Activity[];
  taskCounter: number; // For generating task keys
  epicCounter: number; // For generating epic keys
  
  // Access Control Fields
  ownerId?: string; // Firebase UID of the workspace owner
  members?: Array<{
    id: string;
    name: string;
    email?: string;
    avatar?: string;
    role: 'OWNER' | 'EDITOR' | 'VIEWER';
    addedAt?: Date | string;
  }>;
};

interface AppState {
  workspaces: Workspace[];
  currentWorkspaceId: string | null;

  // Actions
  fetchWorkspaces: (userId?: string, userEmail?: string | null) => Promise<void>;
  setWorkspaces: (workspaces: Workspace[]) => void;
  addWorkspace: (workspace: Workspace) => void;
  createWorkspace: (title: string, id?: string, creatorId?: string, creatorEmail?: string, creatorName?: string) => Promise<Workspace | null>;
  updateWorkspace: (id: string, updates: Partial<Workspace>) => void;
  deleteWorkspace: (id: string, userId: string) => void;
  selectWorkspace: (id: string) => void;
  addTeam: (workspaceId: string, title: string, icon?: string, leaderId?: string, leaderEmail?: string, leaderName?: string) => Promise<void>;
  addPage: (workspaceId: string, teamId: string, title: string, type: PageType) => Promise<string>;
  updatePage: (workspaceId: string, teamId: string, pageId: string, updates: Partial<Page>, userId?: string, userEmail?: string | null) => Promise<void>;

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
  renameTeam: (workspaceId: string, teamId: string, newTitle: string) => Promise<void>;
  renamePage: (workspaceId: string, teamId: string, pageId: string, newTitle: string) => Promise<void>;
  updateTeamIcon: (workspaceId: string, teamId: string, icon: string) => void;

  // Delete Actions
  deleteTeam: (workspaceId: string, teamId: string, userId: string) => Promise<void>;
  deletePage: (workspaceId: string, teamId: string, pageId: string, userId?: string) => Promise<void>;
  reorderPage: (workspaceId: string, teamId: string, startIndex: number, endIndex: number) => void;
}

// Default Labels
const DEFAULT_LABELS: Label[] = [];

// Default Team Members
const DEFAULT_TEAM_MEMBERS: TeamMember[] = [];

// Default Sprints
const DEFAULT_SPRINTS: Sprint[] = [];

// Initial Mock Data - Empty workspaces
const INITIAL_WORKSPACES: Workspace[] = [];

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      workspaces: INITIAL_WORKSPACES,
      currentWorkspaceId: null, // No default workspace

      fetchWorkspaces: async (userId, userEmail) => {
        try {
          console.log(`Store: fetching workspaces for ${userId}`);
          const data = await apiClient.fetchWorkspaces(userId, userEmail);
          
          if (data.success && Array.isArray(data.data)) {
            console.log("Store: workspaces fetched", data.data);
            set({ workspaces: data.data });
          } else {
            console.warn("Store: fetched data is not success or not array", data);
          }
        } catch (error) {
          console.error('Failed to fetch workspaces:', error);
        }
      },

      setWorkspaces: (workspaces) => set({ workspaces }),
      addWorkspace: (workspace) => set((state) => ({ workspaces: [...state.workspaces, workspace] })),

      createWorkspace: async (title, id, creatorId, creatorEmail, creatorName) => {
        try {
          const workspaceId = id || `ws-${Date.now()}`;
          console.log('Creating workspace:', { title, workspaceId, creatorId });
          
          const data = await apiClient.createWorkspace({ 
            title, 
            id: workspaceId,
            creatorId,
            creatorEmail,
            creatorName
          }, creatorId, creatorEmail);

          console.log('Workspace creation response:', data);

          if (data.success && data.data) {
            set((state) => ({
              workspaces: [...state.workspaces, data.data]
            }));
            return data.data;
          } else {
            console.error('Failed to create workspace:', data.error);
            alert('Failed to create workspace: ' + (data.error || 'Unknown error'));
            return null;
          }
        } catch (error) {
          console.error('Error creating workspace:', error);
          alert('Error creating workspace. Please try again.');
          return null;
        }
      },

      updateWorkspace: (id, updates) => set((state) => ({
        workspaces: state.workspaces.map(ws =>
          ws.id === id ? { ...ws, ...updates } : ws
        )
      })),

      deleteWorkspace: async (id, userId) => {
        try {
          console.log('Deleting workspace:', id);
          const data = await apiClient.deleteWorkspace(id, userId);

          if (data.success) {
             set((state) => ({
              workspaces: state.workspaces.filter(ws => ws.id !== id),
              currentWorkspaceId: state.currentWorkspaceId === id
                ? (state.workspaces.find(ws => ws.id !== id)?.id || null)
                : state.currentWorkspaceId
            }));
          } else {
             console.error('Failed to delete workspace:', data.error);
             alert(`Failed to delete workspace: ${data.error}`);
          }
        } catch (error) {
          console.error('Error deleting workspace:', error);
          alert('Error deleting workspace. Please try again.');
        }
      },

      selectWorkspace: (id) => set({ currentWorkspaceId: id }),

      addTeam: async (workspaceId, title, icon, leaderId, leaderEmail, leaderName) => {
        try {
          console.log('Adding team:', { workspaceId, title, leaderId });
          const data = await apiClient.addTeam({ 
            workspaceId, 
            title, 
            icon,
            leaderId,
            leaderEmail,
            leaderName,
            currentUserId: leaderId
          }, leaderId);

          console.log('Add team response:', data);

          if (data.success && data.data) {
            set((state) => ({
              workspaces: state.workspaces.map(ws =>
                ws.id === workspaceId ? data.data : ws
              )
            }));
            return data.data;
          } else {
            console.error('Failed to add team:', data.error);
            alert(`Failed to add team: ${data.error}`);
          }
        } catch (error) {
          console.error('Failed to add team:', error);
          alert('Error adding team. Please try again.');
        }
      },

      addPage: async (workspaceId, teamId, title, type) => {
        const newId = `p-${Date.now()}`;
        // Optimistic update
        set((state) => ({
          workspaces: state.workspaces.map(ws =>
            ws.id === workspaceId
              ? {
                ...ws,
                teams: ws.teams.map(g =>
                  g.id === teamId
                    ? { ...g, pages: [...g.pages, { id: newId, title, type }] }
                    : g
                )
              }
              : ws
          )
        }));

        try {
          const data = await apiClient.addPage(workspaceId, teamId, title, type);
          if (data.success && data.data) {
             // Replace temp ID with real ID from backend
             set((state) => ({
                workspaces: state.workspaces.map(ws =>
                  ws.id === workspaceId
                    ? {
                      ...ws,
                      teams: ws.teams.map(g =>
                        g.id === teamId
                          ? { ...g, pages: g.pages.map(p => p.id === newId ? data.data : p) }
                          : g
                      )
                    }
                    : ws
                )
             }));
             return data.data.id;
          }
        } catch (err) {
            console.error('Error persisting page creation:', err);
        }
        
        return newId;
      },

      updatePage: async (workspaceId, teamId, pageId, updates, userId, userEmail) => {
        // Optimistic update
        set((state) => ({
          workspaces: state.workspaces.map(ws =>
            ws.id === workspaceId
              ? {
                ...ws,
                teams: ws.teams.map(g =>
                  g.id === teamId
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
        }));

        try {
          const data = await apiClient.updatePage(workspaceId, teamId, pageId, updates, userId, userEmail);
          if (!data.success) {
              console.error('Failed to persist page update:', data.error);
          }
        } catch (err) {
            console.error('Error persisting page update:', err);
        }
      },

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

      // Update Actions
      renameTeam: async (workspaceId, teamId, newTitle) => {
        set((state) => ({
          workspaces: state.workspaces.map(ws =>
            ws.id === workspaceId
              ? {
                ...ws,
                teams: ws.teams.map(t =>
                  t.id === teamId ? { ...t, title: newTitle } : t
                )
              }
              : ws
          )
        }));

        try {
          const data = await apiClient.renameTeam(workspaceId, teamId, newTitle);
          if (!data.success) {
            console.error('Failed to rename team:', data.error);
          }
        } catch (error) {
          console.error('Error renaming team:', error);
        }
      },

      renamePage: async (workspaceId, teamId, pageId, newTitle) => {
        set((state) => ({
          workspaces: state.workspaces.map(ws =>
            ws.id === workspaceId
              ? {
                ...ws,
                teams: ws.teams.map(t =>
                  t.id === teamId
                    ? {
                      ...t,
                      pages: t.pages.map(p =>
                        p.id === pageId ? { ...p, title: newTitle } : p
                      )
                    }
                    : t
                )
              }
              : ws
          )
        }));

        try {
          const data = await apiClient.updatePage(workspaceId, teamId, pageId, { title: newTitle });
          if (!data.success) {
             console.error('Failed to rename page:', data.error);
          }
        } catch (error) {
           console.error('Error renaming page:', error);
        }
      },

      updateTeamIcon: (workspaceId, teamId, icon) => set((state) => ({
        workspaces: state.workspaces.map(ws =>
          ws.id === workspaceId
            ? {
              ...ws,
              teams: ws.teams.map(t =>
                t.id === teamId ? { ...t, icon } : t
              )
            }
            : ws
        )
      })),

      // Delete Actions
      deleteTeam: async (workspaceId, teamId, userId) => {
        try {
          const data = await apiClient.deleteTeam(workspaceId, teamId, userId);

          if (data.success) {
            set((state) => ({
              workspaces: state.workspaces.map(ws =>
                ws.id === workspaceId
                  ? {
                    ...ws,
                    teams: ws.teams.filter(t => t.id !== teamId)
                  }
                  : ws
              )
            }));
          } else {
            console.error('Failed to delete team:', data.error);
            alert(`Failed to delete team: ${data.error}`);
          }
        } catch (error) {
          console.error('Error deleting team:', error);
          alert('Error deleting team. Please try again.');
        }
      },

      deletePage: async (workspaceId, teamId, pageId, userId) => {
        set((state) => ({
          workspaces: state.workspaces.map(ws =>
            ws.id === workspaceId
              ? {
                ...ws,
                teams: ws.teams.map(t =>
                  t.id === teamId
                    ? { ...t, pages: t.pages.filter(p => p.id !== pageId) }
                    : t
                )
              }
              : ws
          )
        }));

        try {
          const data = await apiClient.deletePage(workspaceId, teamId, pageId, userId);
           if (!data.success) {
              console.error('Failed to persist page deletion:', data.error);
          }
        } catch (err) {
            console.error('Error persisting page deletion:', err);
        }
      },

      reorderPage: (workspaceId, teamId, startIndex, endIndex) => set((state) => ({
        workspaces: state.workspaces.map(ws => {
          if (ws.id !== workspaceId) return ws;

          return {
            ...ws,
            teams: ws.teams.map(t => {
              if (t.id !== teamId) return t;

              const newPages = Array.from(t.pages);
              const [reorderedPage] = newPages.splice(startIndex, 1);
              newPages.splice(endIndex, 0, reorderedPage);

              return { ...t, pages: newPages };
            })
          };
        })
      }))
    }),
    {
      name: 'ORBIT-ai-storage',
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
