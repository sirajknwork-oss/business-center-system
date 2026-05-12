# Production Cleanup Plan

## 📋 Files Identified for Deletion/Modification

### **🗑️ Sample/Dummy Files to Delete:**
```
d:\saas\business-center-system\sample-company-master.csv
d:\saas\business-center-system\sample-company-information.csv
d:\saas\business-center-system\sample-data.sql
d:\saas\business-center-system\sample-employee-master.csv
d:\saas\business-center-system\modules\auth\sampleUsers.ts
d:\saas\business-center-system\browser-test.html
```

### **🗑️ Backup Files to Delete:**
```
d:\saas\business-center-system\app\expiry\page-backup.tsx
d:\saas\business-center-system\app\dashboard\page-old.tsx
d:\saas\business-center-system\app\employees\page-old.tsx
d:\saas\business-center-system\app\expiry\page-old.tsx
d:\saas\business-center-system\modules\auth\authClient-old.ts
d:\saas\business-center-system\modules\expiry\expiryDataGenerator-backup.ts
d:\saas\business-center-system\modules\expiry\expiryClient-backup.ts
```

### **🗑️ Temporary Files to Delete:**
```
d:\saas\business-center-system\modules\companies\companiesClient-temp.ts
d:\saas\business-center-system\modules\employees\employeesClient-temp.ts
d:\saas\business-center-system\modules\expiry\expiryClient-temp.ts
```

### **🗑️ Debug/Test Files to Delete:**
```
d:\saas\business-center-system\debug-tsx.js
d:\saas\business-center-system\debug-admin-flow.js
d:\saas\business-center-system\debug-admin-creation.js
```

## 📝 Files to Modify (Remove Sample Data Logic)

### **🔧 Code Files to Clean Up:**
```
d:\saas\business-center-system\app\companies\page.tsx (remove sample data generation)
d:\saas\business-center-system\app\employees\page.tsx (remove sample data generation)
d:\saas\business-center-system\app\expiry\page.tsx (remove sample data generation)
d:\saas\business-center-system\modules\expiry\expiryDataGenerator.ts (remove sample functions)
d:\saas\business-center-system\modules\auth\userStorageClient.ts (remove sample user creation)
```

## ✅ Preserving Creator Authentication

### **🔒 Files to Keep (Creator Logic):**
```
d:\saas\business-center-system\modules\auth\authClient.ts (keep SAMPLE_USERS with creator)
d:\saas\business-center-system\modules\auth\userStorageClient.ts (keep authentication logic)
d:\saas\business-center-system\security-config.ts (keep creator credentials)
```

## 🚀 Cleanup Actions

### **Phase 1: Delete Sample Files**
- Delete all CSV sample files
- Delete all backup files
- Delete all temporary files
- Delete all debug/test files

### **Phase 2: Remove Sample Data Logic**
- Remove `initializeSampleCompanies()` calls
- Remove `initializeSampleEmployees()` calls
- Remove `generateExpirySampleData()` calls
- Remove hardcoded sample data

### **Phase 3: Clean Up Code**
- Remove sample data generation functions
- Remove test data creation logic
- Remove debug console logs
- Remove development-only code

## 📋 Expected Results

### **✅ After Cleanup:**
- Clean production-ready codebase
- No sample data generation
- No backup/temporary files
- Preserved creator authentication
- Optimized for production deployment
