"use client";

import { Header } from "@/components/layout/Header";
import { BacklogView } from "@/components/views/BacklogView";
import { useParams } from "next/navigation";

export default function BacklogPage() {
    const params = useParams();
    const workspaceId = params.workspaceId as string;

    return (
        <div className="flex flex-col h-full bg-white">
            <Header />
            <BacklogView workspaceId={workspaceId} />
        </div>
    );
}
