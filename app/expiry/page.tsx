"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getEmployees, type Employee } from "@/modules/employees/employeesClient";
import { getCompanies, type Company } from "@/modules/companies/companiesClient";
import { getCurrentUserInfo, type CurrentUserInfo } from "@/modules/auth/authClient";
import { getExpiryColor, getExpiryStatus, getMonthsUntilExpiry } from "@/modules/expiry/expiryDataGenerator";
import { getExpiryItems, type ExpiryItem, createExpiryItem } from "@/modules/expiry/expiryClient";
import { Header } from "@/components/Header";

export default function ExpiryTrackingPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [expiryItems, setExpiryItems] = useState<ExpiryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<CurrentUserInfo | null>(null);
  const [showGenerateData, setShowGenerateData] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "expired" | "1month" | "3months" | "6months">("all");
  const [expiryType, setExpiryType] = useState<"all" | "employee" | "company">("all");
  const [showAddExpiry, setShowAddExpiry] = useState(false);
  const [newExpiry, setNewExpiry] = useState({
    title: "",
    description: "",
    expires_at: "",
    company_id: "",
    employee_id: "",
    document_type: "general",
    document_category: "",
    document_status: "active"
  });

  useEffect(() => {
    async function loadData() {
      try {
        const currentUser = await getCurrentUserInfo();
        setUserInfo(currentUser);

        const [employeesData, companiesData, expiryData] = await Promise.all([
          getEmployees(),
          getCompanies(),
          getExpiryItems()
        ]);
        
        setEmployees(employeesData);
        setCompanies(companiesData);
        setExpiryItems(expiryData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Auto-reload every 5 seconds for expiry tracking
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const [employeesData, expiryData] = await Promise.all([
          getEmployees(),
          getExpiryItems()
        ]);
        setEmployees(employeesData);
        setExpiryItems(expiryData);
      } catch (error) {
        console.error('Error reloading expiry data:', error);
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, []);

  // Generate sample data
  async function handleGenerateData() {
    setGenerating(true);
    setError(null);
    
    try {
      // Load existing data
      const [employeesData, companiesData, expiryData] = await Promise.all([
        getEmployees(),
        getCompanies(),
        getExpiryItems()
      ]);
      setEmployees(employeesData);
      setCompanies(companiesData);
      setExpiryItems(expiryData);
      
      setShowGenerateData(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate sample data");
    } finally {
      setGenerating(false);
    }
  }

  // Add new expiry item
  async function handleAddExpiry() {
    setGenerating(true);
    setError(null);
    
    try {
      await createExpiryItem(newExpiry);
      
      // Reload data after adding
      const expiryData = await getExpiryItems();
      setExpiryItems(expiryData);
      
      // Reset form
      setNewExpiry({
        title: "",
        description: "",
        expires_at: "",
        company_id: "",
        employee_id: "",
        document_type: "general",
        document_category: "",
        document_status: "active"
      });
      setShowAddExpiry(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add expiry item");
    } finally {
      setGenerating(false);
    }
  }

  // Filter expiry items based on expiry
  function getFilteredExpiryItems() {
    if (expiryType === "employee") {
      return expiryItems.filter(item => item.employee_id);
    }
    if (expiryType === "company") {
      return expiryItems.filter(item => !item.employee_id);
    }
    return expiryItems;
  }

  function getFilteredByTime(items: ExpiryItem[]) {
    if (filter === "all") return items;
    
    return items.filter(item => {
      const months = getMonthsUntilExpiry(item.expires_at);
      
      switch (filter) {
        case "expired":
          return months < 0;
        case "1month":
          return months <= 1;
        case "3months":
          return months <= 3;
        case "6months":
          return months <= 6;
        default:
          return true;
      }
    });
  }

  // Filter employees based on expiry
  function getFilteredEmployees() {
    if (filter === "all") return employees;
    
    return employees.filter(employee => {
      const passportMonths = employee.passport_expiry_date ? getMonthsUntilExpiry(employee.passport_expiry_date) : 999;
      const visaMonths = employee.visa_expiry_date ? getMonthsUntilExpiry(employee.visa_expiry_date) : 999;
      const emiratesIdMonths = employee.emirates_id_expiry_date ? getMonthsUntilExpiry(employee.emirates_id_expiry_date) : 999;
      const labourCardMonths = employee.labour_card_expiry_date ? getMonthsUntilExpiry(employee.labour_card_expiry_date) : 999;
      
      const minMonths = Math.min(passportMonths, visaMonths, emiratesIdMonths, labourCardMonths);
      
      switch (filter) {
        case "expired":
          return minMonths < 0;
        case "1month":
          return minMonths <= 1;
        case "3months":
          return minMonths <= 3;
        case "6months":
          return minMonths <= 6;
        default:
          return true;
      }
    });
  }

  // Get expiry statistics
  function getExpiryStats() {
    const stats = {
      totalEmployees: employees.length,
      totalExpiryItems: expiryItems.length,
      employeeExpired: 0,
      employeeCritical: 0, // 1 month
      employeeWarning: 0,  // 3 months
      employeeCaution: 0,  // 6 months
      companyExpired: 0,
      companyCritical: 0,
      companyWarning: 0,
      companyCaution: 0,
    };

    // Employee document statistics
    employees.forEach(employee => {
      const documents = [
        employee.passport_expiry_date,
        employee.visa_expiry_date,
        employee.emirates_id_expiry_date,
        employee.labour_card_expiry_date
      ].filter(Boolean);

      documents.forEach(date => {
        const months = getMonthsUntilExpiry(date!);
        if (months < 0) stats.employeeExpired++;
        else if (months <= 1) stats.employeeCritical++;
        else if (months <= 3) stats.employeeWarning++;
        else if (months <= 6) stats.employeeCaution++;
      });
    });

    // Company document statistics
    expiryItems.forEach(item => {
      if (!item.employee_id) { // Company document
        const months = getMonthsUntilExpiry(item.expires_at);
        if (months < 0) stats.companyExpired++;
        else if (months <= 1) stats.companyCritical++;
        else if (months <= 3) stats.companyWarning++;
        else if (months <= 6) stats.companyCaution++;
      }
    });

    return stats;
  }

  const role = userInfo?.role;
  const isAdmin = role === "admin" || role === "creator";
  const canView = isAdmin || ["staff", "company", "individual", "customer"].includes(role ?? "");

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-6 py-12">
        <div className="rounded-3xl border border-slate-200 bg-white/95 px-8 py-10 shadow-xl">
          <p className="text-base text-slate-700">Loading expiry tracking…</p>
        </div>
      </div>
    );
  }

  if (!canView) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-6 py-12">
        <div className="rounded-3xl border border-slate-200 bg-white/95 px-8 py-10 shadow-xl max-w-md w-full">
          <h2 className="text-xl font-semibold text-slate-900">Access Denied</h2>
          <p className="mt-2 text-sm text-slate-600">
            You don't have permission to view expiry tracking.
          </p>
          <Link href="/dashboard" className="mt-6 inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const filteredEmployees = getFilteredEmployees();
  const filteredExpiryItems = getFilteredByTime(getFilteredExpiryItems());
  const stats = getExpiryStats();

  return (
    <div className="min-h-screen bg-zinc-50">
      <Header showBackButton={true} />
      <div className="px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-start justify-between gap-8">
            <div className="flex-1">
              <h1 className="mt-3 text-3xl font-semibold text-slate-900">Document Expiry Tracking</h1>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Monitor employee documents and company documents with automatic alerts.
              </p>
            </div>
            <div className="flex gap-3">
              {isAdmin && (
                <>
                  <button
                    onClick={() => setShowAddExpiry(!showAddExpiry)}
                    className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    {showAddExpiry ? "Cancel" : "Add Document"}
                  </button>
                  <button
                    onClick={() => setShowGenerateData(!showGenerateData)}
                    className="rounded-2xl bg-purple-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-purple-700"
                  >
                    {showGenerateData ? "Cancel" : "Generate Sample Data"}
                  </button>
                </>
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

          {/* Add Expiry Item Form */}
          {showAddExpiry && isAdmin && (
            <div className="mb-8 rounded-3xl border border-blue-200 bg-blue-50 p-6 shadow-xl">
              <h2 className="text-xl font-semibold text-blue-900">Add New Expiry Document</h2>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Title</label>
                  <input
                    type="text"
                    value={newExpiry.title}
                    onChange={(e) => setNewExpiry({...newExpiry, title: e.target.value})}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                    placeholder="Document title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Document Type</label>
                  <select
                    value={newExpiry.document_type}
                    onChange={(e) => setNewExpiry({...newExpiry, document_type: e.target.value})}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  >
                    <option value="general">General</option>
                    <option value="license">License</option>
                    <option value="registration">Registration</option>
                    <option value="insurance">Insurance</option>
                    <option value="permit">Permit</option>
                    <option value="lease">Lease</option>
                    <option value="certificate">Certificate</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Document Category</label>
                  <input
                    type="text"
                    value={newExpiry.document_category}
                    onChange={(e) => setNewExpiry({...newExpiry, document_category: e.target.value})}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                    placeholder="e.g., legal, financial, property"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Expiry Date</label>
                  <input
                    type="date"
                    value={newExpiry.expires_at}
                    onChange={(e) => setNewExpiry({...newExpiry, expires_at: e.target.value})}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Company</label>
                  <select
                    value={newExpiry.company_id}
                    onChange={(e) => setNewExpiry({...newExpiry, company_id: e.target.value})}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  >
                    <option value="">Select Company</option>
                    {companies.map(company => (
                      <option key={company.id} value={company.id}>{company.company_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Employee (Optional)</label>
                  <select
                    value={newExpiry.employee_id}
                    onChange={(e) => setNewExpiry({...newExpiry, employee_id: e.target.value})}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  >
                    <option value="">Select Employee (for employee documents)</option>
                    {employees.map(employee => (
                      <option key={employee.id} value={employee.id}>{employee.name}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                  <textarea
                    value={newExpiry.description}
                    onChange={(e) => setNewExpiry({...newExpiry, description: e.target.value})}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                    rows={3}
                    placeholder="Document description"
                  />
                </div>
              </div>
              <div className="mt-4 flex gap-3">
                <button
                  onClick={handleAddExpiry}
                  disabled={generating || !newExpiry.title || !newExpiry.expires_at || !newExpiry.company_id}
                  className="rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {generating ? "Adding..." : "Add Document"}
                </button>
                <button
                  onClick={() => setShowAddExpiry(false)}
                  disabled={generating}
                  className="rounded-2xl border border-blue-200 px-4 py-3 text-sm font-semibold text-blue-900 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Sample Data Generation Form */}
          {showGenerateData && isAdmin && (
            <div className="mb-8 rounded-3xl border border-purple-200 bg-purple-50 p-6 shadow-xl">
              <h2 className="text-xl font-semibold text-purple-900">Generate Sample Expiry Data</h2>
              <p className="mt-2 text-sm text-purple-700">
                This will create sample company documents for testing.
              </p>
              <div className="mt-4 space-y-2 text-sm text-purple-600">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-100 border border-red-200 rounded"></div>
                  <span>Expired & 1-2 months (Critical)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-pink-100 border border-pink-200 rounded"></div>
                  <span>3 months (Warning)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-orange-100 border border-orange-200 rounded"></div>
                  <span>4 months (Caution)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-100 border border-yellow-200 rounded"></div>
                  <span>5-6 months (Attention)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-white border border-gray-200 rounded"></div>
                  <span>6+ months (Safe)</span>
                </div>
              </div>
              <div className="mt-4 flex gap-3">
                <button
                  onClick={handleGenerateData}
                  disabled={generating}
                  className="rounded-2xl bg-purple-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {generating ? "Generating..." : "Generate Sample Data"}
                </button>
                <button
                  onClick={() => setShowGenerateData(false)}
                  disabled={generating}
                  className="rounded-2xl border border-purple-200 px-4 py-3 text-sm font-semibold text-purple-900 transition hover:bg-purple-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Statistics Cards */}
          <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-lg">
              <div className="text-2xl font-bold text-slate-900">{stats.totalEmployees}</div>
              <div className="text-sm text-slate-600">Total Employees</div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-lg">
              <div className="text-2xl font-bold text-slate-900">{stats.totalExpiryItems}</div>
              <div className="text-sm text-slate-600">Company Documents</div>
            </div>
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 shadow-lg">
              <div className="text-2xl font-bold text-red-800">{stats.employeeExpired + stats.companyExpired}</div>
              <div className="text-sm text-red-600">Total Expired</div>
            </div>
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 shadow-lg">
              <div className="text-2xl font-bold text-red-800">{stats.employeeCritical + stats.companyCritical}</div>
              <div className="text-sm text-red-600">1 Month Critical</div>
            </div>
          </div>

          {/* Filter Controls */}
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => setExpiryType("all")}
                className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                  expiryType === "all" 
                    ? "bg-slate-900 text-white" 
                    : "border border-slate-200 text-slate-900 hover:bg-slate-50"
                }`}
              >
                All ({employees.length + expiryItems.length})
              </button>
              <button
                onClick={() => setExpiryType("employee")}
                className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                  expiryType === "employee" 
                    ? "bg-slate-900 text-white" 
                    : "border border-slate-200 text-slate-900 hover:bg-slate-50"
                }`}
              >
                Employee Documents ({employees.length})
              </button>
              <button
                onClick={() => setExpiryType("company")}
                className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                  expiryType === "company" 
                    ? "bg-slate-900 text-white" 
                    : "border border-slate-200 text-slate-900 hover:bg-slate-50"
                }`}
              >
                Company Documents ({expiryItems.length})
              </button>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setFilter("all")}
                className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                  filter === "all" 
                    ? "bg-slate-900 text-white" 
                    : "border border-slate-200 text-slate-900 hover:bg-slate-50"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter("expired")}
                className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                  filter === "expired" 
                    ? "bg-red-100 text-red-800 border border-red-200" 
                    : "border border-slate-200 text-slate-900 hover:bg-slate-50"
                }`}
              >
                Expired
              </button>
              <button
                onClick={() => setFilter("1month")}
                className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                  filter === "1month" 
                    ? "bg-red-100 text-red-800 border border-red-200" 
                    : "border border-slate-200 text-slate-900 hover:bg-slate-50"
                }`}
              >
                1 Month
              </button>
              <button
                onClick={() => setFilter("3months")}
                className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                  filter === "3months" 
                    ? "bg-pink-100 text-pink-800 border border-pink-200" 
                    : "border border-slate-200 text-slate-900 hover:bg-slate-50"
                }`}
              >
                3 Months
              </button>
              <button
                onClick={() => setFilter("6months")}
                className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                  filter === "6months" 
                    ? "bg-orange-100 text-orange-800 border border-orange-200" 
                    : "border border-slate-200 text-slate-900 hover:bg-slate-50"
                }`}
              >
                6 Months
              </button>
            </div>
          </div>

          {/* Company Documents List */}
          {(expiryType === "all" || expiryType === "company") && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Company Documents</h2>
              {filteredExpiryItems.length === 0 ? (
                <div className="rounded-3xl border border-slate-200 bg-white/95 p-8 text-center shadow-xl">
                  <p className="text-lg font-semibold text-slate-900">No company documents found</p>
                  <p className="mt-2 text-sm text-slate-600">
                    {filter === "all" 
                      ? "No company documents in the system." 
                      : `No company documents with expiry within selected timeframe.`}
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {filteredExpiryItems.map((item) => {
                    const company = companies.find(c => c.id === item.company_id);
                    const employee = item.employee_id ? employees.find(e => e.id === item.employee_id) : null;
                    
                    return (
                      <div key={item.id} className={`rounded-3xl border p-6 shadow-xl ${getExpiryColor(item.expires_at)}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
                              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                                {item.document_type}
                              </span>
                              {item.document_category && (
                                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-800">
                                  {item.document_category}
                                </span>
                              )}
                            </div>
                            
                            <div className="text-sm text-slate-600 mb-3">
                              {item.description}
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm">
                              <div>
                                <span className="font-medium">Company:</span> {company?.company_name}
                              </div>
                              {employee && (
                                <div>
                                  <span className="font-medium">Employee:</span> {employee.name}
                                </div>
                              )}
                              <div>
                                <span className="font-medium">Expires:</span> {new Date(item.expires_at).toLocaleDateString()}
                              </div>
                              <div>
                                <span className="font-medium">Status:</span> {getExpiryStatus(item.expires_at)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Employee Documents List */}
          {(expiryType === "all" || expiryType === "employee") && (
            <div>
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Employee Documents</h2>
              {filteredEmployees.length === 0 ? (
                <div className="rounded-3xl border border-slate-200 bg-white/95 p-8 text-center shadow-xl">
                  <p className="text-lg font-semibold text-slate-900">No employees found</p>
                  <p className="mt-2 text-sm text-slate-600">
                    {filter === "all" 
                      ? "No employees in the system." 
                      : `No employees with expiry within selected timeframe.`}
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {filteredEmployees.map((employee) => {
                    const company = companies.find(c => c.id === employee.company_id);
                    
                    return (
                      <div key={employee.id} className="rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-xl">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <h3 className="text-lg font-semibold text-slate-900">{employee.name}</h3>
                              {company && (
                                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                                  {company.company_name}
                                </span>
                              )}
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                              {/* Passport */}
                              {employee.passport_number && (
                                <div className={`rounded-xl border p-3 ${getExpiryColor(employee.passport_expiry_date!)}`}>
                                  <div className="text-xs font-medium mb-1">Passport</div>
                                  <div className="text-sm font-semibold">{employee.passport_number}</div>
                                  <div className="text-xs mt-1">{getExpiryStatus(employee.passport_expiry_date!)}</div>
                                </div>
                              )}
                              
                              {/* Visa */}
                              {employee.visa_number && (
                                <div className={`rounded-xl border p-3 ${getExpiryColor(employee.visa_expiry_date!)}`}>
                                  <div className="text-xs font-medium mb-1">Visa</div>
                                  <div className="text-sm font-semibold">{employee.visa_number}</div>
                                  <div className="text-xs mt-1">{getExpiryStatus(employee.visa_expiry_date!)}</div>
                                </div>
                              )}
                              
                              {/* Emirates ID */}
                              {employee.emirates_id_number && (
                                <div className={`rounded-xl border p-3 ${getExpiryColor(employee.emirates_id_expiry_date!)}`}>
                                  <div className="text-xs font-medium mb-1">Emirates ID</div>
                                  <div className="text-sm font-semibold">{employee.emirates_id_number}</div>
                                  <div className="text-xs mt-1">{getExpiryStatus(employee.emirates_id_expiry_date!)}</div>
                                </div>
                              )}
                              
                              {/* Labour Card */}
                              {employee.labour_card_number && (
                                <div className={`rounded-xl border p-3 ${getExpiryColor(employee.labour_card_expiry_date!)}`}>
                                  <div className="text-xs font-medium mb-1">Labour Card</div>
                                  <div className="text-sm font-semibold">{employee.labour_card_number}</div>
                                  <div className="text-xs mt-1">{getExpiryStatus(employee.labour_card_expiry_date!)}</div>
                                </div>
                              )}
                            </div>
                            
                            <div className="mt-4 text-sm text-slate-600">
                              <span className="font-medium">{employee.designation}</span> • {employee.mobile} • {employee.email}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
