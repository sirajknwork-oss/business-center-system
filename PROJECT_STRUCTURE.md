# Professional Business Center System - Project Structure

## 📁 Complete Folder Structure

```
business-center-system/
├── 📄 DATABASE_SCHEMA.md
├── 📄 PROJECT_STRUCTURE.md
├── 📄 DEVELOPMENT_ROADMAP.md
├── 📄 README.md
├── 📄 package.json
├── 📄 tsconfig.json
├── 📄 next.config.ts
├── 📄 tailwind.config.js
├── 📄 .env.local
│
├── 📁 app/                          # Next.js App Router
│   ├── 📄 layout.tsx                # Root layout
│   ├── 📄 page.tsx                  # Home/Landing page
│   ├── 📄 globals.css               # Global styles
│   │
│   ├── 📁 (auth)/                   # Auth group
│   │   ├── 📁 login/
│   │   │   └── 📄 page.tsx
│   │   └── 📁 signup/
│   │       └── 📄 page.tsx
│   │
│   ├── 📁 (dashboard)/              # Dashboard group
│   │   ├── 📄 layout.tsx            # Dashboard layout
│   │   ├── 📁 dashboard/
│   │   │   └── 📄 page.tsx
│   │   ├── 📁 companies/
│   │   │   ├── 📄 page.tsx
│   │   │   └── 📁 [id]/
│   │   │       └── 📄 page.tsx
│   │   ├── 📁 employees/
│   │   │   ├── 📄 page.tsx          # Master employee sheet
│   │   │   ├── 📁 [id]/
│   │   │   │   └── 📄 page.tsx
│   │   │   └── 📁 add/
│   │   │       └── 📄 page.tsx
│   │   ├── 📁 expiries/
│   │   │   ├── 📄 page.tsx
│   │   │   └── 📁 alerts/
│   │   │       └── 📄 page.tsx
│   │   ├── 📁 documents/
│   │   │   ├── 📄 page.tsx
│   │   │   ├── 📁 employee/
│   │   │   └── 📁 company/
│   │   ├── 📁 users/
│   │   │   ├── 📄 page.tsx
│   │   │   ├── 📁 admins/
│   │   │   ├── 📁 staff/
│   │   │   └── 📁 customers/
│   │   ├── 📁 reports/
│   │   │   ├── 📄 page.tsx
│   │   │   └── 📁 activity/
│   │   │       └── 📄 page.tsx
│   │   └── 📁 settings/
│   │       └── 📄 page.tsx
│   │
│   ├── 📁 api/                      # API Routes
│   │   ├── 📁 auth/
│   │   │   ├── 📄 login/
│   │   │   │   └── 📄 route.ts
│   │   │   └── 📄 logout/
│   │   │       └── 📄 route.ts
│   │   ├── 📁 companies/
│   │   │   ├── 📄 route.ts
│   │   │   └── 📁 [id]/
│   │   │       └── 📄 route.ts
│   │   ├── 📁 employees/
│   │   │   ├── 📄 route.ts
│   │   │   └── 📁 [id]/
│   │   │       └── 📄 route.ts
│   │   ├── 📁 expiries/
│   │   │   └── 📄 route.ts
│   │   ├── 📁 documents/
│   │   │   └── 📄 upload/
│   │   │       └── 📄 route.ts
│   │   ├── 📁 users/
│   │   │   ├── 📄 route.ts
│   │   │   └── 📁 create/
│   │   │       └── 📄 route.ts
│   │   └── 📁 notifications/
│   │       └── 📄 route.ts
│   │
│   └── 📁 (customer)/               # Customer portal
│       ├── 📄 layout.tsx
│       ├── 📁 dashboard/
│       │   └── 📄 page.tsx
│       ├── 📁 employees/
│       │   └── 📄 page.tsx
│       └── 📁 documents/
│           └── 📄 page.tsx
│
├── 📁 components/                    # Reusable Components
│   ├── 📁 ui/                       # UI Components (ShadCN)
│   │   ├── 📄 button.tsx
│   │   ├── 📄 input.tsx
│   │   ├── 📄 table.tsx
│   │   ├── 📄 form.tsx
│   │   ├── 📄 card.tsx
│   │   ├── 📄 dialog.tsx
│   │   ├── 📄 toast.tsx
│   │   └── 📄 badge.tsx
│   │
│   ├── 📁 layout/                   # Layout Components
│   │   ├── 📄 Header.tsx
│   │   ├── 📄 Sidebar.tsx
│   │   ├── 📄 Footer.tsx
│   │   └── 📄 Navigation.tsx
│   │
│   ├── 📁 forms/                    # Form Components
│   │   ├── 📄 CompanyForm.tsx
│   │   ├── 📄 EmployeeForm.tsx
│   │   ├── 📄 UserForm.tsx
│   │   └── 📄 ExpiryForm.tsx
│   │
│   ├── 📁 tables/                   # Table Components
│   │   ├── 📄 CompaniesTable.tsx
│   │   ├── 📄 EmployeesTable.tsx
│   │   ├── 📄 UsersTable.tsx
│   │   └── 📄 ExpiryTable.tsx
│   │
│   ├── 📁 charts/                   # Dashboard Charts
│   │   ├── 📄 StatsCard.tsx
│   │   ├── 📄 ExpiryChart.tsx
│   │   └── 📄 ActivityChart.tsx
│   │
│   └── 📁 common/                   # Common Components
│       ├── 📄 LoadingSpinner.tsx
│       ├── 📄 SearchBar.tsx
│       ├── 📄 FilterDropdown.tsx
│       ├── 📄 Pagination.tsx
│       └── 📄 ConfirmDialog.tsx
│
├── 📁 lib/                          # Library Files
│   ├── 📄 supabase.ts               # Supabase client
│   ├── 📄 auth.ts                   # Auth utilities
│   ├── 📄 permissions.ts            # Role-based permissions
│   ├── 📄 validations.ts            # Form validations
│   ├── 📄 utils.ts                  # Utility functions
│   └── 📄 constants.ts              # App constants
│
├── 📁 modules/                      # Business Logic Modules
│   ├── 📁 auth/
│   │   ├── 📄 authClient.ts
│   │   ├── 📄 authServer.ts
│   │   └── 📄 authMiddleware.ts
│   │
│   ├── 📁 companies/
│   │   ├── 📄 companiesClient.ts
│   │   ├── 📄 companiesServer.ts
│   │   └── 📄 companiesTypes.ts
│   │
│   ├── 📁 employees/
│   │   ├── 📄 employeesClient.ts
│   │   ├── 📄 employeesServer.ts
│   │   └── 📄 employeesTypes.ts
│   │
│   ├── 📁 expiries/
│   │   ├── 📄 expiriesClient.ts
│   │   ├── 📄 expiriesServer.ts
│   │   └── 📄 expiriesTypes.ts
│   │
│   ├── 📁 documents/
│   │   ├── 📄 documentsClient.ts
│   │   ├── 📄 documentsServer.ts
│   │   └── 📄 documentsTypes.ts
│   │
│   ├── 📁 users/
│   │   ├── 📄 usersClient.ts
│   │   ├── 📄 usersServer.ts
│   │   └── 📄 usersTypes.ts
│   │
│   ├── 📁 notifications/
│   │   ├── 📄 notificationsClient.ts
│   │   ├── 📄 notificationsServer.ts
│   │   └── 📄 notificationsTypes.ts
│   │
│   └── 📁 activity/
│       ├── 📄 activityClient.ts
│       ├── 📄 activityServer.ts
│       └── 📄 activityTypes.ts
│
├── 📁 types/                        # TypeScript Types
│   ├── 📄 auth.ts
│   ├── 📄 company.ts
│   ├── 📄 employee.ts
│   ├── 📄 expiry.ts
│   ├── 📄 document.ts
│   ├── 📄 user.ts
│   ├── 📄 notification.ts
│   └── 📄 common.ts
│
├── 📁 hooks/                        # Custom React Hooks
│   ├── 📄 useAuth.ts
│   ├── 📄 usePermissions.ts
│   ├── 📄 useCompanies.ts
│   ├── 📄 useEmployees.ts
│   ├── 📄 useExpiries.ts
│   ├── 📄 useDocuments.ts
│   └── 📄 useNotifications.ts
│
├── 📁 stores/                       # State Management (Zustand)
│   ├── 📄 authStore.ts
│   ├── 📄 companyStore.ts
│   ├── 📄 employeeStore.ts
│   ├── 📄 notificationStore.ts
│   └── 📄 globalStore.ts
│
├── 📁 public/                       # Public Assets
│   ├── 📁 images/
│   ├── 📁 icons/
│   ├── 📁 documents/
│   └── 📄 favicon.ico
│
└── 📁 scripts/                      # Utility Scripts
    ├── 📄 setup-database.js
    ├── 📄 seed-data.js
    ├── 📄 backup-data.js
    └── 📄 migrate-schema.js
```

