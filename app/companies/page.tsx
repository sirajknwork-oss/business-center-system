"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { FormEvent } from "react";
import { getCompanies, createCompany, updateCompany, deleteCompany, type Company } from "@/modules/companies/companiesClient";
import { getCurrentUserInfo, type CurrentUserInfo } from "@/modules/auth/authClient";
import { Header } from "@/components/Header";

interface Owner {
  id: string;
  type: 'individual' | 'company';
  role: string;
  nationality?: string;
  name?: string;
  emiratesId?: string;
  emiratesIdExpiry?: string;
  insuranceNumber?: string;
  insuranceExpiry?: string;
  mobile?: string;
  companyNo?: string;
  companyName?: string;
  companyIssuePlace?: string;
  companyContactPerson?: string;
  contactNumber?: string;
}

interface Manager {
  id: string;
  role: string;
  nationality: string;
  name: string;
  mobile: string;
}

interface LicenseActivity {
  id: string;
  activity: string;
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<CurrentUserInfo | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [companyCode, setCompanyCode] = useState("");
  const [formData, setFormData] = useState({ 
    // Company Details
    company_name_en: "",
    company_name_ar: "",
    company_number: "",
    establishment_date: "",
    issuance_date: "",
    expiry_date: "",
    legal_form: "",
    
    // Address
    has_lease_contract: false,
    lease_contract_number: "",
    lease_expiry_date: "",
    place: "",
    company_email: "",
    company_mobile: "",
    
    // ICP Details
    icp_establishment_card_number: "",
    echannel_username: "",
    echannel_password: "",
    establishment_card_issue_date: "",
    establishment_card_expiry_date: "",
    
    // MOHRE Details
    mohre_number: "",
    mohre_last_update_date: "",
    
    // DAMAN Details
    daman_policy_number: "",
    daman_expiry_date: "",
    daman_total_members: "",
    
    // Contact Person
    contact_person_name: "",
    contact_person_mobile: "",
    contact_person_email: "",
    
    status: "active",
    created_by: "",
    created_at: "",
    updated_at: ""
  });
  
  const [owners, setOwners] = useState<Owner[]>([]);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [licenseActivities, setLicenseActivities] = useState<LicenseActivity[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);

  // Auto-generate company code
  useEffect(() => {
    if (!editingCompany) {
      generateCompanyCode();
    }
  }, [showForm]);

  async function generateCompanyCode() {
    try {
      const companiesList = await getCompanies();
      const maxCode = companiesList.reduce((max, company) => {
        const code = company.company_code || "";
        const match = code.match(/C-(\d+)/);
        if (match) {
          const num = parseInt(match[1]);
          return num > max ? num : max;
        }
        return max;
      }, 0);
      
      const newCode = `C-${String(maxCode + 1).padStart(3, '0')}`;
      setCompanyCode(newCode);
    } catch (err) {
      setCompanyCode("C-001");
    }
  }

