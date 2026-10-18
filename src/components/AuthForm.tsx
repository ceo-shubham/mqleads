"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Logo } from "./Logo";
import { IconEye, IconEyeOff, BrandGoogle } from "./icons";
import { useToast } from "./Toast";

type Mode = "login" | "register";

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const { showToast } = useToast();
  const isLogin = mode === "login";
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlErr = params.get("error");
      if (urlErr) {
        setError(urlErr);
        showToast("Authentication Notice", urlErr, "error");
      }
    }
  }, [showToast]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const body: Record<string, string> = {
      email: String(form.get("email") || "").trim(),
      password: String(form.get("password") || ""),
    };
    if (!isLogin) {
      body.name = String(form.get("name") || "").trim();
      body.companyName = String(form.get("companyName") || "").trim();
    }
    try {
      const res = await fetch(`/api/auth/${isLogin ? "login" : "register"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Authentication failed");
        showToast("Authentication Error", data.error || "Please verify your credentials.", "error");
        return;
      }
      showToast("Success", isLogin ? "Welcome back to your workspace!" : "Workspace created successfully!");
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Network error — please verify your connection.");
      showToast("Network Error", "Could not reach server.", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50/70 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Subtle Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-tr from-indigo-500/15 via-violet-500/10 to-transparent blur-3xl -z-10 pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2.5 group">
          <Logo className="h-10 w-10 transition-transform group-hover:scale-105" />
          <div className="text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-extrabold tracking-tight text-slate-900">MQLeads</span>
              <span className="rounded-md bg-indigo-50 px-1.5 py-0.5 text-[10px] font-bold text-indigo-600 border border-indigo-100">
                PRO
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-400">Visitor Intelligence</p>
          </div>
        </Link>

        <h2 className="mt-6 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          {isLogin ? "Sign in to your workspace" : "Create your free workspace"}
        </h2>
        <p className="mt-1.5 text-xs text-slate-500 max-w-xs mx-auto">
          {isLogin
            ? "Access your live visitor attribution streams and leads pipeline."
            : "Connect your social sources and track warm intent in real time."}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="card p-6 sm:p-8 shadow-xl border-slate-200">
          {/* Continue with Google */}
          <a
            href="/api/auth/google"
            className="w-full flex items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-xs hover:bg-slate-50 hover:border-slate-400 transition-all group"
          >
            <BrandGoogle className="h-5 w-5 transition-transform group-hover:scale-105" />
            <span>Continue with Google</span>
          </a>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-slate-400 font-semibold tracking-wider">
                or continue with email
              </span>
            </div>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="label" htmlFor="name">
                  Your Full Name *
                </label>
                <input
                  id="name"
                  name="name"
                  required
                  minLength={2}
                  className="input"
                  placeholder="Rahul Sharma"
                />
              </div>
            )}

            {!isLogin && (
              <div>
                <label className="label" htmlFor="companyName">
                  Company / Agency Name *
                </label>
                <input
                  id="companyName"
                  name="companyName"
                  required
                  className="input"
                  placeholder="Acme Global Marketing"
                />
              </div>
            )}

            <div>
              <label className="label" htmlFor="email">
                Work Email Address *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="input"
                placeholder="name@company.com"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="label" htmlFor="password">
                  Password * {!isLogin && "(min 8 characters)"}
                </label>
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  className="input pr-11 font-mono text-sm"
                  placeholder="••••••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  tabIndex={-1}
                >
                  {showPassword ? <IconEyeOff className="h-4 w-4" /> : <IconEye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 text-sm shadow-sm">
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-3.5 w-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Please wait...
                </span>
              ) : isLogin ? (
                "Sign In"
              ) : (
                "Create Free Account"
              )}
            </button>

            <div className="text-center pt-2">
              <p className="text-xs text-slate-500">
                {isLogin ? (
                  <>
                    Don&apos;t have an account yet?{" "}
                    <Link href="/register" className="font-bold text-indigo-600 hover:underline">
                      Create a workspace free
                    </Link>
                  </>
                ) : (
                  <>
                    Already registered?{" "}
                    <Link href="/login" className="font-bold text-indigo-600 hover:underline">
                      Sign in to workspace
                    </Link>
                  </>
                )}
              </p>
            </div>
          </form>
        </div>

        <div className="mt-8 text-center text-xs text-slate-400 flex items-center justify-center gap-4">
          <Link href="/privacy" className="hover:underline">
            Privacy Policy
          </Link>
          <span>·</span>
          <Link href="/terms" className="hover:underline">
            Terms of Service
          </Link>
        </div>
      </div>
    </div>
  );
}
