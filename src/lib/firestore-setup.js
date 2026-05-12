// Firestore Database Setup Script
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: "your-api-key-here",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Create collections
async function createCollections() {
  try {
    console.log('🔥 Creating Firestore collections...');
    
    // Companies collection
    const companiesRef = collection(db, 'companies');
    await addDoc(companiesRef, {
      name: 'Test Company 1',
      email: 'test1@example.com',
      phone: '+971-50-123-4567',
      cn_number: 'CN123456',
      trade_license: 'TL123456',
      created_at: new Date()
    });
    
    // Employees collection
    const employeesRef = collection(db, 'employees');
    await addDoc(employeesRef, {
      name: 'Test Employee 1',
      email: 'employee1@example.com',
      phone: '+971-50-123-4568',
      position: 'Manager',
      company_id: 'test-company-id',
      created_at: new Date()
    });
    
    // Expiry items collection
    const expiryRef = collection(db, 'expiry_items');
    await addDoc(expiryRef, {
      item_type: 'visa',
      expiry_date: '2024-12-31',
      employee_id: 'test-employee-id',
      status: 'active',
      created_at: new Date()
    });
    
    console.log('✅ Firestore collections created successfully!');
    console.log('📊 Collections created:');
    console.log('   - companies');
    console.log('   - employees');
    console.log('   - expiry_items');
    
  } catch (error) {
    console.error('❌ Error creating collections:', error);
  }
}

// Run the setup
createCollections();

module.exports = { createCollections };
