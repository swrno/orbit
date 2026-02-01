"use client";

import { DataGrid } from "@/components/views/DataGrid";
import { Header } from "@/components/layout/Header";
import { useParams } from "next/navigation";

export default function WorkspacePage() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;

  return (
    <div className="flex flex-col h-full">
      <Header />
      <DataGrid workspaceId={workspaceId} />
    </div>
  );
}
