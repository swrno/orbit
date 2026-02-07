"use client";

import { DataGrid } from "@/components/views/DataGrid";
import { BoardView } from "@/components/views/BoardView";
import { DocumentView } from "@/components/views/DocumentView";
import { GanttView } from "@/components/views/GanttView";
import { RoadmapView } from "@/components/views/RoadmapView";
import { CalendarView } from "@/components/views/CalendarView";
import { ChartView } from "@/components/views/ChartView";
// Specialized views
import { TasksView } from "@/components/views/TasksView";
import { SprintsView } from "@/components/views/SprintsView";
import { EpicsView } from "@/components/views/EpicsView";
import { BugsView } from "@/components/views/BugsView";
import { RetrospectivesView } from "@/components/views/RetrospectivesView";

import { useParams } from "next/navigation";
import { useAppStore, Page, PageType } from "@/lib/store";
import { Box } from "@mui/material";
import React, { useState, useEffect } from "react";
import { ViewTabs } from "@/components/ui/ViewTabs";
import { PageHeader } from "@/components/ui/PageHeader";

export default function GenericPage() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;
  const pageId = params.pageId as string;

  const { workspaces, updatePage } = useAppStore();
  const workspace = workspaces.find(w => w.id === workspaceId);

  // Find the page within the workspace groups
  let currentPage: Page | null = null;
  let currentGroupId: string | null = null;

  if (workspace) {
    for (const group of workspace.groups) {
      const page = group.pages.find(p => p.id === pageId);
      if (page) {
        currentPage = page;
        currentGroupId = group.id;
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

  // Initialize views if not set
  const pageViews = currentPage.views || ['table'];
  const currentViewIndex = currentPage.activeViewIndex ?? 0;

  const handleViewChange = (index: number) => {
    if (workspaceId && currentGroupId && currentPage) {
      updatePage(workspaceId, currentGroupId, currentPage.id, { 
        activeViewIndex: index,
        type: pageViews[index]
      });
    }
  };

  const handleAddView = (viewType: PageType) => {
    if (workspaceId && currentGroupId && currentPage) {
      const newViews = [...pageViews, viewType];
      updatePage(workspaceId, currentGroupId, currentPage.id, { 
        views: newViews,
        activeViewIndex: newViews.length - 1,
        type: viewType
      });
    }
  };

  const handleRemoveView = (index: number) => {
    if (workspaceId && currentGroupId && currentPage && pageViews.length > 1) {
      const newViews = pageViews.filter((_, i) => i !== index);
      const newActiveIndex = index === currentViewIndex 
        ? Math.max(0, currentViewIndex - 1)
        : currentViewIndex > index 
          ? currentViewIndex - 1 
          : currentViewIndex;
      
      updatePage(workspaceId, currentGroupId, currentPage.id, { 
        views: newViews,
        activeViewIndex: newActiveIndex,
        type: newViews[newActiveIndex]
      });
    }
  };

  // Skip view tabs for document pages
  const isDocument = currentPage.type === 'document';
  const activeViewType = pageViews[currentViewIndex];

  // Detect specialized view based on page title
  const pageTitle = currentPage.title.toLowerCase();
  const isSpecializedView = 
    pageTitle.includes('task') || 
    pageTitle.includes('sprint') || 
    pageTitle.includes('epic') || 
    pageTitle.includes('bug') || 
    pageTitle.includes('retro');

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#f6f7fb' }}>
      {/* Page Header */}
      <PageHeader 
        workspaceName={workspace?.name || 'Workspace'}
        pageName={currentPage.title}
      />

      {/* View Tabs - only for non-document and non-specialized pages */}
      {!isDocument && !isSpecializedView && (
        <ViewTabs 
          views={pageViews.map((viewType, index) => ({
            id: viewType + '-' + index, // Ensure unique ID
            label: viewType.charAt(0).toUpperCase() + viewType.slice(1),
            type: viewType as any
          }))}
          activeViewId={activeViewType + '-' + currentViewIndex}
          onViewChange={(viewId) => {
            // Extract index from ID if possible, or find index
            const indexStr = viewId.split('-').pop();
            const index = indexStr ? parseInt(indexStr) : -1;
            if (index !== -1 && !isNaN(index)) handleViewChange(index);
          }}
          onAddView={(viewType) => handleAddView(viewType as PageType)}
          onRemoveView={(viewId) => {
             const indexStr = viewId.split('-').pop();
             const index = indexStr ? parseInt(indexStr) : -1;
             if (index !== -1 && !isNaN(index)) handleRemoveView(index);
          }}
        />
      )}

      {/* View Content */}
      <Box sx={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
        {/* Specialized Views - take priority */}
        {pageTitle.includes('task') && (
          <TasksView workspaceId={workspaceId} pageId={currentPage.id} />
        )}
        {pageTitle.includes('sprint') && !pageTitle.includes('retro') && (
          <SprintsView workspaceId={workspaceId} pageId={currentPage.id} />
        )}
        {pageTitle.includes('epic') && (
          <EpicsView workspaceId={workspaceId} pageId={currentPage.id} />
        )}
        {pageTitle.includes('bug') && (
          <BugsView workspaceId={workspaceId} pageId={currentPage.id} />
        )}
        {pageTitle.includes('retro') && (
          <RetrospectivesView workspaceId={workspaceId} pageId={currentPage.id} />
        )}

        {/* Document View */}
        {isDocument && !isSpecializedView && (
          <DocumentView workspaceId={workspaceId} pageId={currentPage.id} />
        )}

        {/* Generic Views - only render if not specialized view or document */}
        {!isDocument && !isSpecializedView && (
          <>
            {(activeViewType === 'table' || activeViewType === 'list') && (
              <DataGrid workspaceId={workspaceId} pageId={currentPage.id} />
            )}
            {activeViewType === 'board' && (
              <BoardView workspaceId={workspaceId} />
            )}
            {activeViewType === 'gantt' && (
              <GanttView workspaceId={workspaceId} />
            )}
            {activeViewType === 'roadmap' && (
              <RoadmapView workspaceId={workspaceId} />
            )}
            {activeViewType === 'calendar' && (
              <CalendarView workspaceId={workspaceId} />
            )}
            {activeViewType === 'chart' && (
              <ChartView workspaceId={workspaceId} />
            )}
          </>
        )}
      </Box>
    </Box>
  );
}