## 🎯 Key Architecture Principles

### 1. **Separation of Concerns**
- **Components**: UI only
- **Modules**: Business logic
- **Types**: TypeScript definitions
- **Hooks**: State management
- **Stores**: Global state

### 2. **Role-Based Structure**
- `(dashboard)` group: Authenticated users
- `(customer)` group: Customer portal
- `(auth)` group: Login/signup

### 3. **Professional Module Pattern**
Each module has:
- **Client**: Frontend functions
- **Server**: Backend API functions
- **Types**: TypeScript interfaces

### 4. **Reusable Components**
- **UI**: ShadCN components
- **Forms**: Form-specific components
- **Tables**: Table components
- **Common**: Shared utilities

## 🚀 Development Flow

### Phase 1: Core Infrastructure
1. Database schema implementation
2. Auth system setup
3. Basic layout and navigation
4. Role-based access control

### Phase 2: Core Modules
1. Companies CRUD
2. Employees CRUD (most important)
3. User management
4. Basic dashboard

### Phase 3: Advanced Features
1. Expiry tracking with alerts
2. Document management
3. Activity logging
4. Reports and analytics

### Phase 4: Professional Features
1. Advanced filtering/search
2. Export functionality
3. Notifications system
4. Customer portal

## 🔧 Technology Stack

