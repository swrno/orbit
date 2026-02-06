import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google"; 
import "./globals.css";

import ThemeRegistry from "@/components/layout/ThemeRegistry";
import { TamboProviderWrapper } from "@/components/providers/TamboProviderWrapper";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

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
    <html lang="en" className={`${inter.variable} ${outfit.variable}`} suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <ThemeRegistry>
          <TamboProviderWrapper>
            {children}
          </TamboProviderWrapper>
        </ThemeRegistry>
      </body>
    </html>
  );
}