  useEffect(() => {
    async function loadData() {
      try {
        const currentUser = await getCurrentUserInfo();
        setUserInfo(currentUser);
        
        let companiesData: Company[] = [];
        
        if (currentUser) {
          companiesData = await getCompanies();
        }
        
        setCompanies(companiesData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  function addOwner() {
    const newOwner: Owner = {
      id: Date.now().toString(),
      type: 'individual',
      role: '',
      nationality: '',
      name: '',
      emiratesId: '',
      emiratesIdExpiry: '',
      insuranceNumber: '',
      insuranceExpiry: '',
      mobile: '',
      companyNo: '',
      companyName: '',
      companyIssuePlace: '',
      companyContactPerson: '',
      contactNumber: ''
    };
    setOwners([...owners, newOwner]);
  }

  function removeOwner(id: string) {
    setOwners(owners.filter(owner => owner.id !== id));
  }

  function updateOwner(id: string, updates: Partial<Owner>) {
    setOwners(owners.map(owner => 
      owner.id === id ? { ...owner, ...updates } : owner
    ));
  }

  function addManager() {
    const newManager: Manager = {
      id: Date.now().toString(),
      role: '',
      nationality: '',
      name: '',
      mobile: ''
    };
    setManagers([...managers, newManager]);
  }

  function removeManager(id: string) {
    setManagers(managers.filter(manager => manager.id !== id));
  }

  function updateManager(id: string, updates: Partial<Manager>) {
    setManagers(managers.map(manager => 
      manager.id === id ? { ...manager, ...updates } : manager
    ));
  }

  function addLicenseActivity() {
    const newActivity: LicenseActivity = {
      id: Date.now().toString(),
      activity: ''
    };
    setLicenseActivities([...licenseActivities, newActivity]);
  }

  function removeLicenseActivity(id: string) {
    setLicenseActivities(licenseActivities.filter(activity => activity.id !== id));
  }

  function updateLicenseActivity(id: string, activity: string) {
    setLicenseActivities(licenseActivities.map(act => 
      act.id === id ? { ...act, activity } : act
    ));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    if (editingCompany) {
      await handleUpdate();
      return;
    }

    try {
      const newCompany = await createCompany({
        company_name: formData.company_name_en,
        company_code: companyCode,
        cn_number: formData.company_number,
        trade_license_number: "",
        establishment_card_number: formData.icp_establishment_card_number,
        vat_number: "",
        contact_person: formData.contact_person_name,
        mobile: formData.company_mobile,
        email: formData.company_email,
        address: formData.place,
        status: formData.status || 'active',
        // Additional fields would need to be added to the Company interface
        company_name_ar: formData.company_name_ar,
        establishment_date: formData.establishment_date,
        issuance_date: formData.issuance_date,
        expiry_date: formData.expiry_date,
        legal_form: formData.legal_form,
        owners: owners,
        managers: managers,
        license_activities: licenseActivities,
        lease_contract: formData.has_lease_contract,
        lease_contract_number: formData.lease_contract_number,
        lease_expiry_date: formData.lease_expiry_date,
        icp_details: {
          establishment_card_number: formData.icp_establishment_card_number,
          echannel_username: formData.echannel_username,
          echannel_password: formData.echannel_password,
          issue_date: formData.establishment_card_issue_date,
          expiry_date: formData.establishment_card_expiry_date
        },
        mohre_details: {
          number: formData.mohre_number,
          last_update_date: formData.mohre_last_update_date
        },
        daman_details: {
          policy_number: formData.daman_policy_number,
          expiry_date: formData.daman_expiry_date,
          total_members: formData.daman_total_members
        }
      } as any);
      
      setCompanies([newCompany, ...companies]);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create company");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUpdate() {
    if (!editingCompany) return;

    try {
      const updatedCompany = await updateCompany(editingCompany.id, {
        company_name: formData.company_name_en,
        company_code: companyCode,
        cn_number: formData.company_number,
        contact_person: formData.contact_person_name,
        mobile: formData.company_mobile,
        email: formData.company_email,
        address: formData.place,
        status: formData.status || "active"
      });
      
      setCompanies(companies.map(company => 
        company.id === editingCompany.id ? updatedCompany : company
      ));
      
      setEditingCompany(null);
      setShowForm(false);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update company");
    } finally {
      setSubmitting(false);
    }
  }

  function resetForm() {
    setFormData({ 
      company_name_en: "",
      company_name_ar: "",
      company_number: "",
      establishment_date: "",
      issuance_date: "",
      expiry_date: "",
      legal_form: "",
      has_lease_contract: false,
      lease_contract_number: "",
      lease_expiry_date: "",
      place: "",
      company_email: "",
      company_mobile: "",
      icp_establishment_card_number: "",
      echannel_username: "",
      echannel_password: "",
      establishment_card_issue_date: "",
      establishment_card_expiry_date: "",
      mohre_number: "",
      mohre_last_update_date: "",
      daman_policy_number: "",
      daman_expiry_date: "",
      daman_total_members: "",
      contact_person_name: "",
      contact_person_mobile: "",
      contact_person_email: "",
      status: "active",
      created_by: "",
      created_at: "",
      updated_at: ""
    });
    setOwners([]);
    setManagers([]);
    setLicenseActivities([]);
    generateCompanyCode();
  }

  async function handleDelete(company: Company) {
    if (!confirm(`Are you sure you want to delete ${company.company_name}?`)) {
      return;
    }

    try {
      await deleteCompany(company.id);
      setCompanies(companies.filter(c => c.id !== company.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete company");
    }
  }

  function handleCancelEdit() {
    setEditingCompany(null);
    setShowForm(false);
    resetForm();
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-200"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <Header />
      <div className="px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-semibold text-slate-900">Companies</h1>
              {userInfo && (
                <div className="flex gap-4">
                  <span className="text-sm text-slate-600">
                    Welcome, <strong>{userInfo.name}</strong>
                  </span>
                  <button
                    onClick={() => setShowForm(!showForm)}
                    className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                  >
                    {showForm ? "Cancel" : "Add Company"}
                  </button>
                </div>
              )}
            </div>

            {showForm && (
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Company Details Section */}
                <div className="border border-slate-200 rounded-2xl p-6">
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">Company Details</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Company Code (Auto-generated)
                      </label>
                      <input
                        type="text"
                        value={companyCode}
                        disabled
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-slate-900 outline-none"
                        placeholder="C-001"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Company Name (English) *
                      </label>
                      <input
                        type="text"
                        value={formData.company_name_en}
                        onChange={(event) => setFormData({ ...formData, company_name_en: event.target.value })}
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                        placeholder="Company Name"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Company Name (Arabic)
                      </label>
                      <input
                        type="text"
                        value={formData.company_name_ar}
                        onChange={(event) => setFormData({ ...formData, company_name_ar: event.target.value })}
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                        placeholder="اسم الشركة"
                        dir="rtl"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Company Number (Dept of Economic Development)
                      </label>
                      <input
                        type="text"
                        value={formData.company_number}
                        onChange={(event) => setFormData({ ...formData, company_number: event.target.value })}
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                        placeholder="CN/IN-001"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Company Establishment Date
                      </label>
                      <input
                        type="date"
                        value={formData.establishment_date}
                        onChange={(event) => setFormData({ ...formData, establishment_date: event.target.value })}
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Company Issuance Date
                      </label>
                      <input
                        type="date"
                        value={formData.issuance_date}
                        onChange={(event) => setFormData({ ...formData, issuance_date: event.target.value })}
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Company Expiry Date
                      </label>
                      <input
                        type="date"
                        value={formData.expiry_date}
                        onChange={(event) => setFormData({ ...formData, expiry_date: event.target.value })}
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Legal Form *
                      </label>
                      <select
                        value={formData.legal_form}
                        onChange={(event) => setFormData({ ...formData, legal_form: event.target.value })}
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                        required
                      >
                        <option value="">Select Legal Form</option>
                        <option value="llc-spc">Limited Liability Company - Sole Proprietorship Company</option>
                        <option value="llc">Limited Liability Company</option>
                        <option value="establishment">Establishment</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Ownership and Representatives Section */}
                <div className="border border-slate-200 rounded-2xl p-6">
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">Ownership and Representatives</h2>
                  
                  <div className="space-y-4">
                    {owners.map((owner, index) => (
                      <div key={owner.id} className="border border-slate-100 rounded-xl p-4">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="font-medium text-slate-900">Owner {index + 1}</h3>
                          <button
                            type="button"
                            onClick={() => removeOwner(owner.id)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Remove
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                              Owner Type
                            </label>
                            <select
                              value={owner.type}
                              onChange={(e) => updateOwner(owner.id, { type: e.target.value as 'individual' | 'company' })}
                              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                            >
                              <option value="individual">Individual</option>
                              <option value="company">Company</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                              Role/Position
                            </label>
                            <input
                              type="text"
                              value={owner.role}
                              onChange={(e) => updateOwner(owner.id, { role: e.target.value })}
                              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                              placeholder="Owner/Partner/Shareholder"
                            />
                          </div>

                          {owner.type === 'individual' ? (
                            <>
                              <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                  Nationality
                                </label>
                                <input
                                  type="text"
                                  value={owner.nationality}
                                  onChange={(e) => updateOwner(owner.id, { nationality: e.target.value })}
                                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                                  placeholder="UAE, India, etc."
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                  Name
                                </label>
                                <input
                                  type="text"
                                  value={owner.name}
                                  onChange={(e) => updateOwner(owner.id, { name: e.target.value })}
                                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                                  placeholder="Full Name"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                  Emirates ID
                                </label>
                                <input
                                  type="text"
                                  value={owner.emiratesId}
                                  onChange={(e) => updateOwner(owner.id, { emiratesId: e.target.value })}
                                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                                  placeholder="784-XXXX-XXXXXXX-X"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                  Emirates ID Expiry Date
                                </label>
                                <input
                                  type="date"
                                  value={owner.emiratesIdExpiry}
                                  onChange={(e) => updateOwner(owner.id, { emiratesIdExpiry: e.target.value })}
                                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                  Insurance Number (if non-local)
                                </label>
                                <input
                                  type="text"
                                  value={owner.insuranceNumber}
                                  onChange={(e) => updateOwner(owner.id, { insuranceNumber: e.target.value })}
                                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                                  placeholder="Insurance Number"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                  Insurance Expiry Date
                                </label>
                                <input
                                  type="date"
                                  value={owner.insuranceExpiry}
                                  onChange={(e) => updateOwner(owner.id, { insuranceExpiry: e.target.value })}
                                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                  Mobile Number
                                </label>
                                <input
                                  type="tel"
                                  value={owner.mobile}
                                  onChange={(e) => updateOwner(owner.id, { mobile: e.target.value })}
                                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                                  placeholder="+971 50 123 4567"
                                />
                              </div>
                            </>
                          ) : (
                            <>
                              <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                  Company Number
                                </label>
                                <input
                                  type="text"
                                  value={owner.companyNo}
                                  onChange={(e) => updateOwner(owner.id, { companyNo: e.target.value })}
                                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                                  placeholder="Company Registration Number"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                  Company Name
                                </label>
                                <input
                                  type="text"
                                  value={owner.companyName}
                                  onChange={(e) => updateOwner(owner.id, { companyName: e.target.value })}
                                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                                  placeholder="Company Name"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                  Company Issue Place
                                </label>
                                <input
                                  type="text"
                                  value={owner.companyIssuePlace}
                                  onChange={(e) => updateOwner(owner.id, { companyIssuePlace: e.target.value })}
                                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                                  placeholder="Dubai, Abu Dhabi, etc."
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                  Company Contact Person
                                </label>
                                <input
                                  type="text"
                                  value={owner.companyContactPerson}
                                  onChange={(e) => updateOwner(owner.id, { companyContactPerson: e.target.value })}
                                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                                  placeholder="Contact Person Name"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                  Contact Number
                                </label>
                                <input
                                  type="tel"
                                  value={owner.contactNumber}
                                  onChange={(e) => updateOwner(owner.id, { contactNumber: e.target.value })}
                                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                                  placeholder="+971 4 123 4567"
                                />
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={addOwner}
                      className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100 transition"
                    >
                      + Add Owner
                    </button>
                  </div>
                </div>

                {/* Managers Section */}
                <div className="border border-slate-200 rounded-2xl p-6">
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">Managers</h2>
                  
                  <div className="space-y-4">
                    {managers.map((manager, index) => (
                      <div key={manager.id} className="border border-slate-100 rounded-xl p-4">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="font-medium text-slate-900">Manager {index + 1}</h3>
                          <button
                            type="button"
                            onClick={() => removeManager(manager.id)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Remove
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                              Role/Position
                            </label>
                            <input
                              type="text"
                              value={manager.role}
                              onChange={(e) => updateManager(manager.id, { role: e.target.value })}
                              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                              placeholder="General Manager, Director, etc."
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                              Nationality
                            </label>
                            <input
                              type="text"
                              value={manager.nationality}
                              onChange={(e) => updateManager(manager.id, { nationality: e.target.value })}
                              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                              placeholder="UAE, India, etc."
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                              Name
                            </label>
                            <input
                              type="text"
                              value={manager.name}
                              onChange={(e) => updateManager(manager.id, { name: e.target.value })}
                              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                              placeholder="Full Name"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                              Mobile Number
                            </label>
                            <input
                              type="tel"
                              value={manager.mobile}
                              onChange={(e) => updateManager(manager.id, { mobile: e.target.value })}
                              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                              placeholder="+971 50 123 4567"
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={addManager}
                      className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100 transition"
                    >
                      + Add Manager
                    </button>
                  </div>
                </div>

                {/* License Activities Section */}
                <div className="border border-slate-200 rounded-2xl p-6">
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">License Activities</h2>
                  
                  <div className="space-y-4">
                    {licenseActivities.map((activity, index) => (
                      <div key={activity.id} className="flex gap-4">
                        <div className="flex-1">
                          <input
                            type="text"
                            value={activity.activity}
                            onChange={(e) => updateLicenseActivity(activity.id, e.target.value)}
                            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                            placeholder="Enter license activity"
                          />
                        </div>
                        {licenseActivities.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeLicenseActivity(activity.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={addLicenseActivity}
                      className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100 transition"
                    >
                      + Add Activity
                    </button>
                  </div>
                </div>

                {/* Address Section */}
                <div className="border border-slate-200 rounded-2xl p-6">
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">Address</h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="has_lease_contract"
                        checked={formData.has_lease_contract}
                        onChange={(e) => setFormData({ ...formData, has_lease_contract: e.target.checked })}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="has_lease_contract" className="ml-2 text-sm text-slate-700">
                        Lease Contract Available
                      </label>
                    </div>

                    {formData.has_lease_contract && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            Lease Contract Number
                          </label>
                          <input
                            type="text"
                            value={formData.lease_contract_number}
                            onChange={(event) => setFormData({ ...formData, lease_contract_number: event.target.value })}
                            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                            placeholder="Lease Contract Number"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            Lease Expiry Date
                          </label>
                          <input
                            type="date"
                            value={formData.lease_expiry_date}
                            onChange={(event) => setFormData({ ...formData, lease_expiry_date: event.target.value })}
                            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Place
                      </label>
                      <input
                        type="text"
                        value={formData.place}
                        onChange={(event) => setFormData({ ...formData, place: event.target.value })}
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                        placeholder="Full Address"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Company Email
                        </label>
                        <input
                          type="email"
                          value={formData.company_email}
                          onChange={(event) => setFormData({ ...formData, company_email: event.target.value })}
                          className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                          placeholder="company@example.com"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Company Mobile
                        </label>
                        <input
                          type="tel"
                          value={formData.company_mobile}
                          onChange={(event) => setFormData({ ...formData, company_mobile: event.target.value })}
                          className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                          placeholder="+971 4 123 4567"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* ICP Details Section */}
                <div className="border border-slate-200 rounded-2xl p-6">
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">ICP Details</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        ICP Establishment Card Number
                      </label>
                      <input
                        type="text"
                        value={formData.icp_establishment_card_number}
                        onChange={(event) => setFormData({ ...formData, icp_establishment_card_number: event.target.value })}
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                        placeholder="ICP Card Number"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        E-channel Username
                      </label>
                      <input
                        type="text"
                        value={formData.echannel_username}
                        onChange={(event) => setFormData({ ...formData, echannel_username: event.target.value })}
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                        placeholder="E-channel Username"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        E-channel Password
                      </label>
                      <input
                        type="password"
                        value={formData.echannel_password}
                        onChange={(event) => setFormData({ ...formData, echannel_password: event.target.value })}
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                        placeholder="E-channel Password"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Establishment Card Issue Date
                      </label>
                      <input
                        type="date"
                        value={formData.establishment_card_issue_date}
                        onChange={(event) => setFormData({ ...formData, establishment_card_issue_date: event.target.value })}
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Establishment Card Expiry Date
                      </label>
                      <input
                        type="date"
                        value={formData.establishment_card_expiry_date}
                        onChange={(event) => setFormData({ ...formData, establishment_card_expiry_date: event.target.value })}
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                      />
                    </div>
                  </div>
                </div>

                {/* MOHRE Details Section */}
                <div className="border border-slate-200 rounded-2xl p-6">
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">MOHRE Details</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        MOHRE Number
                      </label>
                      <input
                        type="text"
                        value={formData.mohre_number}
                        onChange={(event) => setFormData({ ...formData, mohre_number: event.target.value })}
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                        placeholder="MOHRE Number"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        MOHRE Last Update Date
                      </label>
                      <input
                        type="date"
                        value={formData.mohre_last_update_date}
                        onChange={(event) => setFormData({ ...formData, mohre_last_update_date: event.target.value })}
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                      />
                    </div>
                  </div>
                </div>

                {/* DAMAN Details Section */}
                <div className="border border-slate-200 rounded-2xl p-6">
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">DAMAN Details</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        DAMAN Policy Number
                      </label>
                      <input
                        type="text"
                        value={formData.daman_policy_number}
                        onChange={(event) => setFormData({ ...formData, daman_policy_number: event.target.value })}
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                        placeholder="DAMAN Policy Number"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        DAMAN Expiry Date
                      </label>
                      <input
                        type="date"
                        value={formData.daman_expiry_date}
                        onChange={(event) => setFormData({ ...formData, daman_expiry_date: event.target.value })}
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Total Members in DAMAN
                      </label>
                      <input
                        type="number"
                        value={formData.daman_total_members}
                        onChange={(event) => setFormData({ ...formData, daman_total_members: event.target.value })}
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                        placeholder="Number of members"
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Person Details Section */}
                <div className="border border-slate-200 rounded-2xl p-6">
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">Contact Person Details</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Contact Person Name
                      </label>
                      <input
                        type="text"
                        value={formData.contact_person_name}
                        onChange={(event) => setFormData({ ...formData, contact_person_name: event.target.value })}
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                        placeholder="Contact Person Name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Contact Person Mobile
                      </label>
                      <input
                        type="tel"
                        value={formData.contact_person_mobile}
                        onChange={(event) => setFormData({ ...formData, contact_person_mobile: event.target.value })}
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                        placeholder="+971 50 123 4567"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Contact Person Email
                      </label>
                      <input
                        type="email"
                        value={formData.contact_person_email}
                        onChange={(event) => setFormData({ ...formData, contact_person_email: event.target.value })}
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                        placeholder="contact@example.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(event) => setFormData({ ...formData, status: event.target.value as 'active' | 'inactive' })}
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-2xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting ? "Saving..." : editingCompany ? "Update Company" : "Add Company"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="rounded-2xl border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Company Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      CN Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Legal Form
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Contact Person
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Mobile
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {companies.map((company) => (
                    <tr key={company.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                        {company.company_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {company.company_code || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {company.cn_number || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {(company as any).legal_form || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {company.contact_person || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {company.mobile || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          company.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {company.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingCompany(company);
                              // Load existing data into form for editing
                              setFormData({
                                company_name_en: company.company_name,
                                company_name_ar: (company as any).company_name_ar || "",
                                company_number: company.cn_number || "",
                                establishment_date: (company as any).establishment_date || "",
                                issuance_date: (company as any).issuance_date || "",
                                expiry_date: (company as any).expiry_date || "",
                                legal_form: (company as any).legal_form || "",
                                has_lease_contract: (company as any).has_lease_contract || false,
                                lease_contract_number: (company as any).lease_contract_number || "",
                                lease_expiry_date: (company as any).lease_expiry_date || "",
                                place: company.address || "",
                                company_email: company.email || "",
                                company_mobile: company.mobile || "",
                                icp_establishment_card_number: (company as any).icp_establishment_card_number || "",
                                echannel_username: (company as any).echannel_username || "",
                                echannel_password: (company as any).echannel_password || "",
                                establishment_card_issue_date: (company as any).establishment_card_issue_date || "",
                                establishment_card_expiry_date: (company as any).establishment_card_expiry_date || "",
                                mohre_number: (company as any).mohre_number || "",
                                mohre_last_update_date: (company as any).mohre_last_update_date || "",
                                daman_policy_number: (company as any).daman_policy_number || "",
                                daman_expiry_date: (company as any).daman_expiry_date || "",
                                daman_total_members: (company as any).daman_total_members || "",
                                contact_person_name: company.contact_person || "",
                                contact_person_mobile: company.mobile || "",
                                contact_person_email: company.email || "",
                                status: company.status || "active",
                                created_by: company.created_by || "",
                                created_at: company.created_at || "",
                                updated_at: company.updated_at || ""
                              });
                              setCompanyCode(company.company_code || "");
                              setShowForm(true);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(company)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {companies.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-slate-500">No companies found. Add your first company to get started.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