### Frontend
- **Next.js 16**: App Router
- **React 19**: Components
- **TypeScript**: Type safety
- **TailwindCSS**: Styling
- **ShadCN UI**: Components
- **Zustand**: State management

### Backend
- **Supabase**: Database & Auth
- **PostgreSQL**: Database
- **Row Level Security**: Data protection

### Development
- **ESLint**: Code quality
- **Prettier**: Code formatting
- **GitHub**: Version control

## 📋 File Naming Conventions

### Components
- **PascalCase**: `CompanyForm.tsx`, `EmployeesTable.tsx`
- **Folder structure**: Group by type (forms, tables, ui)

### Modules
- **camelCase**: `companiesClient.ts`, `employeesTypes.ts`
- **Consistent pattern**: Client/Server/Types

### Pages
- **route.ts**: API routes
- **page.tsx**: Page components
- **layout.tsx**: Layout components

## 🎨 UI/UX Principles

### 1. **Professional Design**
- Clean, modern interface
- Consistent color scheme
- Responsive design
- Accessibility first

### 2. **UAE Business Context**
- Arabic language support (future)
- Right-to-left ready
- Local business terminology
- Professional appearance

### 3. **User Experience**
- Intuitive navigation
- Clear feedback
- Fast performance
- Mobile responsive

This structure ensures scalability, maintainability, and professional development practices for the UAE Business Center Management System.
