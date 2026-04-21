"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { authApi } from "@/lib/authApi";
import { useState } from "react";

export const RegisterForm = () => {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [form, setForm] = useState({ email: "", password: "", fullName: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: "", general: "" }));
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.fullName.trim()) next.fullName = "Please fill out full name";
    if (!/^\S+@\S+\.\S+$/.test(form.email))
      next.email = "Email or password is invalid";
    if (form.password.length < 6)
      next.password = "Password must be at least 6 characters";
    return next;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validate();
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.register(form);
      setAuth({
        userId: res.userId,
        email: res.email,
        fullName: res.fullName,
        role: res.role,
      });
      router.push("/dashboard");
    } catch (err) {
      setErrors({
        general:
          err instanceof Error ? err.message : "Failed to create account",
      });
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="bg-card  border border-border p-8">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium  mb-1">Full Name</label>
          {errors.fullName && (
            <p className="mb-1.5  text-xs text-destructive">
              {errors.fullName}
            </p>
          )}
          <input
            type="text"
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            placeholder="John Doe"
            className="w-full px-3 py-2 border border-border  text-sm
                           focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                           placeholder:text-muted-foreground"
          />
        </div>

        <div>
          <label className="block text-sm font-medium  mb-1">Email</label>
          {errors.email && (
            <p className="mb-1.5  text-xs text-destructive">{errors.email}</p>
          )}
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            className="w-full px-3 py-2 border border-border  text-sm
                           focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                           placeholder:text-muted-foreground"
          />
        </div>

        <div>
          <label className="block text-sm font-medium  mb-1">Password</label>
          {errors.password && (
            <p className="mb-1.5  text-xs text-destructive">
              {errors.password}
            </p>
          )}
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="At least 6 characters"
            className="w-full px-3 py-2 border border-border  text-sm
                           focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                           placeholder:text-muted-foreground"
            autoComplete="new-password"
          />
        </div>

        {errors.general && (
          <p className="text-sm text-destructive bg-destructive border border-border  px-3 py-2">
            {errors.general}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 bg-primary text-background hover:bg-primary/80
                         text-sm font-medium 
                         transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Creating your account..." : "Sign Up"}
        </button>
      </form>
    </div>
  );
};

export default RegisterForm;
