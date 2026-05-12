"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { FormEvent } from "react";
import { getStoreItems, createStoreItem, type StoreItem } from "@/modules/store/storeClient";
import { getCurrentUserInfo, type CurrentUserInfo } from "@/modules/auth/authClient";
import { getEmployeeByEmail } from "@/modules/employees/employeesClient";
import { Header } from "@/components/Header";

export default function StorePage() {
  const [items, setItems] = useState<StoreItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<CurrentUserInfo | null>(null);
  const [resolvedCompanyId, setResolvedCompanyId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ 
    name: "", 
    description: "", 
    price: 0, 
    stock_quantity: 0, 
    category: "general" 
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const currentUser = await getCurrentUserInfo();
        setUserInfo(currentUser);

        let companyId = currentUser.companyId;
        if (!companyId && currentUser.email) {
          const employee = await getEmployeeByEmail(currentUser.email);
          if (employee?.company_id) {
            companyId = employee.company_id;
          }
        }

        setResolvedCompanyId(companyId ?? null);

        const canManageAll = currentUser.role === "admin" || currentUser.role === "creator";
        const itemsData = canManageAll
          ? await getStoreItems()
          : companyId
          ? await getStoreItems(companyId)
          : [];

        setItems(itemsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load store data");
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

    try {
      const newItem = await createStoreItem({
        name: formData.name,
        description: formData.description || undefined,
        price: formData.price,
        stock_quantity: formData.stock_quantity,
        category: formData.category,
        company_id: resolvedCompanyId || undefined,
      });
      setItems([newItem, ...items]);
      setFormData({ 
        name: "", 
        description: "", 
        price: 0, 
        stock_quantity: 0, 
        category: "general" 
      });
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create store item");
    } finally {
      setSubmitting(false);
    }
  }

  const role = userInfo?.role;
  const isAdmin = role === "admin" || role === "creator";
  const canView = isAdmin || ["staff", "company", "individual", "customer"].includes(role ?? "");
  const noCompanyAssigned = !isAdmin && !resolvedCompanyId;

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-6 py-12">
        <div className="rounded-3xl border border-slate-200 bg-white/95 px-8 py-10 shadow-xl">
          <p className="text-base text-slate-700">Loading store…</p>
        </div>
      </div>
    );
  }

  if (!canView) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md rounded-[1.75rem] border border-slate-200 bg-white/95 p-8 shadow-xl text-center">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Access Denied</p>
          <h1 className="mt-4 text-3xl font-semibold text-slate-900">Unauthorized</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Your account does not have access to the store module.
          </p>
          <div className="mt-8">
            <Link href="/dashboard" className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-700">
              Back to dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (noCompanyAssigned) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md rounded-[1.75rem] border border-slate-200 bg-white/95 p-8 shadow-xl text-center">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Company Missing</p>
          <h1 className="mt-4 text-3xl font-semibold text-slate-900">No company linked</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Your account is not assigned to a company yet. Please ask the administrator to assign your account.
          </p>
          <div className="mt-8">
            <Link href="/dashboard" className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-700">
              Back to dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <Header showBackButton={true} />
      <div className="px-6 py-12">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Store</p>
              <h1 className="mt-3 text-3xl font-semibold text-slate-900">Store Management</h1>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {isAdmin
                  ? "Manage store inventory and items for your business."
                  : "View and manage store items for your company."}
              </p>
            </div>
            <div className="flex gap-3">
              {isAdmin && (
                <button
                  onClick={() => setShowForm(!showForm)}
                  className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
                >
                  {showForm ? "Cancel" : "Add Item"}
                </button>
              )}
              <Link href="/dashboard" className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50">
                Back to dashboard
              </Link>
            </div>
          </div>

          {error && (
            <div className="mb-6 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {showForm && isAdmin && (
            <div className="mb-8 rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-xl">
              <h2 className="text-xl font-semibold text-slate-900">Add New Store Item</h2>
              <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Item Name</span>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                    required
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Description (Optional)</span>
                  <textarea
                    value={formData.description}
                    onChange={(event) => setFormData({ ...formData, description: event.target.value })}
                    rows={3}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                  />
                </label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-sm font-medium text-slate-700">Price</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={(event) => setFormData({ ...formData, price: parseFloat(event.target.value) })}
                      required
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium text-slate-700">Stock Quantity</span>
                    <input
                      type="number"
                      min="0"
                      value={formData.stock_quantity}
                      onChange={(event) => setFormData({ ...formData, stock_quantity: parseInt(event.target.value) })}
                      required
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                    />
                  </label>
                </div>
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Category</span>
                  <select
                    value={formData.category}
                    onChange={(event) => setFormData({ ...formData, category: event.target.value })}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                  >
                    <option value="general">General</option>
                    <option value="electronics">Electronics</option>
                    <option value="office">Office Supplies</option>
                    <option value="printing">Printing Materials</option>
                    <option value="stationery">Stationery</option>
                    <option value="services">Services</option>
                  </select>
                </label>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? "Creating..." : "Add Item"}
                </button>
              </form>
            </div>
          )}

          <div className="grid gap-4">
            {items.length === 0 ? (
              <div className="rounded-3xl border border-slate-200 bg-white/95 p-8 text-center shadow-xl">
                <p className="text-lg font-semibold text-slate-900">No store items found</p>
                <p className="mt-2 text-sm text-slate-600">Add items to start managing your store inventory.</p>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-xl">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">{item.name}</h3>
                      {item.description && (
                        <p className="mt-1 text-sm text-slate-600">{item.description}</p>
                      )}
                      <div className="mt-2 flex items-center gap-4 text-sm text-slate-600">
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                          {item.stock_quantity} in stock
                        </span>
                        <span className="text-slate-900">₹{item.price.toFixed(2)}</span>
                        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 capitalize">
                          {item.category}
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-slate-500">
                        Added {new Date(item.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    {isAdmin && (
                      <div className="flex gap-2">
                        <button className="rounded-2xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-900 hover:bg-slate-50">
                          Edit
                        </button>
                        <button className="rounded-2xl border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50">
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
