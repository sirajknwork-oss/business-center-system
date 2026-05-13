"use client";

import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { getCurrentUserInfo, type CurrentUserInfo } from "@/modules/auth/authClient";
import { getCompanies, type Company } from "@/modules/companies/companiesClient";
import { createUserAccount, type CreatedUserPayload } from "@/modules/admin/adminClient";
import { getAdminUsers, updateAdminUser, deleteAdminUser, type AdminUserStorage } from "@/modules/admin/adminStorageClient";

export const dynamic = 'force-dynamic'

const generateUserId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return Math.random().toString(36).slice(2);
};

export default function AdminPageFinal() {
  const [userInfo, setUserInfo] = useState<CurrentUserInfo | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminUserStorage[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<"admin" | "staff" | "customer">("admin");
  const [formData, setFormData] = useState<CreatedUserPayload & { customer_type?: string }>({
    name: "",
    email: "",
    password: "",
    role: "admin",
    company_id: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<AdminUserStorage | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const currentUser = await getCurrentUserInfo();
        setUserInfo(currentUser);

        const [companiesData, adminUsersData] = await Promise.all([
          getCompanies(),
          getAdminUsers(),
        ]);

        setCompanies(companiesData);
        setAdminUsers(adminUsersData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load creator data");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    if (editingUser) {
      await handleUpdate();
      return;
    }

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
        customer_type: (formData.customer_type as "company" | "individual") || undefined,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      console.log('🔄 FINAL: Adding to adminUsers:', newUser);
      setAdminUsers([newUser, ...adminUsers]);
      console.log('✅ FINAL: Admin users updated. Total count:', adminUsers.length + 1);
      
      setFormData({ name: "", email: "", password: "", role: activeSection, company_id: "", customer_type: "" });
    } catch (err) {
      console.error('❌ FINAL: Admin creation failed:', err);
      setError(err instanceof Error ? err.message : "Failed to create user account");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleEdit(user: AdminUserStorage) {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: user.password,
      role: user.role,
      company_id: user.company_id || "",
      customer_type: user.customer_type || ""
    });
  }

  async function handleUpdate() {
    if (!editingUser) return;
    
    setSubmitting(true);
    setError(null);

    try {
      const updatedUser = await updateAdminUser(editingUser.id, {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role as "admin" | "staff" | "customer",
        company_id: formData.company_id || undefined,
        customer_type: (formData.customer_type as "company" | "individual") || undefined
      });
      
      setAdminUsers(adminUsers.map(user => 
        user.id === editingUser.id ? updatedUser : user
      ));
      
      setEditingUser(null);
      setFormData({ name: "", email: "", password: "", role: activeSection, company_id: "", customer_type: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update user");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(userId: string) {
    setSubmitting(true);
    setError(null);

    try {
      await deleteAdminUser(userId);
      setAdminUsers(adminUsers.filter(user => user.id !== userId));
      setShowDeleteConfirm(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete user");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-6 py-12">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
          <p className="text-lg font-medium text-slate-700">Loading creator data…</p>
        </div>
      </div>
    );
  }

  const isCreator = userInfo?.role === "creator";

  // Only Creator can manage users and view full details
  if (!isCreator) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md rounded-[1.75rem] border border-slate-200 bg-white/95 p-8 shadow-xl text-center">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Access Denied</p>
          <h1 className="mt-4 text-3xl font-semibold text-slate-900">Creator Access Required</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Only designated creator account may manage users and view full details.
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
        <div className="mb-6">
          <div className="flex space-x-4 border-b border-slate-200">
            <button
              onClick={() => setActiveSection("admin")}
              className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
                activeSection === "admin"
                  ? "border-slate-900 text-slate-900"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              Admin Users
            </button>
            <button
              onClick={() => setActiveSection("staff")}
              className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
                activeSection === "staff"
                  ? "border-slate-900 text-slate-900"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              Staff Users
            </button>
            <button
              onClick={() => setActiveSection("customer")}
              className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
                activeSection === "customer"
                  ? "border-slate-900 text-slate-900"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              Customer Logins
            </button>
          </div>
        </div>
        <div className="mb-8">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Creator Portal</p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900">User Management System</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Complete User Management System - Create Admin, Staff, and Customer users with proper role assignments.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">
              {editingUser ? (
                `Update ${activeSection === "admin" ? "Admin" : activeSection === "staff" ? "Staff" : "Customer"} User`
              ) : (
                activeSection === "admin" ? "Create Admin User" :
                activeSection === "staff" ? "Create Staff User" :
                "Create Customer Login"
              )}
            </h2>
            
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
                  <span className="text-sm font-medium text-slate-700">User Role</span>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value as "admin" | "staff" | "customer"})}
                    className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
                  >
                    {activeSection === "admin" && <option value="admin">Admin</option>}
                    {activeSection === "staff" && <option value="staff">Staff</option>}
                    {activeSection === "customer" && <option value="customer">Customer</option>}
                  </select>
                </label>
              </div>
              
              {activeSection === "customer" && (
                <div>
                  <label className="block">
                    <span className="text-sm font-medium text-slate-700">Customer Type</span>
                    <select
                      value={formData.customer_type || ""}
                      onChange={(e) => setFormData({...formData, customer_type: e.target.value})}
                      className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
                      required
                    >
                      <option value="">Select Type</option>
                      <option value="company">Company</option>
                      <option value="individual">Individual</option>
                    </select>
                  </label>
                </div>
              )}
              
              {activeSection === "customer" && formData.customer_type === "company" && (
                <div>
                  <label className="block">
                    <span className="text-sm font-medium text-slate-700">Select Company</span>
                    <select
                      value={formData.company_id || ""}
                      onChange={(e) => setFormData({...formData, company_id: e.target.value})}
                      className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
                      required
                    >
                      <option value="">Select Company</option>
                      {companies.map((company) => (
                        <option key={company.id} value={company.id}>
                          {company.company_name}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              )}
              
              {activeSection !== "customer" && (
                <div>
                  <label className="block">
                    <span className="text-sm font-medium text-slate-700">Company</span>
                    <select
                      value={formData.company_id}
                      onChange={(e) => setFormData({...formData, company_id: e.target.value})}
                      className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
                    >
                      <option value="">Select Company (Optional)</option>
                      {companies.map((company) => (
                        <option key={company.id} value={company.id}>
                          {company.company_name}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              )}
              
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
                {submitting ? (editingUser ? "Updating..." : "Creating...") : (
                  editingUser ? (
                    `Update ${activeSection === "admin" ? "Admin" : activeSection === "staff" ? "Staff" : "Customer"}`
                  ) : (
                    activeSection === "admin" ? "Create Admin User" :
                    activeSection === "staff" ? "Create Staff User" :
                    "Create Customer Login"
                  )
                )}
              </button>
              
              {editingUser && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingUser(null);
                    setFormData({ name: "", email: "", password: "", role: activeSection, company_id: "", customer_type: "" });
                  }}
                  className="w-full bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 disabled:opacity-50 mt-2"
                >
                  Cancel Edit
                </button>
              )}
            </form>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">
              {activeSection === "admin" && "Admin Records"}
              {activeSection === "staff" && "Staff Records"}
              {activeSection === "customer" && "Customer Logins"}
            </h2>
            
            {adminUsers.length === 0 ? (
              <p className="text-center text-slate-600">
                {activeSection === "admin" && "No admin records found"}
                {activeSection === "staff" && "No staff records found"}
                {activeSection === "customer" && "No customer logins found"}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                  <tr className="border-b">
                    <th className="px-4 py-2 text-left border">Name</th>
                    <th className="px-4 py-2 text-left border">Email</th>
                    <th className="px-4 py-2 text-left border">Password</th>
                    <th className="px-4 py-2 text-left border">Role</th>
                    <th className="px-4 py-2 text-left border">Type</th>
                    <th className="px-4 py-2 text-left border">Company</th>
                    <th className="px-4 py-2 text-left border">Actions</th>
                  </tr>
                </thead>
                  <tbody>
                    {adminUsers
                      .filter(user => user.role === activeSection)
                      .map((user) => (
                      <tr key={user.id} className="border-b">
                        <td className="px-4 py-2">{user.name}</td>
                        <td className="px-4 py-2">{user.email}</td>
                        <td className="px-4 py-2 font-mono text-sm bg-gray-100">{user.password}</td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                            user.role === 'staff' ? 'bg-green-100 text-green-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-4 py-2">
                          <span className="text-xs text-slate-600">
                            {activeSection === "customer" ? (
                              user.customer_type === "company" ? "Company" : "Individual"
                            ) : (
                              "-"
                            )}
                          </span>
                        </td>
                        <td className="px-4 py-2">
                          {user.company_id ? (
                            companies.find(c => c.id === user.company_id)?.company_name || "Unknown"
                          ) : (
                            <span className="text-slate-400">
                              {activeSection === "customer" && user.customer_type === "individual" ? "Individual" : "No Company"}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(user)}
                              className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => setShowDeleteConfirm(user.id)}
                              className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
        
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
              <h3 className="text-lg font-semibold text-red-600 mb-2">Confirm Delete</h3>
              <p className="text-sm text-gray-600 mb-4">
                Are you sure you want to delete this user? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => handleDelete(showDeleteConfirm)}
                  disabled={submitting}
                  className="flex-1 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50"
                >
                  {submitting ? "Deleting..." : "Delete"}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
