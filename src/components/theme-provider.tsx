"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider 
      {...props}
      attribute="class"
      defaultTheme="system"  // 使用系统默认主题
      enableSystem={true}    // 启用系统主题检测
      disableTransitionOnChange={true}  // 禁用主题切换动画
    >
      {children}
    </NextThemesProvider>
  )
}