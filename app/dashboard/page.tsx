"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getCurrentUserInfo, hasPermission, signOut, type CurrentUserInfo } from "@/modules/auth/authClient";
import { getCompanies, type Company } from "@/modules/companies/companiesClient";
import { getEmployees, createEmployee, updateEmployee, type Employee } from "@/modules/employees/employeesClient";
import { getAccessibleCompanies } from "@/modules/auth/enhancedPermissions";
import { getExpiryColor, getExpiryStatus, getMonthsUntilExpiry } from "@/modules/expiry/expiryDataGenerator";
import { Header } from "@/components/Header";

// Utility function to convert text to title case
function toTitleCase(str: string): string {
  return str.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
}

function generateEmployeeId(): string {
  return `EMP-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
}

export default function DashboardPage() {
  const [userInfo, setUserInfo] = useState<any>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [showCompanyPopup, setShowCompanyPopup] = useState(false);
  const [selectedCompanyForDetails, setSelectedCompanyForDetails] = useState<Company | null>(null);
  const [showCompanyDetails, setShowCompanyDetails] = useState(false);
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [employeeFormData, setEmployeeFormData] = useState({
    employee_id: "",
    company_id: "",
    name: "",
    designation: "",
    nationality: "",
    passport_number: "",
    passport_expiry_date: "",
    emirates_id_number: "",
    emirates_id_issue_date: "",
    emirates_id_expiry_date: "",
    labour_card_number: "",
    labour_card_expiry_date: "",
    insurance: "",
    insurance_expiry_date: "",
    iloe_expiry_date: "",
    date_of_birth: "",
    mobile: "",
    email: "",
    status: "active",
    role: "staff"
  });
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const currentUser = await getCurrentUserInfo();
        setUserInfo(currentUser);

        // Load data based on user role using enhanced permissions
        const allCompanies = await getCompanies();
        const allEmployees = await getEmployees();
        
        // Get accessible companies based on role and assignments
        const accessibleCompanies = getAccessibleCompanies(
          currentUser.role || '',
          currentUser.email || '',
          allCompanies,
          currentUser.assignedCompanies || []
        );
        
        // Filter employees based on accessible companies
        const accessibleEmployees = allEmployees.filter(employee =>
          accessibleCompanies.some((company: Company) => company.id === employee.company_id)
        );
        
        setCompanies(accessibleCompanies);
        setEmployees(accessibleEmployees);
        
        // Auto-select first company for customers with multiple assignments
        if (currentUser.role === "customer" && accessibleCompanies.length > 0) {
          setSelectedCompany(accessibleCompanies[0].id);
        }
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  async function handleSignOut() {
    await signOut();
    window.location.href = "/login";
  }

  // Get expiry statistics for dashboard
  function getExpiryStatistics() {
    const stats = {
      total: employees.length,
      expired: 0,
      critical: 0, // 1 month
      warning: 0,  // 3 months
      caution: 0,  // 6 months
    };

    employees.forEach(employee => {
      const documents = [
        employee.passport_expiry_date,
        employee.emirates_id_expiry_date,
        employee.labour_card_expiry_date
      ].filter(Boolean);

      documents.forEach(date => {
        const months = getMonthsUntilExpiry(date!);
        if (months < 0) stats.expired++;
        else if (months <= 1) stats.critical++;
        else if (months <= 3) stats.warning++;
        else if (months <= 6) stats.caution++;
      });
    });

    return stats;
  }

  // Get employees for selected company (for customer view)
  function getSelectedCompanyEmployees() {
    if (!selectedCompany || userInfo?.role !== "customer") {
      return employees;
    }
    return employees.filter(emp => emp.company_id === selectedCompany);
  }

  // Handle employee form submission
  async function handleEmployeeSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editingEmployee) {
        await updateEmployee(editingEmployee.id, {
          ...employeeFormData,
          company_id: selectedCompanyForDetails?.id || companies[0]?.id
        });
      } else {
        await createEmployee({
          ...employeeFormData,
          company_id: selectedCompanyForDetails?.id || companies[0]?.id
        });
      }
      
      // Refresh employees
      const allEmployees = await getEmployees();
      const accessibleEmployees = allEmployees.filter(employee =>
        companies.some((company: Company) => company.id === employee.company_id)
      );
      setEmployees(accessibleEmployees);
      
      setShowEmployeeForm(false);
      setEditingEmployee(null);
      alert(editingEmployee ? 'Employee updated successfully!' : 'Employee added successfully!');
    } catch (error) {
      alert('Error: ' + (error as Error).message);
    }
  }

  // Initialize employee form
  async function initializeEmployeeForm(employee?: Employee) {
    if (employee) {
      setEditingEmployee(employee);
      setEmployeeFormData({
        employee_id: employee.employee_id || "",
        company_id: employee.company_id || "",
        name: employee.name || "",
        designation: employee.designation || "",
        nationality: employee.nationality || "",
        passport_number: employee.passport_number || "",
        passport_expiry_date: employee.passport_expiry_date || "",
        emirates_id_number: employee.emirates_id_number || "",
        emirates_id_issue_date: employee.emirates_id_issue_date || "",
        emirates_id_expiry_date: employee.emirates_id_expiry_date || "",
        labour_card_number: employee.labour_card_number || "",
        labour_card_expiry_date: employee.labour_card_expiry_date || "",
        insurance: employee.insurance || "",
        insurance_expiry_date: employee.insurance_expiry_date || "",
        iloe_expiry_date: (employee as any).iloe_expiry_date || "",
        date_of_birth: employee.date_of_birth || "",
        mobile: employee.mobile || "",
        email: employee.email || "",
        status: employee.status || "active",
        role: employee.role || "staff"
      });
    } else {
      const newEmployeeId = await generateEmployeeId();
      setEditingEmployee(null);
      setEmployeeFormData({
        employee_id: newEmployeeId,
        company_id: selectedCompanyForDetails?.id || companies[0]?.id || "",
        name: "",
        designation: "",
        nationality: "",
        passport_number: "",
        passport_expiry_date: "",
        emirates_id_number: "",
        emirates_id_issue_date: "",
        emirates_id_expiry_date: "",
        labour_card_number: "",
        labour_card_expiry_date: "",
        insurance: "",
        insurance_expiry_date: "",
        iloe_expiry_date: "",
        date_of_birth: "",
        mobile: "",
        email: "",
        status: "active",
        role: "staff"
      });
    }
    setShowEmployeeForm(true);
  }

  if (loading) {
    return (
      <div className="min-h-screen" style={{background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'}}>
        <Header />
        <div className="px-6 py-12 flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-[#7b5f19]/30 border-t-[#7b5f19] rounded-full animate-spin"></div>
            <p className="text-lg font-medium text-slate-600 animate-pulse">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  const stats = getExpiryStatistics();
  const selectedCompanyEmployees = getSelectedCompanyEmployees();

  return (
    <div className="min-h-screen" style={{background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'}}>
      <Header />
      <div className="px-6 py-12">
        <div className="max-w-7xl mx-auto">
          {/* User Info Header */}
          <div className="mb-8 rounded-3xl border-0 bg-white/95 p-6 shadow-2xl backdrop-blur-sm animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => window.history.back()}
                  className="rounded-2xl border border-gray-200 p-2 hover:bg-gray-50 transition-all duration-200 transform hover:scale-105"
                  title="Go Back (Alt + Left Arrow)"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Welcome, {userInfo?.name || userInfo?.email}
                  </h1>
                  <p className="mt-1 text-sm text-slate-600">
                    Role: <span className="font-medium capitalize">{userInfo?.role}</span>
                  </p>
                  {userInfo?.role === "customer" && (
                    <p className="mt-1 text-sm text-blue-600">
                      Contact Person Portal
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleSignOut}
                  className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>

          {/* Company Selection for Customers */}
          {userInfo?.role === "customer" && companies.length > 0 && (
            <div className="mb-8 rounded-3xl border border-blue-200 bg-blue-50 p-6 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-blue-900">Selected Company</h2>
                  {selectedCompany ? (
                    <div className="mt-2">
                      <div className="font-semibold text-blue-900">
                        {companies.find(c => c.id === selectedCompany)?.company_name}
                      </div>
                      <div className="text-sm text-blue-600">
                        {companies.find(c => c.id === selectedCompany)?.company_code}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2 text-sm text-blue-600">No company selected</div>
                  )}
                </div>
                <button
                  onClick={() => setShowCompanyPopup(true)}
                  className="rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  {companies.length > 1 ? `Switch Company (${companies.length})` : 'View Company'}
                </button>
              </div>
            </div>
          )}

          {/* Global Search Bar */}
          <div className="mb-8 rounded-2xl bg-white/95 p-6 shadow-2xl backdrop-blur-sm animate-fade-in">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <svg className="absolute left-3 top-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7m0 4v6m0 4v6m0 4h9" />
                </svg>
                <input
                  type="text"
                  placeholder="Search employees, companies, documents..."
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value.toLowerCase());
                    console.log('Searching for:', e.target.value);
                  }}
                />
                {searchTerm && (
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={() => setSearchTerm('')}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              <button className="rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-2 text-sm font-medium text-white hover:from-blue-600 hover:to-blue-700 transform transition-all duration-200 hover:scale-105">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Advanced Filters
              </button>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 p-6 shadow-2xl transform transition-all duration-300 hover:scale-105 hover:shadow-3xl">
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <svg className="w-8 h-8 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <div className="text-3xl font-bold text-white">{companies.length}</div>
                </div>
                <div className="text-sm text-blue-100 font-medium">
                  {userInfo?.role === "customer" || userInfo?.role === "staff" ? "Assigned Companies" : "Total Companies"}
                </div>
              </div>
            </div>
            
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-6 shadow-2xl transform transition-all duration-300 hover:scale-105 hover:shadow-3xl">
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <svg className="w-8 h-8 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <div className="text-3xl font-bold text-white">{selectedCompanyEmployees.length}</div>
                </div>
                <div className="text-sm text-emerald-100 font-medium">Total Employees</div>
              </div>
            </div>
            
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 p-6 shadow-2xl transform transition-all duration-300 hover:scale-105 hover:shadow-3xl">
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <svg className="w-8 h-8 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <div className="text-3xl font-bold text-white">{stats.expired + stats.critical}</div>
                </div>
                <div className="text-sm text-purple-100 font-medium">Expired Documents</div>
              </div>
            </div>
            
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 p-6 shadow-2xl transform transition-all duration-300 hover:scale-105 hover:shadow-3xl">
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <svg className="w-8 h-8 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-3xl font-bold text-white">{stats.warning + stats.caution}</div>
                </div>
                <div className="text-sm text-orange-100 font-medium">Expiring This Month</div>
              </div>
            </div>
          </div>

          {/* Assigned Companies Section - Staff Only */}
          {userInfo?.role === "staff" && companies.length > 0 && (
            <div className="mb-8 rounded-3xl border border-blue-200 bg-blue-50 p-6 shadow-xl">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <h2 className="text-lg font-semibold text-blue-900">Your Assigned Companies</h2>
              </div>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {companies.map((company) => (
                  <div 
                    key={company.id} 
                    className="rounded-2xl border border-blue-100 bg-white p-4 cursor-pointer hover:bg-blue-50 transition"
                    onClick={() => {
                      setSelectedCompanyForDetails(company);
                      setShowCompanyDetails(true);
                    }}
                  >
                    <div className="font-semibold text-blue-900">{company.company_name}</div>
                    <div className="text-sm text-blue-600">{company.company_code}</div>
                    <div className="text-xs text-blue-500 mt-1">
                      {employees.filter(emp => emp.company_id === company.id).length} employees
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Employees Section */}
          {employees.length > 0 && (
            <div className="mb-8 rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900">Recent Employees</h2>
                {hasPermission(userInfo?.role || '', 'employees', 'create') && (
                  <button
                    onClick={() => initializeEmployeeForm()}
                    className="rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    Add Employee
                  </button>
                )}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 font-medium text-slate-700">Name</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-700">Designation</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-700">Company</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-700">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.slice(0, 5).map((employee) => (
                      <tr key={employee.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium text-slate-900">{employee.name}</div>
                            <div className="text-xs text-slate-500">{employee.employee_id}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-600">{employee.designation}</td>
                        <td className="py-3 px-4 text-slate-600">
                          {companies.find(c => c.id === employee.company_id)?.company_name || 'Unknown'}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                            employee.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {employee.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            {hasPermission(userInfo?.role || '', 'employees', 'update') && (
                              <button
                                onClick={() => initializeEmployeeForm(employee)}
                                className="rounded-2xl border border-blue-200 px-3 py-1 text-xs text-blue-600 hover:bg-blue-50"
                              >
                                Update
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="mb-8 rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <h2 className="text-lg font-semibold text-slate-900">Quick Actions</h2>
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              {hasPermission(userInfo?.role || '', 'companies', 'create') && (
                <Link
                  href="/companies"
                  className="rounded-2xl overflow-hidden hover:shadow-lg transition group h-24"
                >
                  <div className="flex h-full">
                    <div className="w-24 bg-blue-600 flex items-center justify-center group-hover:bg-blue-700 transition-colors">
                      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div className="flex-1 p-4 bg-white">
                      <div className="text-lg font-semibold text-blue-600">Companies</div>
                      <div className="text-sm text-blue-500">Manage companies</div>
                    </div>
                  </div>
                </Link>
              )}
              {hasPermission(userInfo?.role || '', 'staff', 'read') && (
                <Link
                  href="/employees"
                  className="rounded-2xl overflow-hidden hover:shadow-lg transition group h-24"
                >
                  <div className="flex h-full">
                    <div className="w-24 bg-emerald-600 flex items-center justify-center group-hover:bg-emerald-700 transition-colors">
                      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <div className="flex-1 p-4 bg-white">
                      <div className="text-lg font-semibold text-emerald-600">Employees</div>
                      <div className="text-sm text-emerald-500">Manage employees</div>
                    </div>
                  </div>
                </Link>
              )}
              {hasPermission(userInfo?.role || '', 'expiry', 'read') && (
                <Link
                  href="/expiry"
                  className="rounded-2xl overflow-hidden hover:shadow-lg transition group h-24"
                >
                  <div className="flex h-full">
                    <div className="w-24 bg-orange-600 flex items-center justify-center group-hover:bg-orange-700 transition-colors">
                      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1 p-4 bg-white">
                      <div className="text-lg font-semibold text-orange-600">Expiry Tracking</div>
                      <div className="text-sm text-orange-500">Monitor expiry dates</div>
                    </div>
                  </div>
                </Link>
              )}
              {hasPermission(userInfo?.role || '', 'customers', 'read') && (
                <Link
                  href="/customers"
                  className="rounded-2xl overflow-hidden hover:shadow-lg transition group h-24"
                >
                  <div className="flex h-full">
                    <div className="w-24 bg-purple-600 flex items-center justify-center group-hover:bg-purple-700 transition-colors">
                      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2m18-10h-4m-4 0H8m8 0V5a2 2 0 00-2-2H8a2 2 0 00-2 2v6h12z" />
                      </svg>
                    </div>
                    <div className="flex-1 p-4 bg-white">
                      <div className="text-lg font-semibold text-purple-600">Customers</div>
                      <div className="text-sm text-purple-500">Manage customers</div>
                    </div>
                  </div>
                </Link>
              )}
              {hasPermission(userInfo?.role || '', 'users', 'read') && (
                <Link
                  href="/users"
                  className="rounded-2xl overflow-hidden hover:shadow-lg transition group h-24"
                >
                  <div className="flex h-full">
                    <div className="w-24 bg-indigo-600 flex items-center justify-center group-hover:bg-indigo-700 transition-colors">
                      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div className="flex-1 p-4 bg-white">
                      <div className="text-lg font-semibold text-indigo-600">User Management</div>
                      <div className="text-sm text-indigo-500">Manage users</div>
                    </div>
                  </div>
                </Link>
              )}
            </div>
          </div>

          {/* Selected Company Details (for Customers) */}
          {userInfo?.role === "customer" && selectedCompany && (
            <div className="mb-8 rounded-3xl border border-blue-200 bg-blue-50 p-6 shadow-xl">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <h2 className="text-lg font-semibold text-blue-900">Company Details</h2>
              </div>
              {(() => {
                const company = companies.find(c => c.id === selectedCompany);
                if (!company) return null;
                
                return (
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-blue-600">Company Name</div>
                      <div className="font-semibold text-blue-900">{company.company_name}</div>
                    </div>
                    <div>
                      <div className="text-sm text-blue-600">Company Code</div>
                      <div className="font-semibold text-blue-900">{company.company_code}</div>
                    </div>
                    <div>
                      <div className="text-sm text-blue-600">Contact Person</div>
                      <div className="font-semibold text-blue-900">{company.contact_person}</div>
                    </div>
                    <div>
                      <div className="text-sm text-blue-600">Mobile</div>
                      <div className="font-semibold text-blue-900">{company.mobile}</div>
                    </div>
                    <div>
                      <div className="text-sm text-blue-600">Email</div>
                      <div className="font-semibold text-blue-900">{company.email}</div>
                    </div>
                    <div>
                      <div className="text-sm text-blue-600">Address</div>
                      <div className="font-semibold text-blue-900">{company.address}</div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Employees with Expiry Info */}
          {selectedCompanyEmployees.length > 0 && (
            <div className="rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-xl">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <h2 className="text-lg font-semibold text-slate-900">
                  {userInfo?.role === "customer" ? "Company Employees" : "Recent Employees"}
                </h2>
              </div>
              <div className="mt-4 space-y-3">
                {selectedCompanyEmployees.slice(0, 5).map((employee) => {
                  const company = companies.find(c => c.id === employee.company_id);
                  
                  return (
                    <div key={employee.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold text-slate-900">{employee.name}</h3>
                            {company && (
                              <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                                {company.company_name}
                              </span>
                            )}
                          </div>
                          <div className="mt-2 text-sm text-slate-600">
                            {employee.designation} • {employee.mobile}
                          </div>
                          
                          {/* Expiry Documents */}
                          <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
                            {employee.passport_expiry_date && (
                              <div className={`rounded-lg border p-2 text-xs ${getExpiryColor(employee.passport_expiry_date)}`}>
                                <div className="font-medium">Passport</div>
                                <div>{getExpiryStatus(employee.passport_expiry_date || '')}</div>
                              </div>
                            )}
                            {employee.emirates_id_expiry_date && (
                              <div className={`rounded-lg border p-2 text-xs ${getExpiryColor(employee.emirates_id_expiry_date)}`}>
                                <div className="font-medium">EID</div>
                                <div>{getExpiryStatus(employee.emirates_id_expiry_date || '')}</div>
                              </div>
                            )}
                            {employee.labour_card_expiry_date && (
                              <div className={`rounded-lg border p-2 text-xs ${getExpiryColor(employee.labour_card_expiry_date)}`}>
                                <div className="font-medium">Labour</div>
                                <div>{getExpiryStatus(employee.labour_card_expiry_date || '')}</div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {selectedCompanyEmployees.length > 5 && (
                <div className="mt-4 text-center">
                  <Link
                    href="/expiry"
                    className="inline-flex items-center rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
                  >
                    View All Employees ({selectedCompanyEmployees.length})
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Company Selection Popup for Customers */}
      {showCompanyPopup && userInfo?.role === "customer" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Select Company</h3>
              <button
                onClick={() => setShowCompanyPopup(false)}
                className="rounded-full p-2 hover:bg-slate-100"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {companies.map((company) => (
                <button
                  key={company.id}
                  onClick={() => {
                    setSelectedCompany(company.id);
                    setShowCompanyPopup(false);
                  }}
                  className={`rounded-2xl border p-4 text-left transition ${
                    selectedCompany === company.id
                      ? "border-blue-500 bg-blue-100"
                      : "border-blue-200 bg-white hover:bg-blue-50"
                  }`}
                >
                  <div className="font-semibold text-blue-900">{company.company_name}</div>
                  <div className="text-sm text-blue-600">{company.company_code}</div>
                  <div className="text-xs text-blue-500 mt-1">{company.contact_person}</div>
                  <div className="text-xs text-slate-500 mt-2">{company.address}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Company Details Modal */}
      {showCompanyDetails && selectedCompanyForDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-slate-900">Company Details</h2>
              <button
                onClick={() => {
                  setShowCompanyDetails(false);
                  setSelectedCompanyForDetails(null);
                }}
                className="rounded-2xl border border-slate-200 p-2 hover:bg-slate-50"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Company Name</label>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
                    {selectedCompanyForDetails.company_name}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Company Code</label>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
                    {selectedCompanyForDetails.company_code}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">CN Number</label>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
                    {selectedCompanyForDetails.cn_number || 'N/A'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Trade License</label>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
                    {selectedCompanyForDetails.trade_license_number || 'N/A'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Contact Person</label>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
                    {selectedCompanyForDetails.contact_person || 'N/A'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Mobile</label>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
                    {selectedCompanyForDetails.mobile || 'N/A'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
                    {selectedCompanyForDetails.email || 'N/A'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
                    {selectedCompanyForDetails.phone || 'N/A'}
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
                  {selectedCompanyForDetails.address || 'N/A'}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Employees Count</label>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
                  {employees.filter(emp => emp.company_id === selectedCompanyForDetails.id).length} employees
                </div>
              </div>
            </div>

            {/* Employee Details Section */}
            <div className="mt-6 border-t border-slate-200 pt-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Employee Details</h3>
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-slate-600">
                  Showing {employees.filter(emp => emp.company_id === selectedCompanyForDetails.id).length} employees
                </div>
                {hasPermission(userInfo?.role || '', 'employees', 'create') && (
                  <button
                    onClick={() => initializeEmployeeForm()}
                    className="rounded-2xl bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-700"
                  >
                    Add Employee
                  </button>
                )}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-2 px-3 font-medium text-slate-700">Name</th>
                      <th className="text-left py-2 px-3 font-medium text-slate-700">Designation</th>
                      <th className="text-left py-2 px-3 font-medium text-slate-700">Status</th>
                      <th className="text-left py-2 px-3 font-medium text-slate-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.filter(emp => emp.company_id === selectedCompanyForDetails.id).map((employee) => (
                      <tr key={employee.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-2 px-3">
                          <div>
                            <div className="font-medium text-slate-900">{employee.name}</div>
                            <div className="text-xs text-slate-500">{employee.employee_id}</div>
                          </div>
                        </td>
                        <td className="py-2 px-3 text-slate-600">{employee.designation}</td>
                        <td className="py-2 px-3">
                          <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                            employee.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {employee.status}
                          </span>
                        </td>
                        <td className="py-2 px-3">
                          <div className="flex gap-2">
                            {hasPermission(userInfo?.role || '', 'employees', 'update') && (
                              <button
                                onClick={() => initializeEmployeeForm(employee)}
                                className="rounded-2xl border border-blue-200 px-3 py-1 text-xs text-blue-600 hover:bg-blue-50"
                              >
                                Edit
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {employees.filter(emp => emp.company_id === selectedCompanyForDetails.id).length === 0 && (
                  <div className="text-center py-8 text-slate-500">
                    No employees found for this company
                  </div>
                )}
              </div>
            </div>

            {hasPermission(userInfo?.role || '', 'companies', 'update') && (
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => {
                    window.location.href = "/companies?edit=" + selectedCompanyForDetails.id;
                  }}
                  className="rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Update Company
                </button>
                <button
                  onClick={() => {
                    setShowCompanyDetails(false);
                    setSelectedCompanyForDetails(null);
                  }}
                  className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Employee Form Modal */}
      {showEmployeeForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-slate-900">
                {editingEmployee ? 'Update Employee' : 'Add New Employee'}
              </h2>
              <button
                onClick={() => {
                  setShowEmployeeForm(false);
                  setEditingEmployee(null);
                }}
                className="rounded-2xl border border-slate-200 p-2 hover:bg-slate-50"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleEmployeeSubmit} className="space-y-4">
              <div className="space-y-6">
                {/* Employee Details Section */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Employee Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Employee ID</label>
                      <input
                        type="text"
                        value={employeeFormData.employee_id}
                        readOnly
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                        placeholder="Auto-generated"
                      />
                      <div className="text-xs text-slate-500 mt-1">
                        {editingEmployee ? "Cannot be changed" : "Auto-generated unique ID"}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Company</label>
                      <select
                        value={employeeFormData.company_id}
                        onChange={(e) => setEmployeeFormData({...employeeFormData, company_id: e.target.value})}
                        className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                        required
                      >
                        <option value="">Select Company</option>
                        {companies.map((company) => (
                          <option key={company.id} value={company.id}>
                            {company.company_name} ({company.company_code})
                          </option>
                        ))}
                      </select>
                      <div className="text-xs text-slate-500 mt-1">
                        {selectedCompanyForDetails ? `Adding to: ${selectedCompanyForDetails.company_name}` : "Select company for this employee"}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                      <input
                        type="text"
                        value={employeeFormData.name}
                        onChange={(e) => setEmployeeFormData({...employeeFormData, name: toTitleCase(e.target.value)})}
                        className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Designation</label>
                      <input
                        type="text"
                        value={employeeFormData.designation}
                        onChange={(e) => setEmployeeFormData({...employeeFormData, designation: toTitleCase(e.target.value)})}
                        className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Nationality</label>
                      <input
                        type="text"
                        value={employeeFormData.nationality}
                        onChange={(e) => setEmployeeFormData({...employeeFormData, nationality: toTitleCase(e.target.value)})}
                        className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Passport Details Section */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Passport Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Passport No</label>
                      <input
                        type="text"
                        value={employeeFormData.passport_number}
                        onChange={(e) => setEmployeeFormData({...employeeFormData, passport_number: e.target.value.toUpperCase()})}
                        className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Passport Expiry Date</label>
                      <input
                        type="date"
                        value={employeeFormData.passport_expiry_date}
                        onChange={(e) => setEmployeeFormData({...employeeFormData, passport_expiry_date: e.target.value})}
                        className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Emirates ID Details Section */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Emirates ID Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Emirates ID No</label>
                      <input
                        type="text"
                        value={employeeFormData.emirates_id_number}
                        onChange={(e) => setEmployeeFormData({...employeeFormData, emirates_id_number: e.target.value.toUpperCase()})}
                        className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Emirates ID Issue date</label>
                      <input
                        type="date"
                        value={employeeFormData.emirates_id_issue_date}
                        onChange={(e) => setEmployeeFormData({...employeeFormData, emirates_id_issue_date: e.target.value})}
                        className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Emirates ID Expiry date</label>
                      <input
                        type="date"
                        value={employeeFormData.emirates_id_expiry_date}
                        onChange={(e) => setEmployeeFormData({...employeeFormData, emirates_id_expiry_date: e.target.value})}
                        className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Labour Card Details Section */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Labour Card Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Labour Card No</label>
                      <input
                        type="text"
                        value={employeeFormData.labour_card_number}
                        onChange={(e) => setEmployeeFormData({...employeeFormData, labour_card_number: e.target.value.toUpperCase()})}
                        className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Labour Card Expiry date</label>
                      <input
                        type="date"
                        value={employeeFormData.labour_card_expiry_date}
                        onChange={(e) => setEmployeeFormData({...employeeFormData, labour_card_expiry_date: e.target.value})}
                        className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Insurance & Other Details Section */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Insurance & Other Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">ILOE Expiry date</label>
                      <input
                        type="date"
                        value={employeeFormData.iloe_expiry_date || ''}
                        onChange={(e) => setEmployeeFormData({...employeeFormData, iloe_expiry_date: e.target.value})}
                        className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Insurance (Manual Entry)</label>
                      <input
                        type="text"
                        value={employeeFormData.insurance}
                        onChange={(e) => setEmployeeFormData({...employeeFormData, insurance: toTitleCase(e.target.value)})}
                        className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Insurance Expire Date</label>
                      <input
                        type="date"
                        value={employeeFormData.insurance_expiry_date}
                        onChange={(e) => setEmployeeFormData({...employeeFormData, insurance_expiry_date: e.target.value})}
                        className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth <span className="text-slate-400">(not mandatory)</span></label>
                      <input
                        type="date"
                        value={employeeFormData.date_of_birth}
                        onChange={(e) => setEmployeeFormData({...employeeFormData, date_of_birth: e.target.value})}
                        className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Mobile No <span className="text-slate-400">(not mandatory)</span></label>
                      <input
                        type="text"
                        value={employeeFormData.mobile}
                        onChange={(e) => setEmployeeFormData({...employeeFormData, mobile: e.target.value})}
                        className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Email <span className="text-slate-400">(not mandatory)</span></label>
                      <input
                        type="email"
                        value={employeeFormData.email}
                        onChange={(e) => setEmployeeFormData({...employeeFormData, email: e.target.value.toLowerCase()})}
                        className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEmployeeForm(false);
                    setEditingEmployee(null);
                  }}
                  className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  {editingEmployee ? 'Update Employee' : 'Add Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
