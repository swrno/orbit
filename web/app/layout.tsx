import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google"; 
import "./globals.css";
import { TamboWrapper } from "@/components/ai/TamboWrapper";
import ThemeRegistry from "@/components/layout/ThemeRegistry";

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
  title: "ForgeAI Workspace",
  description: "Intelligent Project Management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`} suppressHydrationWarning>
      <body className="h-screen w-screen overflow-hidden bg-background text-foreground">
        <ThemeRegistry>
          <TamboWrapper>
            {children}
          </TamboWrapper>
        </ThemeRegistry>
      </body>
    </html>
  );
}
