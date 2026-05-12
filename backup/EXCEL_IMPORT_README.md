# Excel Data Import Guide

This guide explains how to import your Excel data into the Business Center System database.

## Sample Files

I've created sample CSV files to show the expected format:
- `sample-company-master.csv` - Company data
- `sample-employee-master.csv` - Employee data
- `sample-company-information.csv` - Company-employee relationships

You can open these in Excel to see the structure, or create your own Excel file with sheets named similarly.

## Excel File Structure

Your Excel file should have **3 sheets** with the following structure:

### Sheet 1: Company Master
| Column Name | Required | Description |
|-------------|----------|-------------|
| name | Yes | Company name |
| address | No | Company address |

**Example:**
```
name,address
TechCorp Inc.,123 Tech Street, Silicon Valley
DataFlow Solutions,456 Data Ave, New York
CloudNine Systems,789 Cloud Blvd, Austin
```

### Sheet 2: Employee Master
| Column Name | Required | Description |
|-------------|----------|-------------|
| name | Yes | Employee full name |
| email | No | Employee email address |
| company_name | No | Company name (must match Company Master) |
| role | No | Role (admin, staff, customer) - defaults to 'staff' |

**Example:**
```
name,email,company_name,role
John Admin,admin@techcorp.com,TechCorp Inc.,admin
Jane Staff,staff@techcorp.com,TechCorp Inc.,staff
Bob Customer,customer@techcorp.com,TechCorp Inc.,customer
```

### Sheet 3: Company Information
| Column Name | Required | Description |
|-------------|----------|-------------|
| company_name | Yes | Company name (must match Company Master) |
| employee_name | Yes | Employee full name |
| employee_email | No | Employee email address |
| employee_role | No | Role (admin, staff, customer) - defaults to 'staff' |

**Example:**
```
company_name,employee_name,employee_email,employee_role
TechCorp Inc.,Alice Manager,alice@techcorp.com,staff
TechCorp Inc.,Charlie Developer,charlie@techcorp.com,staff
DataFlow Solutions,Diana Analyst,diana@dataflow.com,staff
```

## Testing with Sample Data

To test the import functionality, you can create an Excel file with 3 sheets and copy the data from the sample CSV files:

1. **Create a new Excel file** called `company-data.xlsx`
2. **Add 3 sheets** named:
   - "Company Master"
   - "Employee Master"
   - "Company Information"
3. **Copy data** from the corresponding sample CSV files into each sheet
4. **Save and import** using the command below

## How to Import

1. **Place your Excel file** in the project root directory (next to `package.json`)

2. **Run the import command:**
   ```bash
   npx tsx import-excel.ts ./your-file.xlsx
   ```

   Or use the npm script:
   ```bash
   npm run import-excel ./your-file.xlsx
   ```

   Replace `your-file.xlsx` with your actual Excel file name.

## Important Notes

- **Sheet names are flexible** - the script looks for sheets containing "company master", "employee master", or "company information" (case insensitive)
- **Data validation** - The script will skip invalid data and show error messages
- **Duplicates** - Employees won't be duplicated if they already exist
- **Relationships** - Company names must match exactly between sheets
- **Roles** - Valid roles are: admin, staff, customer (defaults to staff)

## Example Usage

```bash
# Import data from company-data.xlsx
npm run import-excel ./company-data.xlsx

# Import from a different location
npm run import-excel ./data/company-data.xlsx
```

## Troubleshooting

- **File not found**: Make sure the file path is correct
- **Company not found**: Check that company names match exactly between sheets
- **Permission errors**: Make sure you have the correct Supabase credentials in `.env.local`
- **Sheet not found**: Check that your sheet names contain the expected keywords

## After Import

Once imported, you can:
- View companies at `http://localhost:3000/companies`
- View employees at `http://localhost:3000/employees`
- Use the expiry tracking at `http://localhost:3000/expiry`

The imported employees can also be used for authentication by signing up with their email addresses.