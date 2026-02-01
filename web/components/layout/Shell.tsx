"use client";

interface ShellProps {
  children: React.ReactNode;
}

export function Shell({ children }: ShellProps) {
  return (
    <div className="flex h-screen w-screen bg-background overflow-hidden selection:bg-accent-primary/30 text-foreground">
      {/* Background Gradients */}
      <div className="fixed inset-0 pointer-events-none z-0">
         <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-100/80 blur-[120px]" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-100/80 blur-[120px]" />
      </div>

      {/* Layout */}
      <div className="relative z-10 flex w-full h-full">
        {children}
      </div>
    </div>
  );
}

