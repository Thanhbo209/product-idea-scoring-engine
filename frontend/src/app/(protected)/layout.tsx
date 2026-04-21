"use client";

import SidebarShell from "@/components/SidebarShell";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!user) router.replace("/auth/login");
  }, [user, router]);

  if (!user) return null;

  return <SidebarShell authenticated={true}>{children}</SidebarShell>;
}
