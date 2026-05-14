"use client";

export const dynamic = 'force-dynamic'

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getCurrentUserInfo, signOut, hasPermission } from "@/modules/auth/authClient";
import { createUser, updateUser, deleteUser, getUsersByRole, type User } from "@/modules/auth/userStorageClient";
import { Header } from "@/components/Header";

export default function UsersPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-6 py-12">
        <div className="rounded-3xl border border-slate-200 bg-white/95 px-8 py-10 shadow-xl">
          <p className="text-base text-slate-700">Loading user management…</p>
        </div>
      </div>
    }>
      <UsersContent />
    </Suspense>
  )
}

function UsersContent() {
  const searchParams = useSearchParams();
  const [userInfo, setUserInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"admins" | "staff" | "customers">(
    (searchParams.get('tab') as "admins" | "staff" | "customers") || "staff"
  );

  useEffect(() => {
    async function loadUserData() {
      try {
        const currentUser = await getCurrentUserInfo();
        setUserInfo(currentUser);
      } catch (error) {
        console.error("Error loading user data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadUserData();
  }, []);

  useEffect(() => {
    const tab = searchParams.get('tab') as "admins" | "staff" | "customers" | null;
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  async function handleSignOut() {
    await signOut();
    window.location.href = "/login";
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-6 py-12">
        <div className="rounded-3xl border border-slate-200 bg-white/95 px-8 py-10 shadow-xl">
          <p className="text-base text-slate-700">Loading user management…</p>
        </div>
      </div>
    );
  }

  // Check if user has access to this page
  if (!hasPermission(userInfo?.role || '', 'users', 'read')) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-6 py-12">
        <div className="rounded-3xl border border-slate-200 bg-white/95 px-8 py-10 shadow-xl">
          <p className="text-base text-slate-700">Access Denied</p>
          <Link href="/dashboard" className="mt-4 inline-block text-blue-600 hover:text-blue-800">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <Header showBackButton={true} />
      <div className="px-6 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
                <p className="mt-1 text-sm text-slate-600">
                  Manage {userInfo?.role === 'creator' ? 'admins, staff, and customers' : 'staff and customers'}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => window.location.href = "/dashboard"}
                  className="rounded-2xl border border-slate-200 p-2 hover:bg-slate-50 transition-colors"
                  title="Go Back"
                >
                  <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={handleSignOut}
                  className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="mb-8 rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-xl">
            <div className="flex gap-4 border-b border-slate-200">
              {userInfo?.role === 'creator' && (
                <button
                  onClick={() => setActiveTab("admins")}
                  className={`pb-3 px-4 text-sm font-semibold transition ${
                    activeTab === "admins"
                      ? "border-b-2 border-blue-500 text-blue-600"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Admin Users
                </button>
              )}
              <button
                onClick={() => setActiveTab("staff")}
                className={`pb-3 px-4 text-sm font-semibold transition ${
                  activeTab === "staff"
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Staff Users
              </button>
              <button
                onClick={() => setActiveTab("customers")}
                className={`pb-3 px-4 text-sm font-semibold transition ${
                  activeTab === "customers"
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Customer Users
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-xl">
            {activeTab === "admins" && userInfo?.role === 'creator' && (
              <AdminUsersTab />
            )}
            {activeTab === "staff" && (
              <StaffUsersTab userRole={userInfo?.role} currentUserEmail={userInfo?.email} />
            )}
            {activeTab === "customers" && (
              <CustomerUsersTab userRole={userInfo?.role} currentUserEmail={userInfo?.email} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Admin Users Tab (Creator only)
function AdminUsersTab() {
  const [admins, setAdmins] = useState<User[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    password: "",
    confirmPassword: ""
  });

  useEffect(() => {
    // Load actual admin users from storage
    const adminUsers = getUsersByRole('admin');
    setAdmins(adminUsers);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords don't match");
      return;
    }

    if (editingAdmin) {
      handleUpdate();
      return;
    }

    try {
      // Create actual admin user in storage
      const newAdmin = createUser({
        email: formData.email,
        name: formData.name,
        password: formData.password,
        role: 'admin',
        status: 'active',
        assignedCompanies: [],
        created_by: 'creator'
      });

      // Update local state to show the new admin
      setAdmins([...admins, newAdmin]);
      setFormData({ email: "", name: "", password: "", confirmPassword: "" });
      setShowForm(false);
      
      alert('Admin user created successfully! They can now login with their credentials.');
    } catch (error) {
      alert('Error creating admin user: ' + (error as Error).message);
    }
  }

  // Handle edit button click
  function handleEdit(admin: User) {
    setEditingAdmin(admin);
    setFormData({
      email: admin.email,
      name: admin.name,
      password: "",
      confirmPassword: ""
    });
    setShowForm(true);
  }

  // Handle update
  function handleUpdate() {
    if (!editingAdmin) return;

    try {
      const updateData: any = {
        name: formData.name
      };

      // Only update password if provided
      if (formData.password) {
        updateData.password = formData.password;
      }

      const updatedAdmin = updateUser(editingAdmin.id, updateData);
      
      if (updatedAdmin) {
        setAdmins(admins.map(a => a.id === editingAdmin.id ? updatedAdmin : a));
        setFormData({ email: "", name: "", password: "", confirmPassword: "" });
        setEditingAdmin(null);
        setShowForm(false);
        
        alert('Admin user updated successfully!');
      }
    } catch (error) {
      alert('Error updating admin user: ' + (error as Error).message);
    }
  }

  // Handle delete
  function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this admin user? This action cannot be undone.')) {
      return;
    }

    try {
      const success = deleteUser(id);
      if (success) {
        setAdmins(admins.filter(a => a.id !== id));
        alert('Admin user deleted successfully!');
      }
    } catch (error) {
      alert('Error deleting admin user: ' + (error as Error).message);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-slate-900">Admin Users</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Add Admin
        </button>
      </div>

      {showForm && (
        <div className="mb-6 rounded-2xl border border-blue-200 bg-blue-50 p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-lg font-semibold text-blue-900">
              {editingAdmin ? 'Edit Admin User' : 'Add New Admin User'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                  required
                  readOnly={!!editingAdmin}
                  placeholder={editingAdmin ? "Email cannot be changed" : "Enter email"}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                  required={!editingAdmin}
                  placeholder={editingAdmin ? "Leave blank to keep current password" : "Enter password"}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                  required={!editingAdmin}
                  placeholder={editingAdmin ? "Leave blank to keep current password" : "Confirm password"}
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                {editingAdmin ? 'Update Admin' : 'Create Admin'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingAdmin(null);
                  setFormData({ email: "", name: "", password: "", confirmPassword: "" });
                }}
                className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-3">
        {admins.map((admin) => (
          <div key={admin.id} className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-900">{admin.name}</div>
                <div className="text-sm text-slate-600">{admin.email}</div>
                <div className="text-xs text-slate-500 mt-1">Created: {admin.created_at}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                  {admin.status}
                </span>
                <button 
                  onClick={() => handleEdit(admin)}
                  className="rounded-2xl border border-slate-200 px-3 py-1 text-sm text-slate-900 hover:bg-slate-50"
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleDelete(admin.id)}
                  className="rounded-2xl border border-red-200 px-3 py-1 text-sm text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Staff Users Tab
function StaffUsersTab({ userRole, currentUserEmail }: { userRole: string; currentUserEmail?: string }) {
  const [staff, setStaff] = useState<User[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState<User | null>(null);
  const [companies, setCompanies] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    password: "",
    confirmPassword: "",
    assignedCompanies: [] as string[]
  });

  useEffect(() => {
    // Load actual staff users from storage
    const staffUsers = getUsersByRole('staff');
    setStaff(staffUsers);
    
    // Load actual companies from system
    const loadCompanies = async () => {
      const { getCompanies } = await import('@/modules/companies/companiesClient');
      const allCompanies = await getCompanies();
      setCompanies(allCompanies);
    };
    loadCompanies();
    
    // Set up periodic refresh to ensure data consistency
    const interval = setInterval(() => {
      const refreshedStaff = getUsersByRole('staff');
      setStaff(refreshedStaff);
    }, 2000); // Refresh every 2 seconds
    
    return () => clearInterval(interval);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords don't match");
      return;
    }

    if (editingStaff) {
      handleUpdate();
      return;
    }

    try {
      // Create actual staff user in storage
      const newStaff = createUser({
        email: formData.email,
        name: formData.name,
        password: formData.password,
        role: 'staff',
        status: 'active',
        assignedCompanies: formData.assignedCompanies, // Allow company assignment now
        created_by: currentUserEmail || 'admin'
      });

      // Update local state to show the new staff
      setStaff([...staff, newStaff]);
      
      // Refresh staff list from storage to ensure data consistency
      setTimeout(() => {
        const refreshedStaff = getUsersByRole('staff');
        setStaff(refreshedStaff);
      }, 100);
      
      setFormData({ email: "", name: "", password: "", confirmPassword: "", assignedCompanies: [] });
      setShowForm(false);
      
      alert('Staff member created successfully! They can now login with their credentials.');
    } catch (error) {
      alert('Error creating staff member: ' + (error as Error).message);
    }
  }

  // Handle edit button click
  function handleEdit(staffUser: User) {
    setEditingStaff(staffUser);
    setFormData({
      email: staffUser.email,
      name: staffUser.name,
      password: "",
      confirmPassword: "",
      assignedCompanies: staffUser.assignedCompanies || []
    });
    setShowForm(true);
  }

  // Handle update
  function handleUpdate() {
    if (!editingStaff) return;

    try {
      const updateData: any = {
        name: formData.name,
        assignedCompanies: formData.assignedCompanies
      };

      // Only update password if provided
      if (formData.password) {
        updateData.password = formData.password;
      }

      const updatedStaff = updateUser(editingStaff.id, updateData);
      
      if (updatedStaff) {
        // Update local state and also refresh from storage to ensure consistency
        setStaff(staff.map(s => s.id === editingStaff.id ? updatedStaff : s));
        
        // Refresh staff list from storage to ensure data consistency
        setTimeout(() => {
          const refreshedStaff = getUsersByRole('staff');
          setStaff(refreshedStaff);
        }, 100);
        
        setFormData({ email: "", name: "", password: "", confirmPassword: "", assignedCompanies: [] });
        setEditingStaff(null);
        setShowForm(false);
        
        alert('Staff member updated successfully!');
      }
    } catch (error) {
      alert('Error updating staff member: ' + (error as Error).message);
    }
  }

  // Handle delete
  function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this staff member? This action cannot be undone.')) {
      return;
    }

    try {
      const success = deleteUser(id);
      if (success) {
        setStaff(staff.filter(s => s.id !== id));
        alert('Staff member deleted successfully!');
      }
    } catch (error) {
      alert('Error deleting staff member: ' + (error as Error).message);
    }
  }

  function handleCompanyToggle(companyCode: string) {
    setFormData({
      ...formData,
      assignedCompanies: formData.assignedCompanies.includes(companyCode)
        ? formData.assignedCompanies.filter(c => c !== companyCode)
        : [...formData.assignedCompanies, companyCode]
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-slate-900">Staff Users</h2>
        {hasPermission(userRole, 'staff', 'create') && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Add Staff
          </button>
        )}
      </div>

      {showForm && (
        <div className="mb-6 rounded-2xl border border-blue-200 bg-blue-50 p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-lg font-semibold text-blue-900">
              {editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                  required
                  readOnly={!!editingStaff}
                  placeholder={editingStaff ? "Email cannot be changed" : "Enter email"}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                  required={!editingStaff}
                  placeholder={editingStaff ? "Leave blank to keep current password" : "Enter password"}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                  required={!editingStaff}
                  placeholder={editingStaff ? "Leave blank to keep current password" : "Confirm password"}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Assign Companies</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {companies.map((company: any) => (
                  <label key={company.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.assignedCompanies.includes(company.company_code || company.id)}
                      onChange={() => handleCompanyToggle(company.company_code || company.id)}
                      className="rounded border-slate-300"
                    />
                    <span className="text-sm">{company.company_name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                {editingStaff ? 'Update Staff' : 'Create Staff'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingStaff(null);
                  setFormData({ email: "", name: "", password: "", confirmPassword: "", assignedCompanies: [] });
                }}
                className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-3">
        {staff.map((staffUser) => (
          <div key={staffUser.id} className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-900">{staffUser.name}</div>
                <div className="text-sm text-slate-600">{staffUser.email}</div>
                <div className="text-xs text-slate-500 mt-1">
                  Assigned: {
                    staffUser.assignedCompanies && staffUser.assignedCompanies.length > 0
                      ? staffUser.assignedCompanies.map(companyCode => {
                          const company = companies.find((c: any) => (c.company_code || c.id) === companyCode);
                          return company ? company.company_name : companyCode;
                        }).join(", ")
                      : "None"
                  }
                </div>
                <div className="text-xs text-slate-500">Created: {staffUser.created_at}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                  {staffUser.status}
                </span>
                {hasPermission(userRole, 'staff', 'update') && (
                  <button 
                    onClick={() => handleEdit(staffUser)}
                    className="rounded-2xl border border-slate-200 px-3 py-1 text-sm text-slate-900 hover:bg-slate-50"
                  >
                    Edit
                  </button>
                )}
                {hasPermission(userRole, 'staff', 'delete') && (
                  <button 
                    onClick={() => handleDelete(staffUser.id)}
                    className="rounded-2xl border border-red-200 px-3 py-1 text-sm text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Customer Users Tab
function CustomerUsersTab({ userRole, currentUserEmail }: { userRole: string; currentUserEmail?: string }) {
  const [customers, setCustomers] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    password: "",
    confirmPassword: "",
    assignedCompanies: [] as string[]
  });

  const sampleCompanies = [
    { code: "C-11000", name: "Al Falah Business Center" },
    { code: "C-11001", name: "Gulf Star Typing Services" },
    { code: "C-11002", name: "Emirates Business Solutions" }
  ];

  useEffect(() => {
    // Load actual customer users from storage
    const customerUsers = getUsersByRole('customer');
    setCustomers(customerUsers);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords don't match");
      return;
    }

    try {
      // Create actual customer user in storage
      const newCustomer = createUser({
        email: formData.email,
        name: formData.name,
        password: formData.password,
        role: 'customer',
        status: 'active',
        assignedCompanies: formData.assignedCompanies,
        created_by: currentUserEmail || 'admin'
      });

      // Update local state to show the new customer
      setCustomers([...customers, newCustomer]);
      setFormData({ email: "", name: "", password: "", confirmPassword: "", assignedCompanies: [] });
      setShowForm(false);
      
      alert('Customer created successfully! They can now login with their credentials.');
    } catch (error) {
      alert('Error creating customer: ' + (error as Error).message);
    }
  }

  function handleCompanyToggle(companyCode: string) {
    setFormData({
      ...formData,
      assignedCompanies: formData.assignedCompanies.includes(companyCode)
        ? formData.assignedCompanies.filter(c => c !== companyCode)
        : [...formData.assignedCompanies, companyCode]
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-slate-900">Customer Users</h2>
        {hasPermission(userRole, 'customers', 'create') && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Add Customer
          </button>
        )}
      </div>

      {showForm && (
        <div className="mb-6 rounded-2xl border border-blue-200 bg-blue-50 p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Assign Companies</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {sampleCompanies.map((company) => (
                  <label key={company.code} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.assignedCompanies.includes(company.code)}
                      onChange={() => handleCompanyToggle(company.code)}
                      className="rounded border-slate-300"
                    />
                    <span className="text-sm">{company.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Create Customer
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-3">
        {customers.map((customer) => (
          <div key={customer.id} className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-900">{customer.name}</div>
                <div className="text-sm text-slate-600">{customer.email}</div>
                <div className="text-xs text-slate-500 mt-1">
                  Assigned: {customer.assignedCompanies.join(", ")}
                </div>
                <div className="text-xs text-slate-500">Created: {customer.created_at}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                  {customer.status}
                </span>
                {hasPermission(userRole, 'customers', 'update') && (
                  <button className="rounded-2xl border border-slate-200 px-3 py-1 text-sm text-slate-900 hover:bg-slate-50">
                    Edit
                  </button>
                )}
                {hasPermission(userRole, 'customers', 'delete') && (
                  <button className="rounded-2xl border border-red-200 px-3 py-1 text-sm text-red-600 hover:bg-red-50">
                    Delete
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
