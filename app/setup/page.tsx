"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function SetupPage() {
  const [databaseReady, setDatabaseReady] = useState(false);
  const [checking, setChecking] = useState(true);

  const sqlSetup = `-- Create companies table
CREATE TABLE IF NOT EXISTS public.companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE,
  name TEXT NOT NULL,
  ded_number TEXT,
  username TEXT,
  password TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create employees table
CREATE TABLE IF NOT EXISTS public.employees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'staff',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create expiry_items table
CREATE TABLE IF NOT EXISTS public.expiry_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  expires_at DATE NOT NULL,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create store_items table
CREATE TABLE IF NOT EXISTS public.store_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  category TEXT NOT NULL DEFAULT 'general',
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expiry_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_items ENABLE ROW LEVEL SECURITY;`;

  useEffect(() => {
    checkDatabase();
  }, []);

  async function checkDatabase() {
    try {
      const response = await fetch("/api/bootstrap/check-tables", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      setDatabaseReady(data.ready || false);
    } catch (err) {
      console.error("Failed to check database:", err);
      setDatabaseReady(false);
    } finally {
      setChecking(false);
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-6 py-12">
        <div className="rounded-3xl border border-slate-200 bg-white/95 px-8 py-10 shadow-xl">
          <p className="text-base text-slate-700">Checking database setup…</p>
        </div>
      </div>
    );
  }

  if (databaseReady) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md rounded-3xl border border-green-200 bg-white/95 p-8 shadow-xl text-center">
          <div className="text-4xl mb-4">✅</div>
          <h1 className="text-2xl font-semibold text-slate-900">Database Ready</h1>
          <p className="mt-4 text-sm text-slate-600">
            Your database has been successfully set up. You can now proceed to manage admins and staff.
          </p>
          <Link
            href="/admin"
            className="mt-8 inline-block rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-700"
          >
            Go to Admin Panel
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 px-6 py-12">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-3xl border border-amber-200 bg-amber-50/50 p-8 shadow-xl">
          <div className="flex gap-4">
            <div className="text-3xl">⚙️</div>
            <div className="flex-1">
              <h1 className="text-2xl font-semibold text-slate-900">Database Setup Required</h1>
              <p className="mt-2 text-sm text-slate-600">
                The database tables need to be created before you can manage admin and staff accounts.
              </p>
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="font-semibold text-slate-900">Steps to Complete Setup:</h2>
            <ol className="mt-4 space-y-3 text-sm text-slate-700">
              <li className="flex gap-3">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-slate-900 text-white text-xs font-semibold">
                  1
                </span>
                <span>
                  Go to your <a href="https://app.supabase.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    Supabase Dashboard
                  </a>
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-slate-900 text-white text-xs font-semibold">
                  2
                </span>
                <span>Select your project and navigate to <strong>SQL Editor</strong></span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-slate-900 text-white text-xs font-semibold">
                  3
                </span>
                <span>Click <strong>&quot;New Query&quot;</strong> and paste the SQL below</span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-slate-900 text-white text-xs font-semibold">
                  4
                </span>
                <span>Click <strong>&quot;Run&quot;</strong> to execute the SQL</span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-slate-900 text-white text-xs font-semibold">
                  5
                </span>
                <span>Return here and click <strong>&quot;Retry&quot;</strong></span>
              </li>
            </ol>
          </div>

          <div className="mt-8">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">SQL Setup Script:</h3>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(sqlSetup);
                  alert("SQL copied to clipboard!");
                }}
                className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-700"
              >
                Copy SQL
              </button>
            </div>
            <pre className="mt-4 overflow-x-auto rounded-lg bg-slate-900 p-4 text-xs text-slate-100 font-mono max-h-96">
{sqlSetup}
            </pre>
          </div>

          <div className="mt-8 flex gap-4">
            <button
              onClick={checkDatabase}
              className="flex-1 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-700"
            >
              Retry Database Check
            </button>
            <Link
              href="/dashboard"
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
