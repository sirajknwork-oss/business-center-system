"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getCurrentUserInfo } from "@/modules/auth/authClient";
import { getEmployeesByRoles, type Employee } from "@/modules/employees/employeesClient";

export default function AdminPanelPage() {
  const [employees, setEmployees] = useState<(Employee & { companies?: { id: string; name: string } })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const currentUser = await getCurrentUserInfo();

        if (currentUser.role !== "creator" && currentUser.role !== "admin") {
          setError("Unauthorized");
          return;
        }

        const adminUsers = await getEmployeesByRoles(["admin"]);
        setEmployees(adminUsers);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load admin panel");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-6 py-12">
        <div className="rounded-3xl border border-slate-200 bg-white/95 px-8 py-10 shadow-xl">
          <p className="text-base text-slate-700">Loading admin panel…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md rounded-[1.75rem] border border-slate-200 bg-white/95 p-8 shadow-xl text-center">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Access Denied</p>
          <h1 className="mt-4 text-3xl font-semibold text-slate-900">Creator only</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">{error}</p>
          <div className="mt-8">
            <Link href="/admin" className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-700">
              Back to creator dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 px-6 py-12">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Admin Panel</p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900">Admin accounts</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              View all admin accounts created by the creator portal.
            </p>
          </div>
          <Link href="/admin" className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50">
            Back to creator dashboard
          </Link>
        </div>

        <div className="grid gap-4">
          {employees.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white/95 p-8 text-center shadow-xl">
              <p className="text-lg font-semibold text-slate-900">No admin accounts found</p>
              <p className="mt-2 text-sm text-slate-600">Create admin users from the creator portal.</p>
            </div>
          ) : (
            employees.map((employee) => (
              <div key={employee.id} className="rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-xl">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{employee.name}</h3>
                    <p className="mt-1 text-sm text-slate-600">{employee.email ?? "No email assigned"}</p>
                    {employee.companies && <p className="mt-2 text-sm text-slate-600">Company: {employee.companies.name}</p>}
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 uppercase">Admin</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
