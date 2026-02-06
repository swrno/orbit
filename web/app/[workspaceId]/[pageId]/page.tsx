"use client";

import { DataGrid } from "@/components/views/DataGrid";
import { BoardView } from "@/components/views/BoardView";
import { DocumentView } from "@/components/views/DocumentView";
import { GanttView } from "@/components/views/GanttView";
import { RoadmapView } from "@/components/views/RoadmapView";
import { CalendarView } from "@/components/views/CalendarView";
import { ChartView } from "@/components/views/ChartView";
import { useParams } from "next/navigation";
import { useAppStore } from "@/lib/store";

export default function GenericPage() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;
  const pageId = params.pageId as string;

  const { workspaces } = useAppStore();
  const workspace = workspaces.find(w => w.id === workspaceId);

  // Find the page within the workspace groups
  let currentPage = null;
  if (workspace) {
    for (const group of workspace.groups) {
      const page = group.pages.find(p => p.id === pageId);
      if (page) {
        currentPage = page;
        break;
      }
    }
  }

  if (!currentPage) {
    return (
      <div className="flex flex-col h-full items-center justify-center">
        <p className="text-slate-500">Page not found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {(currentPage.type === 'table' || currentPage.type === 'list') && (
        <DataGrid workspaceId={workspaceId} pageId={currentPage.id} />
      )}
      {currentPage.type === 'board' && (
        <BoardView workspaceId={workspaceId} />
      )}
      {currentPage.type === 'gantt' && (
          <GanttView workspaceId={workspaceId} />
      )}
      {currentPage.type === 'roadmap' && (
          <RoadmapView workspaceId={workspaceId} />
      )}
      {currentPage.type === 'calendar' && (
          <CalendarView workspaceId={workspaceId} />
      )}
      {currentPage.type === 'chart' && (
          <ChartView workspaceId={workspaceId} />
      )}
      {currentPage.type === 'document' && (
        <DocumentView workspaceId={workspaceId} pageId={currentPage.id} />
      )}
    </div>
  );
}
