import { useAppStore, PageType } from "@/lib/store";
import { FileText, Kanban, Table, Plus, X } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState, SyntheticEvent } from "react";
import { CreatePageModal } from "@/components/modals/CreatePageModal";
import { Tabs, Tab, IconButton, Box } from "@mui/material";

export function PageTabs() {
  const params = useParams();
  const router = useRouter();
  const workspaceId = params.workspaceId as string;
  const pageId = params.pageId as string;

  const { workspaces, addPage, deletePage } = useAppStore();
  const workspace = workspaces.find((w) => w.id === workspaceId);

  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!workspace) return null;

  // Find current group
  let currentGroup = null;
  for (const group of workspace.groups) {
    if (group.pages.find((p) => p.id === pageId)) {
      currentGroup = group;
      break;
    }
  }
  
  // Fallback for empty state or navigation
  if (!currentGroup && workspace.groups.length > 0) {
      if (workspace.groups[0].pages.length > 0) {
         currentGroup = workspace.groups[0]; 
      }
  }
  
  if (!currentGroup) return null;

  const handleCreatePage = (title: string, type: PageType) => {
    if (currentGroup) {
      addPage(workspaceId, currentGroup.id, title, type);
    }
  };

  const handleDeletePage = (e: React.MouseEvent, pId: string) => {
    e.preventDefault(); 
    e.stopPropagation();
    if (confirm("Delete this page?")) {
        deletePage(workspaceId, currentGroup!.id, pId);
        // Navigation logic
        if (pId === pageId) {
             const remaining = currentGroup!.pages.filter(p => p.id !== pId);
             if (remaining.length > 0) {
                 router.push(`/${workspaceId}/${remaining[0].id}`);
             } else {
                 router.push(`/dashboard`);
             }
        }
    }
  };

  const currentTab = currentGroup.pages.find(p => p.id === pageId)?.id || false;

  const handleChange = (event: SyntheticEvent, newValue: string) => {
     router.push(`/${workspaceId}/${newValue}`);
  };

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Tabs 
            value={currentTab} 
            onChange={handleChange} 
            aria-label="page tabs"
            indicatorColor="primary"
            textColor="primary"
            variant="scrollable"
            scrollButtons="auto"
            sx={{ minHeight: 48 }}
        >
            {currentGroup.pages.map((page) => {
                const Icon = page.type === 'board' ? Kanban : page.type === 'table' ? Table : FileText;
                
                return (
                    <Tab 
                        key={page.id}
                        value={page.id} 
                        label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Icon size={16} />
                                <span>{page.title}</span>
                                <Box component="span" 
                                    sx={{ 
                                        width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                    borderRadius: '50%', 
                                    ml: 0.5, opacity: 0.6, transition: '0.2s',
                                    '&:hover': { bgcolor: 'action.hover', color: 'error.main', opacity: 1 }
                                }}
                                    onClick={(e) => handleDeletePage(e, page.id)}
                                >
                                    <X size={12} />
                                </Box>
                            </Box>
                        } 
                        sx={{ textTransform: 'none', minHeight: 48, fontWeight: 500 }}
                    />
                );
            })}
        </Tabs>
        <IconButton size="small" onClick={() => setIsModalOpen(true)} sx={{ ml: 1 }}>
            <Plus size={18} />
        </IconButton>
      </Box>

      <CreatePageModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handleCreatePage} 
      />
    </>
  );
}
