// Expiry Tracking Sample Data Generator
// Creates 10 companies with 10 employees each with varied expiry dates and company documents

import { createCompany, type Company } from "@/modules/companies/companiesClient";
import { createEmployee, type Employee } from "@/modules/employees/employeesClient";
import { createExpiryItem, type ExpiryItem } from "@/modules/expiry/expiryClient";

// Helper function to calculate expiry date based on months from now
function getExpiryDate(monthsFromNow: number): string {
  const date = new Date();
  date.setMonth(date.getMonth() + monthsFromNow);
  return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
}

// Sample company names for UAE business centers
const sampleCompanies = [
  { name: "Al Falah Business Center", code: "C-11000" },
  { name: "Gulf Star Typing Services", code: "C-11001" },
  { name: "Emirates Business Solutions", code: "C-11002" },
  { name: "Noor Al Huda Typing", code: "C-11003" },
  { name: "Al Barsha Business Center", code: "C-11004" },
  { name: "Dubai Typing Services", code: "C-11005" },
  { name: "Sharjah Business Hub", code: "C-11006" },
  { name: "Abu Dhabi Typing Center", code: "C-11007" },
  { name: "Ajman Business Services", code: "C-11008" },
  { name: "UAE Business Solutions", code: "C-11009" }
];

// Sample employee names
const firstNames = ["Ahmed", "Mohammed", "Ali", "Hassan", "Omar", "Khalid", "Saeed", "Yusuf", "Abdullah", "Fahad"];
const lastNames = ["Hassan", "Ali", "Mohammed", "Khalid", "Saeed", "Omar", "Yusuf", "Abdullah", "Fahad", "Ahmed"];
const nationalities = ["UAE", "India", "Pakistan", "Bangladesh", "Philippines", "Sri Lanka", "Nepal"];
const designations = ["Senior Typist", "Typist", "Data Entry Clerk", "Document Processor", "Office Assistant", "Receptionist", "Customer Service", "Administrative Assistant"];

// Generate expiry dates for different scenarios
const expiryScenarios = [
  { months: 0, label: "Expired" },      // Already expired
  { months: 1, label: "Critical" },     // 1 month - Red
  { months: 2, label: "Urgent" },      // 2 months - Red
  { months: 3, label: "Warning" },      // 3 months - Pink
  { months: 4, label: "Caution" },      // 4 months - Orange
  { months: 5, label: "Attention" },    // 5 months - Yellow
  { months: 6, label: "Monitor" },      // 6 months - Yellow
  { months: 8, label: "Safe" },        // 8 months - No color
  { months: 10, label: "Good" },       // 10 months - No color
  { months: 12, label: "Excellent" }    // 12 months - No color
];

// Company document templates
const companyDocumentTemplates = [
  { type: "license", category: "legal", title: "Trade License" },
  { type: "registration", category: "legal", title: "Business Registration" },
  { type: "insurance", category: "financial", title: "Liability Insurance" },
  { type: "permit", category: "legal", title: "Commercial Permit" },
  { type: "lease", category: "property", title: "Office Lease Agreement" },
  { type: "certificate", category: "legal", title: "Trade Certificate" },
  { type: "license", category: "financial", title: "Financial License" },
  { type: "registration", category: "legal", title: "VAT Registration" }
];

