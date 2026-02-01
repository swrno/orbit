"use client";

import { useAppStore, Task, TaskStatus, Column, ColumnType } from "@/lib/store";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronRight, Plus, User, Calendar, GripVertical } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Paper, Box } from "@mui/material";

interface DataGridProps {
  workspaceId: string;
  pageId?: string;
}

const STATUS_COLORS: Record<TaskStatus, string> = {
  'Todo': 'bg-slate-100 text-slate-600',
  'In Progress': 'bg-amber-100 text-amber-700',
  'Done': 'bg-blue-100 text-blue-700',
  'Blocked': 'bg-red-100 text-red-700',
};

const DEFAULT_COLUMNS: Column[] = [
    { id: 'c-1', title: 'Task Name', type: 'text', field: 'title', width: 300 },
    { id: 'c-2', title: 'Owner', type: 'owner', field: 'owner', width: 120 },
    { id: 'c-3', title: 'Status', type: 'status', field: 'status', width: 120 },
    { id: 'c-4', title: 'Est. SP', type: 'number', field: 'estimatedPoints', width: 80 },
    { id: 'c-5', title: 'Epic', type: 'epic', field: 'epic', width: 140 },
];

export function DataGrid({ workspaceId, pageId }: DataGridProps) {
  const { workspaces, addTask, updateTask, updatePage } = useAppStore();
  const workspace = workspaces.find((w) => w.id === workspaceId);
  
  // Find page and group
  let group = workspace?.groups.find(g => g.pages.some(p => p.id === pageId));
  let page = group?.pages.find(p => p.id === pageId);

  // Default to first page if no pageId provided or found
  if ((!group || !page) && !pageId && workspace?.groups.length) {
      group = workspace.groups[0];
      if (group?.pages.length) {
          page = group.pages[0];
      }
  }

  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    'sprint-1': true,
    'backlog': true
  });
  const [newTaskTitle, setNewTaskTitle] = useState("");

  // Initialize columns if missing
  useEffect(() => {
    if (page && !page.columns && group) {
        updatePage(workspaceId, group.id, page.id, { columns: DEFAULT_COLUMNS });
    }
  }, [page, group, workspaceId, updatePage]);

  // Resizing State
  const [resizing, setResizing] = useState<{ columnId: string; startX: number; startWidth: number } | null>(null);

  if (!workspace || !page || !group) return null;

  const columns = page.columns || DEFAULT_COLUMNS;

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const handleAddTask = (groupId: string) => {
    if (!newTaskTitle.trim()) return;
    addTask(workspaceId, {
        title: newTaskTitle,
        status: 'Todo',
        priority: 'Medium',
        sprintId: groupId,
        estimatedPoints: 0,
        owner: 'Unassigned',
        epic: 'General'
    });
    setNewTaskTitle("");
  };

  const handleUpdateCell = (taskId: string, field: string, value: any) => {
      // Check if it's a standard field or custom
      const isStandard = ['title', 'status', 'priority', 'owner', 'epic', 'estimatedPoints', 'sprintId'].includes(field);
      
      if (isStandard) {
        updateTask(workspaceId, taskId, { [field]: value });
      } else {
         // Need to find current task to merge custom values
         const currentTask = workspace.tasks.find(t => t.id === taskId);
         if (currentTask) {
             const customValues = { ...(currentTask.customValues || {}), [field]: value };
             updateTask(workspaceId, taskId, { customValues });
         }
      }
  };

  // Resize Handlers
  const startResize = (e: React.MouseEvent, columnId: string, width: number) => {
      e.preventDefault();
      e.stopPropagation();
      setResizing({ columnId, startX: e.clientX, startWidth: width });
      
      const onMouseMove = (moveEvent: MouseEvent) => {
          const diff = moveEvent.clientX - e.clientX;
          const newWidth = Math.max(50, width + diff);
          // Optimistic update could happen here, but for now we'll wait for mouse up to commit or use local state if too slow.
          // For simplicity updating store directly, might be jittery without debounce/throttle or local state.
          // Better: Update a ref or local state, then commit on up.
          // Let's rely on local state override for smooth dragging if we wanted perfect UI, 
          // but for this task direct store update might be okay if zustand is fast. 
          // Actually, let's just commit on mouse up to avoid excessive store updates.
      };

      const onMouseUp = (upEvent: MouseEvent) => {
          const diff = upEvent.clientX - e.clientX;
          const newWidth = Math.max(50, width + diff);
          
          if (group && page) {
              const newColumns = columns.map(c => c.id === columnId ? { ...c, width: newWidth } : c);
              updatePage(workspaceId, group.id, page.id, { columns: newColumns });
          }
          
          setResizing(null);
          document.removeEventListener('mousemove', onMouseMove);
          document.removeEventListener('mouseup', onMouseUp);
      };

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
  };

  const handleAddColumn = () => {
      const name = prompt("Enter column name:");
      if (!name) return;
      
      const newColumn: Column = {
          id: `c-${Date.now()}`,
          title: name,
          type: 'text',
          field: `custom_${Date.now()}`, // simple unique field key
          width: 150
      };
      
      updatePage(workspaceId, group.id, page.id, { columns: [...columns, newColumn] });
  };
  
  const handleRenameColumn = (columnId: string, currentTitle: string) => {
      const newTitle = prompt("Rename column:", currentTitle);
      if (newTitle && newTitle !== currentTitle) {
          const newColumns = columns.map(c => c.id === columnId ? { ...c, title: newTitle } : c);
          updatePage(workspaceId, group.id, page.id, { columns: newColumns });
      }
  };

  const allTasks = workspace.tasks || [];
  const sprint1Tasks = allTasks.filter(t => t.sprintId === 'sprint-1');
  const backlogTasks = allTasks.filter(t => t.sprintId === 'backlog' || !t.sprintId);

  const Groups = [
      { id: 'sprint-1', title: 'Sprint 1', tasks: sprint1Tasks, color: 'text-foreground' },
      { id: 'backlog', title: 'Backlog', tasks: backlogTasks, color: 'text-slate-500' }
  ];

  return (
    <Paper elevation={0} sx={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', bgcolor: 'background.paper', overflow: 'hidden', selectUser: 'none', borderRadius: 0 }}>
        <div className="flex flex-col h-full overflow-hidden">
            {/* Header Row */}
            <div className="flex items-stretch border-b border-zinc-200 bg-zinc-50 text-zinc-500 text-[11px] uppercase font-bold tracking-wide sticky top-0 z-20 shadow-sm min-w-max">
                <div className="w-8 border-r border-zinc-200 flex items-center justify-center bg-zinc-100/50 flex-shrink-0">#</div>
                
                {columns.map((col) => (
                    <div 
                        key={col.id} 
                        className="border-r border-zinc-200 px-3 py-2 flex items-center relative group"
                        style={{ width: col.width }}
                    >
                         <span onDoubleClick={() => handleRenameColumn(col.id, col.title)} className="truncate cursor-pointer">{col.title}</span>
                         
                         {/* Resizer */}
                         <div 
                            className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-400 z-10"
                            onMouseDown={(e) => startResize(e, col.id, col.width)}
                         />
                    </div>
                ))}
                
                <div 
                    className="w-12 flex items-center justify-center hover:bg-zinc-100 cursor-pointer text-zinc-400 hover:text-zinc-600 transition-colors border-r border-zinc-200"
                    onClick={handleAddColumn}
                    title="Add Column"
                >
                    <Plus className="w-4 h-4" />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                <div className="min-w-max"> 
                {Groups.map(group => (
                    <div key={group.id}>
                        {/* Group Header */}
                        <div 
                            className="flex items-center gap-2 px-2 py-2 bg-zinc-50/80 border-b border-zinc-200 hover:bg-zinc-100 cursor-pointer sticky top-0 z-10"
                            onClick={() => toggleGroup(group.id)}
                        >
                            <div className={cn("transition-transform duration-200 p-0.5 rounded hover:bg-zinc-200", expandedGroups[group.id] ? "rotate-90" : "")}>
                                <ChevronRight className="w-4 h-4 text-zinc-500" />
                            </div>
                            <span className={cn("font-semibold text-sm", group.color)}>{group.title}</span>
                            <span className="text-zinc-400 text-xs">({group.tasks.length})</span>
                            
                            <div className="ml-auto flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-[10px] uppercase font-bold text-accent-primary cursor-pointer hover:underline">Add items</span>
                            </div>
                        </div>

                        {/* Tasks Rows */}
                        {expandedGroups[group.id] && (
                            <div>
                                {group.tasks.map(task => (
                                    <div key={task.id} className="flex items-stretch border-b border-zinc-200 hover:bg-blue-50/50 group h-[34px] transition-colors">
                                        {/* Grabber */}
                                        <div className="w-8 border-r border-zinc-200 flex items-center justify-center bg-zinc-50/30 text-zinc-300 group-hover:text-zinc-400 cursor-grab flex-shrink-0">
                                            <div className="w-1.5 h-1.5 rounded-full bg-current opacity-50"></div>
                                        </div>
                                        
                                        {/* Dynamic Cells */}
                                        {columns.map(col => {
                                            const val = ['title', 'status', 'owner', 'priority', 'epic', 'estimatedPoints'].includes(col.field) 
                                                ? (task as any)[col.field]
                                                : (task.customValues?.[col.field]);

                                            return (
                                                <div 
                                                    key={col.id} 
                                                    className="border-r border-zinc-200 px-3 flex items-center text-zinc-700 truncate relative"
                                                    style={{ width: col.width }}
                                                >
                                                    {col.field === 'title' ? (
                                                        <input 
                                                            className="w-full bg-transparent focus:outline-none font-medium text-zinc-700"
                                                            value={val as string}
                                                            onChange={(e) => handleUpdateCell(task.id, col.field, e.target.value)}
                                                        />
                                                    ) : col.type === 'status' ? (
                                                         <div className={cn("px-2 py-0.5 rounded-sm text-[11px] font-medium w-full text-center truncate cursor-pointer", STATUS_COLORS[val as TaskStatus] || 'bg-gray-100')}>
                                                            {val}
                                                            {/* Simple Placeholder for edit interaction - normally would be a dropdown */}
                                                         </div>
                                                    ) : (
                                                        <input 
                                                            className="w-full bg-transparent focus:outline-none"
                                                            value={val || ''}
                                                            placeholder="-"
                                                            onChange={(e) => handleUpdateCell(task.id, col.field, e.target.value)}
                                                        />
                                                    )}
                                                </div>
                                            );
                                        })}
                                        
                                         <div className="w-12 flex items-center justify-center opacity-0 group-hover:opacity-100 flex-shrink-0">
                                            <div className="w-4 h-4 rounded-full hover:bg-zinc-200 flex items-center justify-center cursor-pointer text-zinc-400">
                                                <ChevronDown className="w-3 h-3" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                
                                {/* New Task Row */}
                                <div className="flex items-stretch h-[34px] border-b border-zinc-200 bg-white">
                                    <div className="w-8 border-r border-zinc-200 flex-shrink-0"></div>
                                    <div className="px-3 flex items-center gap-2" style={{ width: columns[0]?.width || 300 }}>
                                        <Plus className="w-3.5 h-3.5 text-zinc-400" />
                                        <input 
                                            className="bg-transparent focus:outline-none text-sm w-full placeholder:text-zinc-400 text-zinc-700 h-full"
                                            placeholder="Type to add a task..."
                                            value={newTaskTitle}
                                            onChange={(e) => setNewTaskTitle(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleAddTask(group.id);
                                            }}
                                        />
                                    </div>
                                    {/* Empty cells to fill row */}
                                    {columns.slice(1).map(col => (
                                         <div key={col.id} className="border-r border-zinc-200 bg-zinc-50/20" style={{ width: col.width }}></div>
                                    ))}
                                    <div className="w-12"></div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
                </div>
            </div>
        </div>
    </Paper>
  );
}

