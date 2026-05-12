import * as XLSX from 'xlsx';
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env.local') });

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Please check your .env.local file.');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface CompanyData {
  name: string;
  address?: string;
}

interface EmployeeData {
  name: string;
  email?: string;
  company_name?: string;
  role?: string;
}

async function importExcelData(filePath: string) {
  try {
    console.log('Reading Excel file...');

    // Read the Excel file
    const workbook = XLSX.readFile(filePath);

    // Get sheet names
    const sheetNames = workbook.SheetNames;
    console.log('Found sheets:', sheetNames);

    // Process Company Master sheet
    if (sheetNames.some(name => name.toLowerCase().includes('company master'))) {
      console.log('Processing Company Master...');
      const companySheet = workbook.Sheets[sheetNames.find(name =>
        name.toLowerCase().includes('company master'))!];
      const rawCompanyData: unknown[][] = XLSX.utils.sheet_to_json(companySheet, { header: 1 });

      // Skip header row and process data
      for (let i = 1; i < rawCompanyData.length; i++) {
        const row = rawCompanyData[i];
        if (row && row[3]) { // Company Name is in column 3 (0-based index)
          const company: CompanyData = {
            name: String(row[3]), // Company Name
            address: row[4] ? String(row[4]) : undefined // Mobile No as address
          };

          try {
            const { error } = await supabase
              .from('companies')
              .insert({
                name: company.name,
                address: company.address
              })
              .select();

            if (error) {
              console.error('Error inserting company:', company.name, error);
            } else {
              console.log('✓ Inserted company:', company.name);
            }
          } catch (err) {
            console.error('Error processing company:', company.name, err);
          }
        }
      }
    }

    // Process Employee Master sheet
    if (sheetNames.some(name => name.toLowerCase().includes('employee master'))) {
      console.log('Processing Employee Master...');
      const employeeSheet = workbook.Sheets[sheetNames.find(name =>
        name.toLowerCase().includes('employee master'))!];
      const rawEmployeeData: unknown[][] = XLSX.utils.sheet_to_json(employeeSheet, { header: 1 });

      // Skip header row and process data
      for (let i = 1; i < rawEmployeeData.length; i++) {
        const row = rawEmployeeData[i];
        if (row && row[4]) { // Employee Name is in column 4 (0-based index)
          const employee: EmployeeData = {
            name: String(row[4]), // Name
            email: undefined, // No email in this sheet
            company_name: row[2] ? String(row[2]) : undefined, // COMPANY NAME
            role: 'staff' // Default role
          };

          try {
            // Find company ID if company_name is provided
            let companyId = null;
            if (employee.company_name) {
              const { data: companyData } = await supabase
                .from('companies')
                .select('id')
                .eq('name', employee.company_name)
                .single();

              companyId = companyData?.id;
            }

            const { error } = await supabase
              .from('employees')
              .insert({
                name: employee.name,
                email: employee.email,
                company_id: companyId,
                role: employee.role || 'staff'
              })
              .select();

            if (error) {
              console.error('Error inserting employee:', employee.name, error);
            } else {
              console.log('✓ Inserted employee:', employee.name);
            }
          } catch (err) {
            console.error('Error processing employee:', employee.name, err);
          }
        }
      }
    }

    // Process Company Information sheet (company's employee details)
    // Note: Com_Scr sheet contains company summary data, not employee details
    // Skipping this sheet as it doesn't match expected format
    console.log('Skipping Com_Scr sheet (company summary data, not employee details)');

    console.log('Excel import completed!');

  } catch (error) {
    console.error('Error importing Excel data:', error);
  }
}

// Check if file path is provided
const filePath = process.argv[2];
if (!filePath) {
  console.log('Usage: npx tsx import-excel.ts <path-to-excel-file>');
  console.log('Example: npx tsx import-excel.ts ./data/company-data.xlsx');
  process.exit(1);
}

// Check if file exists
if (!fs.existsSync(filePath)) {
  console.error('File not found:', filePath);
  process.exit(1);
}

importExcelData(filePath);