export async function generateExpirySampleData(): Promise<void> {
  console.log("🚀 Starting expiry sample data generation...");
  
  try {
    // Clear existing data
    localStorage.removeItem('business_center_companies');
    localStorage.removeItem('business_center_employees');
    localStorage.removeItem('business_center_expiry_items');
    console.log("🗑️ Cleared existing data");

    const createdCompanies: Company[] = [];
    
    // Create 10 companies
    for (let i = 0; i < sampleCompanies.length; i++) {
      const companyData = {
        company_code: sampleCompanies[i].code,
        company_name: sampleCompanies[i].name,
        cn_number: `CN-2024-${11000 + i}`,
        trade_license_number: `TL-2024-DXB-${11000 + i}`,
        establishment_card_number: `EC-2024-${11000 + i}`,
        vat_number: `VAT-100${11000 + i}`,
        contact_person: `Manager ${i + 1}`,
        mobile: `+97150110000${i}`,
        email: `info${i + 1}@company${i + 1}.com`,
        address: `Business Center Location ${i + 1}, Dubai, UAE`,
        phone: `+9714123456${i}`,
        website: `https://company${i + 1}.com`,
        fax: `+9714123456${i}`,
        po_box: `${12345 + i}`,
        city: "Dubai",
        state: "Dubai",
        country: "UAE",
        postal_code: `${12345 + i}`,
        notes: `Sample business center ${i + 1} for expiry testing`,
        status: "active"
      };

      const company = await createCompany(companyData);
      createdCompanies.push(company);
      console.log(`✅ Created company: ${company.company_name}`);
    }

    // Create 10 employees for each company
    let totalEmployees = 0;
    for (let companyIndex = 0; companyIndex < createdCompanies.length; companyIndex++) {
      const company = createdCompanies[companyIndex];
      
      for (let employeeIndex = 0; employeeIndex < 10; employeeIndex++) {
        const scenario = expiryScenarios[employeeIndex];
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        
        const employeeData = {
          employee_id: `${company.company_code}-EMP-00${employeeIndex + 1}`,
          company_id: company.id,
          name: `${firstName} ${lastName}`,
          passport_number: `A${Math.floor(Math.random() * 90000000) + 10000000}`,
          visa_number: `V${Math.floor(Math.random() * 90000000) + 10000000}`,
          emirates_id_number: `EID-784-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}-${employeeIndex}`,
          labour_card_number: `LC-${Math.floor(Math.random() * 90000000) + 10000000}`,
          
          // Expiry dates based on scenario
          passport_expiry_date: getExpiryDate(scenario.months + Math.floor(Math.random() * 2)), // Add some randomness
          visa_expiry_date: getExpiryDate(scenario.months + Math.floor(Math.random() * 2)),
          emirates_id_expiry_date: getExpiryDate(scenario.months + Math.floor(Math.random() * 2)),
          labour_card_expiry_date: getExpiryDate(scenario.months + Math.floor(Math.random() * 2)),
          
          designation: designations[Math.floor(Math.random() * designations.length)],
          salary: 2500 + Math.floor(Math.random() * 3000), // 2500-5500 AED
          joining_date: getExpiryDate(-Math.floor(Math.random() * 12)), // Joined 0-12 months ago
          nationality: nationalities[Math.floor(Math.random() * nationalities.length)],
          mobile: `+97150${Math.floor(Math.random() * 90000000) + 10000000}`,
          email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${companyIndex}${employeeIndex}@company${companyIndex + 1}.com`,
          address: `Employee Address ${employeeIndex + 1}, Dubai, UAE`,
          city: "Dubai",
          country: "UAE",
          postal_code: `${12345 + employeeIndex}`,
          emergency_contact_name: `Emergency ${firstName}`,
          emergency_contact_mobile: `+97150${Math.floor(Math.random() * 90000000) + 10000000}`,
          emergency_contact_relation: "Father",
          status: "active",
          role: "staff",
          created_by: "creator"
        };

        await createEmployee(employeeData);
        totalEmployees++;
        
        console.log(`✅ Created employee: ${employeeData.name} (${scenario.label} expiry)`);
      }
    }

    // Create company documents for each company
    let totalDocuments = 0;
    for (let companyIndex = 0; companyIndex < createdCompanies.length; companyIndex++) {
      const company = createdCompanies[companyIndex];
      
      // Create 3-5 documents per company
      const numDocuments = 3 + Math.floor(Math.random() * 3);
      
      for (let docIndex = 0; docIndex < numDocuments; docIndex++) {
        const template = companyDocumentTemplates[docIndex % companyDocumentTemplates.length];
        const scenario = expiryScenarios[Math.floor(Math.random() * expiryScenarios.length)];
        
        const documentData = {
          title: `${template.title} - ${company.company_name}`,
          description: `${template.title} renewal for ${company.company_name} located in Dubai. Valid for business operations within UAE.`,
          expires_at: getExpiryDate(scenario.months + Math.floor(Math.random() * 2)),
          company_id: company.id,
          document_type: template.type,
          document_category: template.category,
          document_status: "active"
        };

        await createExpiryItem(documentData);
        totalDocuments++;
        
        console.log(`✅ Created document: ${documentData.title} (${scenario.label} expiry)`);
      }
    }

    console.log(`🎉 Successfully created ${createdCompanies.length} companies, ${totalEmployees} employees, and ${totalDocuments} company documents with varied expiry dates!`);
    console.log("📊 Sample company documents created:");
    console.log("   - Company documents stored in localStorage under key: business_center_expiry_items");
    console.log("📊 Expiry Scenarios:");
    expiryScenarios.forEach(scenario => {
      console.log(`   ${scenario.months} months: ${scenario.label}`);
    });

  } catch (error) {
    console.error("❌ Error generating sample data:", error);
    throw error;
  }
}

// Function to calculate months until expiry
export function getMonthsUntilExpiry(expiryDate: string): number {
  const today = new Date();
  const expiry = new Date(expiryDate);
  
  // Calculate difference in months
  const monthsDiff = (expiry.getFullYear() - today.getFullYear()) * 12 + 
                   (expiry.getMonth() - today.getMonth());
  
  return monthsDiff;
}

// Function to get expiry color based on months remaining
export function getExpiryColor(expiryDate: string): string {
  const months = getMonthsUntilExpiry(expiryDate);
  
  if (months < 0) return "bg-red-100 text-red-800 border-red-200"; // Expired - Red
  if (months <= 1) return "bg-red-100 text-red-800 border-red-200"; // 1 month - Red
  if (months <= 2) return "bg-red-100 text-red-800 border-red-200"; // 2 months - Red
  if (months <= 3) return "bg-pink-100 text-pink-800 border-pink-200"; // 3 months - Pink
  if (months <= 4) return "bg-orange-100 text-orange-800 border-orange-200"; // 4 months - Orange
  if (months <= 6) return "bg-yellow-100 text-yellow-800 border-yellow-200"; // 5-6 months - Yellow
  
  return "bg-white text-gray-800 border-gray-200"; // 6+ months - White/Normal
}

// Function to get expiry status text
export function getExpiryStatus(expiryDate: string): string {
  const months = getMonthsUntilExpiry(expiryDate);
  
  if (months < 0) return `Expired ${Math.abs(months)} months ago`;
  if (months === 0) return "Expires this month";
  if (months === 1) return "Expires in 1 month";
  return `Expires in ${months} months`;
}
