"use client";

import { Languages } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ComponentProps, useMemo } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../ui/sidebar";

export function AppSidebar(props: ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  const menuItems = useMemo(() => {
    return [
      {
        title: "文本翻译",
        url: "/articles",
        Icon: Languages,
        isActive: pathname.startsWith("/articles"),
      },
    ];
  }, [pathname]);

  return (
    <Sidebar {...props}>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>应用</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map(({ title, url, Icon, isActive }) => (
                <SidebarMenuItem key={url}>
                  <SidebarMenuButton asChild isActive={isActive}>
                    <Link href={url}>
                      <Icon />
                      <span>{title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
