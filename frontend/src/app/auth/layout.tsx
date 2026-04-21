"use client";

import SidebarShell from "@/components/SidebarShell";
import { useAuthStore } from "@/store/authStore";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuthStore();

  if (user) {
    return (
      <SidebarShell authenticated={true}>
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="text-center space-y-5 max-w-sm">
            <div
              className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center
                            justify-center text-primary text-xl font-semibold"
            >
              {user.fullName?.charAt(0).toUpperCase() ?? "U"}
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">
                Đã đăng nhập
              </p>
              <h1 className="text-2xl font-semibold text-foreground">
                Welcome back, {user.fullName?.split(" ").pop()}!
              </h1>
              <p className="mt-1.5 text-sm text-muted-foreground">
                {user.email}
              </p>
            </div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg
                         bg-primary text-primary-foreground text-sm font-medium
                         hover:bg-primary/90 transition-colors"
            >
              Quay về Dashboard
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </SidebarShell>
    );
  }

  return (
    <SidebarShell authenticated={false}>
      <div className="flex items-center justify-center min-h-screen px-4 py-12">
        {children}
      </div>
    </SidebarShell>
  );
}
