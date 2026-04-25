"use client";

import SidebarShell from "@/components/SidebarShell";
import { authApi } from "@/lib/authApi";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, setAuth, clearAuth } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const me = await authApi.me();
        setAuth(me);
      } catch {
        clearAuth();
        router.replace("/auth/login");
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, [router, setAuth, clearAuth]);

  if (loading) {
    return (
      <div className="p-6 text-sm text-muted-foreground">Checking auth...</div>
    );
  }

  return <SidebarShell authenticated={!!user}>{children}</SidebarShell>;
}
