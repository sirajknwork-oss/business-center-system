"use client";

import Link from "next/link";

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-[#f4f0e8] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md rounded-[1.75rem] border border-[#dfd2b8] bg-white/95 p-8 shadow-xl">
        <div className="space-y-6 text-center">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-[#7b5f19]">Signup Disabled</p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900">Account creation is managed by the company</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Signup is not available from the public site. Please contact your administrator for login credentials.
            </p>
          </div>

          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-2xl bg-[#333333] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#1f1f1f]"
          >
            Go to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
