"use client";

import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { getCurrentUserInfo, type CurrentUserInfo } from "@/modules/auth/authClient";
import { createUserAccount, type CreatedUserPayload } from "@/modules/admin/adminClient";
import { getAdminUsers, type AdminUserStorage } from "@/modules/admin/adminStorageClient";

const generateUserId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return Math.random().toString(36).slice(2);
};

export default function AdminPageFinal() {
  const [userInfo, setUserInfo] = useState<CurrentUserInfo | null>(null);
  const [adminUsers, setAdminUsers] = useState<AdminUserStorage[]>([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState<CreatedUserPayload>({
    name: "",
    email: "",
    password: "",
    role: "admin",
    company_id: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const currentUser = await getCurrentUserInfo();
        setUserInfo(currentUser);

        const adminUsersData = await getAdminUsers();
        setAdminUsers(adminUsersData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load creator data");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-6 py-12">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
          <p className="text-lg font-medium text-slate-700">Loading creator data…</p>
        </div>
      </div>
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    console.log('📝 FINAL: Admin creation started:', formData);

    try {
      const createdUser = await createUserAccount(formData);
      console.log('✅ FINAL: Auth user created:', createdUser);
      
      const newUser = {
        id: generateUserId(),
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        company_id: formData.company_id || undefined,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      console.log('🔄 FINAL: Adding to adminUsers:', newUser);
      setAdminUsers([newUser, ...adminUsers]);
      console.log('✅ FINAL: Admin users updated. Total count:', adminUsers.length + 1);
      
      setFormData({ name: "", email: "", password: "", role: "admin", company_id: "" });
    } catch (err) {
      console.error('❌ FINAL: Admin creation failed:', err);
      setError(err instanceof Error ? err.message : "Failed to create user account");
    } finally {
      setSubmitting(false);
    }
  }

  const isCreator = userInfo?.role === "creator";

  if (!isCreator) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md rounded-[1.75rem] border border-slate-200 bg-white/95 p-8 shadow-xl text-center">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Access Denied</p>
          <h1 className="mt-4 text-3xl font-semibold text-slate-900">Creator Access Required</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Only designated creator account may manage admin and staff users.
          </p>
          <div className="mt-8">
            <a href="/dashboard" className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-700">
              Back to dashboard
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Creator Portal</p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900">FINAL Admin Creation Test</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Create admin users and see them appear immediately in the table below. This is the FINAL working version.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Create Admin User</h2>
            
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded">
                <p className="text-red-700">{error}</p>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Full Name</span>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                    className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
                  />
                </label>
              </div>
              
              <div>
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Email</span>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                    className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
                  />
                </label>
              </div>
              
              <div>
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Password</span>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    required
                    className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
                  />
                </label>
              </div>
              
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
              >
                {submitting ? "Creating..." : "Create Admin User"}
              </button>
            </form>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Admin Records</h2>
            
            {adminUsers.length === 0 ? (
              <p className="text-center text-slate-600">No admin records found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                  <tr className="border-b">
                    <th className="px-4 py-2 text-left border">Name</th>
                    <th className="px-4 py-2 text-left border">Email</th>
                    <th className="px-4 py-2 text-left border">Password</th>
                    <th className="px-4 py-2 text-left border">Role</th>
                  </tr>
                </thead>
                  <tbody>
                    {adminUsers.map((user) => (
                      <tr key={user.id} className="border-b">
                        <td className="px-4 py-2">{user.name}</td>
                        <td className="px-4 py-2">{user.email}</td>
                        <td className="px-4 py-2 font-mono text-sm bg-gray-100">{user.password}</td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
