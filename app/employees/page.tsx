"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { FormEvent } from "react";
import { getEmployees, createEmployee, updateEmployee, deleteEmployee, getEmployeeByEmail, type Employee } from "@/modules/employees/employeesClient";
import { getCompanies, type Company } from "@/modules/companies/companiesClient";
import { getCurrentUserInfo, hasCompanyAccess, hasPermission, type CurrentUserInfo } from "@/modules/auth/authClient";
import { Header } from "@/components/Header";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<CurrentUserInfo | null>(null);
  const [resolvedCompanyId, setResolvedCompanyId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState({ 
    employee_id: "",
    company_id: "",
    name: "", 
    designation: "",
    nationality: "",
    passport_number: "",
    passport_expiry_date: "",
    visa_number: "",
    visa_expiry_date: "",
    emirates_id_number: "",
    emirates_id_issue_date: "",
    emirates_id_expiry_date: "",
    labour_card_number: "",
    labour_card_expiry_date: "",
    insurance: "",
    insurance_expiry_date: "",
    iloe_expiry_date: "",
    salary: "",
    joining_date: "",
    address: "",
    city: "",
    country: "UAE",
    postal_code: "",
    emergency_contact_name: "",
    emergency_contact_mobile: "",
    emergency_contact_relation: "",
    date_of_birth: "",
    mobile: "",
    email: "",
    status: "active",
    role: "staff"
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const currentUser = await getCurrentUserInfo();
        setUserInfo(currentUser);

        let companyId = currentUser.companyId;
        let accessibleCompanies: any[] = [];
        
        if (!companyId && currentUser.email) {
          const employee = await getEmployeeByEmail(currentUser.email);
          if (employee?.company_id) {
            companyId = employee.company_id;
          }
        }

        // Handle staff users with assigned companies
        if (currentUser.role === "staff" && currentUser.assignedCompanies) {
          const companiesData = await getCompanies();
          accessibleCompanies = companiesData.filter(company => 
            currentUser.assignedCompanies?.includes(company.company_code || company.id)
          );
        }

        setResolvedCompanyId(companyId ?? null);

        const canManageAll = currentUser.role === "admin" || currentUser.role === "creator";
        let employeesData: any[] = [];
        
        if (canManageAll) {
          employeesData = await getEmployees();
        } else if (currentUser.role === "staff" && accessibleCompanies.length > 0) {
          // Get employees from all assigned companies for staff
          for (const company of accessibleCompanies) {
            const companyEmployees = await getEmployees(company.id);
            employeesData = [...employeesData, ...companyEmployees];
          }
        } else if (companyId) {
          employeesData = await getEmployees(companyId);
        } else {
          employeesData = [];
        }

        const companiesData = await getCompanies();
        
        setEmployees(employeesData);
        setCompanies(companiesData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    }

    // Load data from storage
    loadData();
  }, []);

  // Reload data when page gets focus (fixes persistence issue)
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const employeesData = await getEmployees();
        setEmployees(employeesData);
      } catch (error) {
        console.error('Error reloading employees:', error);
      }
    }, 1000); // Check every 1 second

    return () => clearInterval(interval);
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    // Check if user has permission to create employees
    if (!hasPermission(userInfo?.role || '', 'employees', 'create')) {
      setError("You don't have permission to create employees");
      setSubmitting(false);
      return;
    }

    if (editingEmployee) {
      await handleUpdate();
      return;
    }

    try {
      const newEmployee = await createEmployee({
        ...formData,
        salary: formData.salary ? Number(formData.salary) : undefined,
        company_id: formData.company_id || undefined,
      });
      setEmployees([newEmployee, ...employees]);
      setFormData({ 
        employee_id: "",
        company_id: "",
        name: "", 
        designation: "",
        nationality: "",
        passport_number: "",
        passport_expiry_date: "",
        visa_number: "",
        visa_expiry_date: "",
        emirates_id_number: "",
        emirates_id_issue_date: "",
        emirates_id_expiry_date: "",
        labour_card_number: "",
        labour_card_expiry_date: "",
        insurance: "",
        insurance_expiry_date: "",
        iloe_expiry_date: "",
        salary: "",
        joining_date: "",
        address: "",
        city: "",
        country: "UAE",
        postal_code: "",
        emergency_contact_name: "",
        emergency_contact_mobile: "",
        emergency_contact_relation: "",
        date_of_birth: "",
        mobile: "",
        email: "",
        status: "active",
        role: "staff"
      });
      setShowForm(false);
    } catch (error: any) {
      setError(error.message || "Failed to create employee");
    } finally {
      setSubmitting(false);
    }
  }

  // Handle edit button click
  function handleEdit(employee: Employee) {
    setEditingEmployee(employee);
    setFormData({
      employee_id: employee.employee_id || "",
      company_id: employee.company_id || "",
      name: employee.name,
      designation: employee.designation || "",
      nationality: employee.nationality || "",
      passport_number: employee.passport_number || "",
      passport_expiry_date: employee.passport_expiry_date || "",
      visa_number: employee.visa_number || "",
      visa_expiry_date: employee.visa_expiry_date || "",
      emirates_id_number: employee.emirates_id_number || "",
      emirates_id_issue_date: employee.emirates_id_issue_date || "",
      emirates_id_expiry_date: employee.emirates_id_expiry_date || "",
      labour_card_number: employee.labour_card_number || "",
      labour_card_expiry_date: employee.labour_card_expiry_date || "",
      insurance: employee.insurance || "",
      insurance_expiry_date: employee.insurance_expiry_date || "",
      iloe_expiry_date: employee.iloe_expiry_date || "",
      salary: employee.salary?.toString() || "",
      joining_date: employee.joining_date || "",
      address: employee.address || "",
      city: employee.city || "",
      country: employee.country || "UAE",
      postal_code: employee.postal_code || "",
      emergency_contact_name: employee.emergency_contact_name || "",
      emergency_contact_mobile: employee.emergency_contact_mobile || "",
      emergency_contact_relation: employee.emergency_contact_relation || "",
      date_of_birth: employee.date_of_birth || "",
      mobile: employee.mobile || "",
      email: employee.email || "",
      status: employee.status || "active",
      role: employee.role
    });
    setShowForm(true);
  }

  // Handle update
  async function handleUpdate() {
    if (!editingEmployee) return;
    
    // Check if user has permission to update employees
    if (!hasPermission(userInfo?.role || '', 'employees', 'update')) {
      setError("You don't have permission to update employees");
      setSubmitting(false);
      return;
    }
    
    setSubmitting(true);
    setError(null);

    try {
      const updatedEmployee = await updateEmployee(editingEmployee.id, {
        ...formData,
        salary: formData.salary ? Number(formData.salary) : undefined,
      });
      
      setEmployees(employees.map(e => e.id === editingEmployee.id ? updatedEmployee : e));
      
      setFormData({ 
        employee_id: "",
        company_id: "",
        name: "", 
        designation: "",
        nationality: "",
        passport_number: "",
        passport_expiry_date: "",
        visa_number: "",
        visa_expiry_date: "",
        emirates_id_number: "",
        emirates_id_issue_date: "",
        emirates_id_expiry_date: "",
        labour_card_number: "",
        labour_card_expiry_date: "",
        insurance: "",
        insurance_expiry_date: "",
        iloe_expiry_date: "",
        salary: "",
        joining_date: "",
        address: "",
        city: "",
        country: "UAE",
        postal_code: "",
        emergency_contact_name: "",
        emergency_contact_mobile: "",
        emergency_contact_relation: "",
        date_of_birth: "",
        mobile: "",
        email: "",
        status: "active",
        role: "staff"
      });
      setEditingEmployee(null);
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update employee");
    } finally {
      setSubmitting(false);
    }
  }

  // Handle cancel edit
  function handleCancelEdit() {
    setEditingEmployee(null);
    setFormData({ 
      employee_id: "",
      company_id: "",
      name: "", 
      designation: "",
      nationality: "",
      passport_number: "",
      passport_expiry_date: "",
      visa_number: "",
      visa_expiry_date: "",
      emirates_id_number: "",
      emirates_id_issue_date: "",
      emirates_id_expiry_date: "",
      labour_card_number: "",
      labour_card_expiry_date: "",
      insurance: "",
      insurance_expiry_date: "",
      iloe_expiry_date: "",
      salary: "",
      joining_date: "",
      address: "",
      city: "",
      country: "UAE",
      postal_code: "",
      emergency_contact_name: "",
      emergency_contact_mobile: "",
      emergency_contact_relation: "",
      date_of_birth: "",
      mobile: "",
      email: "",
      status: "active",
      role: "staff"
    });
    setShowForm(false);
  }

  // Handle delete
  async function handleDelete(id: string) {
    // Check if user has permission to delete employees
    if (!hasPermission(userInfo?.role || '', 'employees', 'delete')) {
      setError("You don't have permission to delete employees");
      return;
    }

    if (!confirm('Are you sure you want to delete this employee? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteEmployee(id);
      setEmployees(employees.filter(e => e.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete employee");
    }
  }

  const role = userInfo?.role;
  const isAdmin = role === "admin" || role === "creator";
  const canView = isAdmin || ["staff", "company", "individual", "customer"].includes(role ?? "");
  const noCompanyAssigned = !isAdmin && !resolvedCompanyId && role !== "staff";

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-6 py-12">
        <div className="rounded-3xl border border-slate-200 bg-white/95 px-8 py-10 shadow-xl">
          <p className="text-base text-slate-700">Loading employees…</p>
        </div>
      </div>
    );
  }

  if (!canView || noCompanyAssigned) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-6 py-12">
        <div className="rounded-3xl border border-slate-200 bg-white/95 px-8 py-10 shadow-xl max-w-md w-full">
          <h2 className="text-xl font-semibold text-slate-900">Access Denied</h2>
          <p className="mt-2 text-sm text-slate-600">
            You don't have permission to view employees or no company has been assigned to your account.
          </p>
          <Link href="/dashboard" className="mt-6 inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700">
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
          <div className="flex items-start justify-between gap-8">
            <div className="flex-1">
              <h1 className="mt-3 text-3xl font-semibold text-slate-900">Employee Management</h1>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {isAdmin
                  ? "Create and manage employee records in your system."
                  : "View the employees assigned to your account."}
              </p>
            </div>
            <div className="flex gap-3">
              {isAdmin && (
                <button
                  onClick={() => setShowForm(!showForm)}
                  className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
                >
                  {showForm ? "Cancel" : "Add Employee"}
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
              <h2 className="text-xl font-semibold text-slate-900">
                {editingEmployee ? "Edit Employee" : "Add New Employee"}
              </h2>
              <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
                {/* Employee Details Section */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Employee Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Employee ID</label>
                      <input
                        type="text"
                        value={formData.employee_id}
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
                        value={formData.company_id}
                        onChange={(e) => setFormData({...formData, company_id: e.target.value})}
                        className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                      >
                        <option value="">Select Company</option>
                        {companies.map((company) => (
                          <option key={company.id} value={company.id}>
                            {company.company_name} ({company.company_code})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Designation</label>
                      <input
                        type="text"
                        value={formData.designation}
                        onChange={(e) => setFormData({...formData, designation: e.target.value})}
                        className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Nationality</label>
                      <input
                        type="text"
                        value={formData.nationality}
                        onChange={(e) => setFormData({...formData, nationality: e.target.value})}
                        className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
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
                        value={formData.passport_number}
                        onChange={(e) => setFormData({...formData, passport_number: e.target.value})}
                        className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Passport Expiry Date</label>
                      <input
                        type="date"
                        value={formData.passport_expiry_date}
                        onChange={(e) => setFormData({...formData, passport_expiry_date: e.target.value})}
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
                        value={formData.emirates_id_number}
                        onChange={(e) => setFormData({...formData, emirates_id_number: e.target.value})}
                        className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Emirates ID Issue date</label>
                      <input
                        type="date"
                        value={formData.emirates_id_issue_date}
                        onChange={(e) => setFormData({...formData, emirates_id_issue_date: e.target.value})}
                        className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Emirates ID Expiry date</label>
                      <input
                        type="date"
                        value={formData.emirates_id_expiry_date}
                        onChange={(e) => setFormData({...formData, emirates_id_expiry_date: e.target.value})}
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
                        value={formData.labour_card_number}
                        onChange={(e) => setFormData({...formData, labour_card_number: e.target.value})}
                        className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Labour Card issue Expiry date</label>
                      <input
                        type="date"
                        value={formData.labour_card_expiry_date}
                        onChange={(e) => setFormData({...formData, labour_card_expiry_date: e.target.value})}
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
                        value={formData.iloe_expiry_date || ''}
                        onChange={(e) => setFormData({...formData, iloe_expiry_date: e.target.value})}
                        className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Insurance (Manual Entry)</label>
                      <input
                        type="text"
                        value={formData.insurance}
                        onChange={(e) => setFormData({...formData, insurance: e.target.value})}
                        className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Insurance Expire Date</label>
                      <input
                        type="date"
                        value={formData.insurance_expiry_date}
                        onChange={(e) => setFormData({...formData, insurance_expiry_date: e.target.value})}
                        className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth <span className="text-slate-400">(not mandatory)</span></label>
                      <input
                        type="date"
                        value={formData.date_of_birth}
                        onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})}
                        className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Mobile No <span className="text-slate-400">(not mandatory)</span></label>
                      <input
                        type="text"
                        value={formData.mobile}
                        onChange={(e) => setFormData({...formData, mobile: e.target.value})}
                        className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Email <span className="text-slate-400">(not mandatory)</span></label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingEmployee(null);
                    }}
                    className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting ? (editingEmployee ? "Updating..." : "Creating...") : (editingEmployee ? "Update Employee" : "Create Employee")}
                  </button>
                  {editingEmployee && (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      disabled={submitting}
                      className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}

          <div className="grid gap-4">
            {employees.length === 0 ? (
              <div className="rounded-3xl border border-slate-200 bg-white/95 p-8 text-center shadow-xl">
                <p className="text-lg font-semibold text-slate-900">No employees found</p>
                <p className="mt-2 text-sm text-slate-600">Ask the administrator to add employees to your account.</p>
              </div>
            ) : (
              employees.map((employee) => (
                <div key={employee.id} className="rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-xl">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">{employee.name}</h3>
                      <p className="mt-1 text-sm text-slate-600">{employee.designation}</p>
                      <p className="mt-1 text-sm text-slate-600">{employee.mobile}</p>
                      <p className="mt-1 text-sm text-slate-600">{employee.email}</p>
                      <p className="mt-2 text-xs text-slate-500">
                        Joined {employee.joining_date ? new Date(employee.joining_date).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    {isAdmin && (
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleEdit(employee)}
                          className="rounded-2xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-900 hover:bg-slate-50"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(employee.id)}
                          className="rounded-2xl border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50"
                        >
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
