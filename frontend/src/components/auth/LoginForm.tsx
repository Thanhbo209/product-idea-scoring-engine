"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { authApi } from "@/lib/authApi";
import { useState } from "react";

export const LoginForm = () => {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await authApi.login(form);
      setAuth(res.accessToken, {
        userId: res.userId,
        email: res.email,
        fullName: res.fullName,
        role: res.role,
      });
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className=" border border-border rounded-xl p-8">
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <p className="text-sm text-destructive bg-card border border-border px-3 py-2">
            {error}
          </p>
        )}
        <div>
          <label className="block text-sm font-medium  mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            required
            className="w-full px-3 py-2 border border-border  text-sm
                           focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent
                           placeholder:text-muted-foreground"
          />
        </div>

        <div>
          <label className="block text-sm font-medium  mb-1">Password</label>

          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="••••••••"
            required
            className="w-full px-3 py-2 border border-border  text-sm
                           focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent
                           placeholder:text-muted-foreground"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 bg-primary hover:bg-primary/80
                          text-sm font-medium text-white
                         transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Logging you in..." : "Log In"}
        </button>
      </form>
    </div>
  );
};

export default LoginForm;
