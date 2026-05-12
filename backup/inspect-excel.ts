import * as XLSX from 'xlsx';
import * as path from 'path';

// Inspect Excel file structure
const filePath = './company-details.xlsx';

try {
  const workbook = XLSX.readFile(filePath);
  const sheetNames = workbook.SheetNames;

  console.log('Excel file structure:');
  console.log('Sheets found:', sheetNames);

  sheetNames.forEach(sheetName => {
    console.log(`\n=== ${sheetName} ===`);
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    if (data.length > 0) {
      console.log('First row (headers):', data[0]);
      console.log('Sample data rows:');
      for (let i = 1; i < Math.min(4, data.length); i++) {
        console.log(`  Row ${i}:`, data[i]);
      }
      console.log(`Total rows: ${data.length}`);
    } else {
      console.log('No data in this sheet');
    }
  });

} catch (error) {
  console.error('Error reading Excel file:', error);
}