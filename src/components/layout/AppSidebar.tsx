'use client';

import React from "react";
import { usePathname } from "next/navigation";
import {
  IconLayoutDashboard,
  IconVideo,
  IconPalette,
  IconMovie,
  IconSparkles,
  IconTemplate,
  IconFolder,
  IconFileExport,
  IconFileText
} from "@tabler/icons-react";
import { Sidebar, SidebarBody, SidebarLink, Logo } from "./Sidebar";
import { cn } from "@/lib/utils";

export function AppSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  
  const links = [
    {
      label: "Dashboard",
      href: "/",
      icon: (
        <IconLayoutDashboard className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Static → Motion",
      href: "/static-to-motion",
      icon: (
        <IconMovie className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Frames → Video",
      href: "/frames-to-video",
      icon: (
        <IconVideo className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Prompt → Video",
      href: "/prompt-to-video",
      icon: (
        <IconSparkles className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Blendr",
      href: "/blendr",
      icon: (
        <IconPalette className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Templates",
      href: "/templates",
      icon: (
        <IconTemplate className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Projects",
      href: "/projects",
      icon: (
        <IconFolder className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Prompts",
      href: "/prompts",
      icon: (
        <IconFileText className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Export",
      href: "/export",
      icon: (
        <IconFileExport className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
  ];

  return (
    <Sidebar open={open} setOpen={setOpen}>
      <SidebarBody className="justify-between gap-10">
        <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
          <Logo className="mb-8" />
          <div className="mt-8 flex flex-col gap-2">
            {links.map((link, idx) => (
              <SidebarLink 
                key={idx} 
                link={link}
                className={cn(
                  pathname === link.href && "bg-neutral-200 dark:bg-neutral-700 rounded-md"
                )}
              />
            ))}
          </div>
        </div>
      </SidebarBody>
    </Sidebar>
  );
}