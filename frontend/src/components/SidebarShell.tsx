"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";

interface SidebarShellProps {
  authenticated?: boolean;
  children: React.ReactNode;
}

export default function SidebarShell({
  authenticated = false,
  children,
}: SidebarShellProps) {
  const [open, setOpen] = useState(true);

  return (
    <div className="flex min-h-screen">
      <Sidebar
        authenticated={authenticated}
        open={open}
        onToggle={() => setOpen((v) => !v)}
      />
      <main className="flex-1 min-w-0 overflow-auto">{children}</main>
    </div>
  );
}
