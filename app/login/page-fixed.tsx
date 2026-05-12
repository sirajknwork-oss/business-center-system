"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { signInWithEmail } from "@/modules/auth/authClient";
import { Logo } from "@/components/Logo";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const { data, error } = await signInWithEmail(email, password);
      if (error) {
        setMessage((error as Error).message || "Unable to login. Check your credentials.");
        setLoading(false);
        return;
      }
      
      window.location.href = "/dashboard";
    } catch (error: any) {
      setMessage(error?.message || "Login failed. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f4f0e8] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md rounded-[1.75rem] border border-[#dfd2b8] bg-white/95 p-8 shadow-xl">
        <div className="space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <Logo size={64} />
            <div className="text-center">
              <p className="text-sm uppercase tracking-[0.2em] text-[#7b5f19]">Noor al Huda Login</p>
              <h1 className="mt-3 text-3xl font-semibold text-slate-900">
                Sign in to
                <span className="block">Noor al Huda portal</span>
              </h1>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Enter your credentials to continue to Noor al Huda Typing & Photocopying Services L.L.C dashboard.
              </p>
            </div>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Email</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                placeholder="Enter your email"
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              />
            </label>
              
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Password</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              />
            </label>

            {message ? (
              <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{message}</p>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-[#333333] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#1f1f1f] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="text-sm text-slate-600">
            Test Accounts:<br/>
            admin@businesscenter.com / admin123<br/>
            staff@businesscenter.com / staff123<br/>
            customer1@businesscenter.com / customer123<br/>
            customer2@businesscenter.com / customer123
          </p>
        </div>
      </div>
    </div>
  );
}
