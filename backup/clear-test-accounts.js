// Script to clear test accounts from local storage
// Run this in browser console or add to a temporary page

// Clear all users from local storage
localStorage.removeItem('business_center_users');

// Reinitialize with only system creator account
const systemUsers = [
  {
    id: '1',
    email: 'sirajkn.work@gmail.com',
    name: 'System Administrator',
    password: 'SirajZaira@126',
    role: 'creator',
    status: 'active',
    created_at: '2024-01-01',
    updated_at: '2024-01-01'
  }
];

localStorage.setItem('business_center_users', JSON.stringify(systemUsers));

console.log('✅ Test accounts cleared successfully!');
console.log('📝 Only system administrator account remains:');
console.log('   Email: sirajkn.work@gmail.com');
console.log('   Password: SirajZaira@126');
console.log('   Role: creator');
