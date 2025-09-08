import type { Metadata } from "next";
import "./globals.css";
import { MainLayout } from "@/components/layout/main-layout";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "AI 翻译助手",
  description: "AI 驱动的翻译工具",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="zh" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <MainLayout>{children}</MainLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}
