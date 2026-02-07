import type { Metadata } from "next";
import "./globals.css";

import ThemeRegistry from "@/components/layout/ThemeRegistry";
import { AuthProvider } from "@/contexts/AuthContext";
import { AuthGuard } from "@/components/auth/AuthGuard";

export const metadata: Metadata = {
  title: "Orbit AI Workspace",
  description: "Intelligent Project Management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <ThemeRegistry>
          <AuthProvider>
            <AuthGuard>
              {children}
            </AuthGuard>
          </AuthProvider>
        </ThemeRegistry>
      </body>
    </html>
  );
}
