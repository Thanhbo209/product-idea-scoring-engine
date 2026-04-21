"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import {
  Plus,
  Menu,
  LayoutDashboard,
  Tag,
  LogOut,
  Sun,
  Moon,
  MessageSquare,
  Trash2,
  MoreHorizontal,
  Lightbulb,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const NAV_ITEMS = [
  {
    label: "Dashboard",
    href: "/dashboard",
    exact: true,
    icon: LayoutDashboard,
  },
  {
    label: "My Ideas",
    href: "/ideas",
    exact: true,
    icon: Lightbulb,
  },
  { label: "Tags", href: "/tags", exact: false, icon: Tag },
];

const MOCK_HISTORY = [
  {
    group: "Today",
    items: [
      { id: "1", title: "SaaS quản lý hóa đơn freelancer" },
      { id: "2", title: "App kết nối mentor với sinh viên" },
    ],
  },
  {
    group: "Yesterday",
    items: [
      { id: "3", title: "Platform thương mại điện tử nông sản" },
      { id: "4", title: "Tool tự động hóa báo cáo kế toán" },
    ],
  },
  {
    group: "Weeks ago",
    items: [
      { id: "5", title: "Ứng dụng học tiếng Anh qua phim" },
      { id: "6", title: "Marketplace dịch vụ sửa chữa nhà" },
      { id: "7", title: "SaaS theo dõi chi phí nhà hàng" },
    ],
  },
];

interface SidebarProps {
  authenticated?: boolean;
  open: boolean;
  onToggle: () => void;
}

