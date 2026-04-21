"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ArrowRight, Sparkles, BarChart3, GitBranch } from "lucide-react";

const FEATURES = [
  {
    icon: Sparkles,
    title: "AI Validation",
    desc: "Phân tích ý tưởng theo 3 chiều: clarity, market fit và risk score trong vài giây.",
  },
  {
    icon: GitBranch,
    title: "Refinement Loop",
    desc: "Mỗi lần chỉnh sửa tạo ra một version mới. Theo dõi điểm tăng qua từng lần iterate.",
  },
  {
    icon: BarChart3,
    title: "Score Breakdown",
    desc: "Radar chart trực quan cho thấy dimension nào đang kéo ý tưởng của bạn xuống.",
  },
];

export default function HomePage() {
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (user) router.replace("/dashboard");
  }, [user, router]);

  if (user) return null;

  return (
    <main className="flex-1 min-h-screen flex flex-col">
      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 pt-24 pb-16 text-center">
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border
                        bg-background text-xs text-muted-foreground mb-8 font-medium"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          AI-powered idea validator
        </div>

        <h1
          className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight
                       text-foreground leading-tight max-w-3xl"
        >
          Validate ý tưởng của bạn{" "}
          <span className="text-primary">trước khi build</span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-muted-foreground max-w-xl leading-relaxed">
          Đừng mất tháng trời build một thứ không ai cần. IdeaValidator giúp bạn
          kiểm tra market fit, rủi ro và tiềm năng trong vài phút.
        </p>

        <div className="mt-10 flex items-center gap-3 flex-wrap justify-center">
          <Link
            href="/auth/register"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg
                       bg-primary text-primary-foreground text-sm font-medium
                       hover:bg-primary/90 transition-colors"
          >
            Bắt đầu miễn phí
            <ArrowRight size={15} />
          </Link>
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg
                       border border-border text-sm font-medium text-foreground
                       hover:bg-accent transition-colors"
          >
            Đăng nhập
          </Link>
        </div>
      </section>

      {/* Score preview */}
      <section className="px-6 pb-16 flex justify-center">
        <div className="w-full max-w-sm bg-card border border-border rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">
              SaaS for freelancers
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
              Active
            </span>
          </div>

          <div className="space-y-2.5">
            {[
              { label: "Clarity", score: 8.2, color: "bg-blue-500" },
              { label: "Market fit", score: 7.5, color: "bg-violet-500" },
              { label: "Risk", score: 6.8, color: "bg-amber-500" },
            ].map(({ label, score, color }) => (
              <div key={label}>
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>{label}</span>
                  <span className="font-medium text-foreground">{score}</span>
                </div>
                <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${color}`}
                    style={{ width: `${score * 10}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-1 flex items-center justify-between border-t border-border">
            <span className="text-xs text-muted-foreground">Total score</span>
            <span className="text-lg font-semibold text-foreground">
              7.5 / 10
            </span>
          </div>

          <div className="flex gap-1.5">
            {["SaaS", "B2C", "Freelance"].map((tag) => (
              <span
                key={tag}
                className="text-[11px] px-2 py-0.5 rounded-full bg-secondary
                           text-muted-foreground border border-border"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 pb-20">
        <div className="max-w-3xl mx-auto grid sm:grid-cols-3 gap-4">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="bg-card border border-border rounded-xl p-5 space-y-3"
            >
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icon size={16} className="text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{title}</p>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  {desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer CTA */}
      <section className="border-t border-border px-6 py-10 text-center">
        <p className="text-sm text-muted-foreground">
          Đã có tài khoản?{" "}
          <Link
            href="/auth/login"
            className="text-primary hover:underline font-medium"
          >
            Đăng nhập ngay
          </Link>
        </p>
      </section>
    </main>
  );
}
