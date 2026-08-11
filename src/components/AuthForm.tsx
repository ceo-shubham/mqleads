"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Logo } from "./Logo";
import { IconEye, IconEyeOff } from "./icons";

type Mode = "login" | "register";

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const isLogin = mode === "login";
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const body: Record<string, string> = {
      email: String(form.get("email") || ""),
      password: String(form.get("password") || ""),
    };
    if (!isLogin) {
      body.name = String(form.get("name") || "");
      body.companyName = String(form.get("companyName") || "");
    }
    try {
      const res = await fetch(`/api/auth/${isLogin ? "login" : "register"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Network error — please try again");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center">
          <Logo className="h-12 w-12" />
          <h1 className="mt-4 text-2xl font-bold text-slate-900">MQLeads</h1>
          <p className="mt-1 text-sm text-slate-500">
            {isLogin ? "Welcome back — log in to your workspace" : "Create your free workspace"}
          </p>
        </div>

        <form onSubmit={onSubmit} className="card space-y-4 p-6">
          {!isLogin && (
            <div>
              <label className="label" htmlFor="name">Your name</label>
              <input id="name" name="name" required minLength={2} className="input" placeholder="Shubham Pathak" />
            </div>
          )}
          <div>
            <label className="label" htmlFor="companyName">
              {isLogin ? "Company name (optional)" : "Company / agency name"}
            </label>
            <input
              id="companyName"
              name="companyName"
              required={!isLogin}
              className="input"
              placeholder="ZYANIX"
            />
          </div>
          <div>
            <label className="label" htmlFor="email">Work email</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="input"
              placeholder="official@zyanix.xyz"
            />
          </div>
          <div>
            <label className="label" htmlFor="password">
              Password{!isLogin && " (min 8 characters)"}
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                minLength={8}
                className="input pr-11"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                aria-label={showPassword ? "Hide password" : "Show password"}
                tabIndex={-1}
              >
                {showPassword ? <IconEyeOff className="h-4 w-4" /> : <IconEye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Please wait…" : isLogin ? "Log in" : "Create account"}
          </button>

          <p className="text-center text-sm text-slate-500">
            {isLogin ? (
              <>
                New to MQLeads?{" "}
                <Link href="/register" className="font-medium text-indigo-600 hover:underline">
                  Create an account
                </Link>
              </>
            ) : (
              <>
                Already registered?{" "}
                <Link href="/login" className="font-medium text-indigo-600 hover:underline">
                  Log in
                </Link>
              </>
            )}
          </p>
        </form>
      </div>
    </div>
  );
}