export default function Sidebar({
  authenticated = false,
  open,
  onToggle,
}: SidebarProps) {
  const pathname = usePathname();
  const { user, clearAuth } = useAuthStore();
  const { resolvedTheme, setTheme } = useTheme();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const isDark = resolvedTheme === "dark";

  const handleLogout = () => {
    clearAuth();
    document.cookie = "auth-token=; path=/; max-age=0";
    window.location.href = "/auth/login";
  };

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          onClick={onToggle}
        />
      )}

      <aside
        className={[
          "fixed lg:sticky top-0 z-30 h-screen flex flex-col",
          "bg-sidebar border-r border-border transition-all duration-300 ease-in-out shrink-0",
          open
            ? "w-64 translate-x-0"
            : "-translate-x-full lg:translate-x-0 lg:w-14",
        ].join(" ")}
      >
        {/* ── Header ── */}
        <div className="h-14 flex items-center justify-between px-3 border-b border-border shrink-0">
          {open ? (
            <Link
              href={authenticated ? "/dashboard" : "/"}
              className="flex items-center gap-2 overflow-hidden"
            >
              <span
                className="w-6 h-6 rounded-md bg-primary flex items-center justify-center
                               text-primary-foreground text-[10px] font-bold shrink-0"
              >
                IV
              </span>
              <span className="text-sm font-semibold text-foreground tracking-tight truncate">
                IdeaValidator
              </span>
            </Link>
          ) : (
            <></>
          )}
          <Button
            onClick={onToggle}
            variant="ghost"
            size="icon"
            className={["w-7 h-7 shrink-0", !open && "hidden lg:flex"].join(
              " ",
            )}
          >
            <Menu size={15} />
          </Button>
        </div>

        {/* ── New Idea ── */}
        <div className="px-2 pt-2 pb-1 shrink-0">
          <Link
            href={authenticated ? "/ideas/new" : "/auth/login"}
            className="block"
          >
            {open ? (
              <Button
                variant="ghost"
                className="w-full justify-start gap-2 h-9 text-sm"
              >
                <Plus size={15} />
                New Idea
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                className="w-full h-9"
                title="New Idea"
              >
                <Plus size={15} />
              </Button>
            )}
          </Link>
        </div>

        {/* ── Nav ── */}
        <nav className="px-2 pb-1 space-y-0.5 shrink-0">
          {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
            const active = exact
              ? pathname === href
              : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                title={!open ? label : undefined}
                className={[
                  "flex items-center rounded-lg text-sm transition-colors h-9",
                  open ? "gap-2.5 px-2.5" : "justify-center",
                  active
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                ].join(" ")}
              >
                <Icon size={15} className="shrink-0" />
                {open && <span>{label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* ── Divider ── */}
        {open && <div className="mx-3 border-t border-border my-1" />}

        {/* ── Chat history ── */}
        <div className="flex-1 overflow-y-auto px-2 py-1 min-h-0">
          {open ? (
            authenticated ? (
              <>
                <p
                  className="px-2 pt-1 pb-2 text-[10px] font-semibold text-muted-foreground
                              uppercase tracking-widest"
                >
                  Chat history
                </p>
                {MOCK_HISTORY.map(({ group, items }) => (
                  <div key={group} className="mb-3">
                    <p className="px-2 py-1 text-[10px] text-muted-foreground/60 font-medium">
                      {group}
                    </p>
                    {items.map((item) => (
                      <div
                        key={item.id}
                        onMouseEnter={() => setHoveredId(item.id)}
                        onMouseLeave={() => setHoveredId(null)}
                        className="group relative flex items-center h-8 px-2 rounded-lg
                                   hover:bg-accent transition-colors cursor-pointer"
                      >
                        <span
                          className="flex-1 text-xs text-muted-foreground truncate
                                         group-hover:text-accent-foreground pr-1"
                        >
                          {item.title}
                        </span>
                        {hoveredId === item.id && (
                          <button
                            className="shrink-0 p-0.5 rounded text-muted-foreground
                                       hover:text-destructive transition-colors"
                          >
                            <Trash2 size={11} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-8 text-center px-3">
                <MessageSquare
                  size={20}
                  className="text-muted-foreground/25 mb-2"
                />
                <p className="text-xs text-muted-foreground/50 leading-relaxed">
                  Đăng nhập để lưu lịch sử ý tưởng
                </p>
              </div>
            )
          ) : (
            /* Collapsed placeholder */
            <div className="flex flex-col items-center gap-1.5 pt-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="w-5 h-1 rounded-full bg-border" />
              ))}
            </div>
          )}
        </div>

        {/* ── Bottom ── */}
        <div className="px-2 py-2.5 border-t border-border space-y-1.5 shrink-0">
          {/* Theme toggle */}
          {open ? (
            <div
              className="flex items-center justify-between px-2.5 h-9 rounded-lg
                            hover:bg-accent transition-colors"
            >
              <span className="text-xs text-muted-foreground">Theme</span>
              <div className="flex items-center bg-accent rounded-md p-0.5 gap-0.5">
                <button
                  onClick={() => setTheme("light")}
                  className={[
                    "flex items-center justify-center w-6 h-6 rounded transition-all",
                    !isDark
                      ? "bg-background shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  ].join(" ")}
                  title="Light"
                >
                  <Sun size={12} />
                </button>
                <button
                  onClick={() => setTheme("dark")}
                  className={[
                    "flex items-center justify-center w-6 h-6 rounded transition-all",
                    isDark
                      ? "bg-card shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  ].join(" ")}
                  title="Dark"
                >
                  <Moon size={12} />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setTheme(isDark ? "light" : "dark")}
              title={isDark ? "Light mode" : "Dark mode"}
              className="flex items-center justify-center w-full h-9 rounded-lg
                         text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            >
              {isDark ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          )}

          {/* User / auth */}
          {authenticated && user ? (
            <div
              className={[
                "rounded-xl bg-card flex items-center gap-2.5",
                open ? "px-2.5 py-2" : "justify-center p-2",
              ].join(" ")}
            >
              <div
                className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center
                              text-primary text-xs font-semibold shrink-0"
              >
                {user.fullName?.charAt(0).toUpperCase() ?? "U"}
              </div>
              {open && (
                <>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">
                      {user.fullName}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    title="Đăng xuất"
                    className="p-1 text-muted-foreground hover:text-destructive transition-colors shrink-0"
                  >
                    <LogOut size={14} />
                  </button>
                </>
              )}
            </div>
          ) : open ? (
            <div className="space-y-1.5">
              <Link
                href="/auth/login"
                className="flex items-center justify-center w-full h-9 rounded-lg text-sm
                           font-medium border border-border hover:bg-accent transition-colors"
              >
                Log In
              </Link>
              <Link
                href="/auth/register"
                className="flex items-center justify-center w-full h-9 rounded-lg text-sm
                           font-medium text-primary-foreground bg-primary
                           hover:bg-primary/90 transition-colors"
              >
                Sign Up Free
              </Link>
            </div>
          ) : (
            <Link
              href="/auth/login"
              title="Log In"
              className="flex items-center justify-center w-full h-9 rounded-lg
                         text-muted-foreground hover:bg-accent transition-colors"
            >
              <MoreHorizontal size={15} />
            </Link>
          )}
        </div>
      </aside>

      {/* Mobile hamburger */}
      {!open && (
        <button
          onClick={onToggle}
          className="fixed top-4 left-4 z-40 lg:hidden p-2 rounded-md bg-background
                     border border-border text-muted-foreground hover:text-foreground
                     hover:bg-accent transition-colors"
        >
          <Menu size={16} />
        </button>
      )}
    </>
  );
}
