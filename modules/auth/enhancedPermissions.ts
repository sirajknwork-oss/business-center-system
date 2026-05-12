// Enhanced Role-Based Permissions System
// Defines detailed permissions for each role in the business center system

export interface RolePermissions {
  companies: {
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
    edit: boolean;
    view: boolean;
    assign: boolean;
  };
  staff: {
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
    assign: boolean;
    view: boolean;
  };
  customers: {
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
    edit: boolean;
    view: boolean;
    assign: boolean;
  };
  users: {
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
    assign: boolean;
    view: boolean;
  };
  employees: {
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
    edit: boolean;
    view: boolean;
  };
  expiry: {
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
    view: boolean;
  };
  system: {
    fullAccess: boolean;
    manageAdmins: boolean;
    manageStaff: boolean;
    manageCustomers: boolean;
    assignCompanies: boolean;
  };
}

export const ROLE_PERMISSIONS: Record<string, RolePermissions> = {
  creator: {
    companies: {
      create: true,
      read: true,
      update: true,
      delete: true,
      edit: true,
      view: true,
      assign: true
    },
    staff: {
      create: true,
      read: true,
      update: true,
      delete: true,
      assign: true,
      view: true
    },
    customers: {
      create: true,
      read: true,
      update: true,
      delete: true,
      edit: true,
      view: true,
      assign: true
    },
    users: {
      create: true,
      read: true,
      update: true,
      delete: true,
      assign: true,
      view: true
    },
    employees: {
      create: true,
      read: true,
      update: true,
      delete: true,
      edit: true,
      view: true
    },
    expiry: {
      create: true,
      read: true,
      update: true,
      delete: true,
      view: true
    },
    system: {
      fullAccess: true,
      manageAdmins: true,
      manageStaff: true,
      manageCustomers: true,
      assignCompanies: true
    }
  },
  admin: {
    companies: {
      create: true,
      read: true,
      update: true,
      delete: true,
      edit: true,
      view: true,
      assign: true
    },
    staff: {
      create: true,
      read: true,
      update: true,
      delete: true,
      assign: true,
      view: true
    },
    customers: {
      create: true,
      read: true,
      update: true,
      delete: true,
      edit: true,
      view: true,
      assign: true
    },
    users: {
      create: false, // Cannot create admins
      read: true,
      update: false, // Cannot update other admins
      delete: false,
      assign: true,
      view: true
    },
    employees: {
      create: true,
      read: true,
      update: true,
      delete: true,
      edit: true,
      view: true
    },
    expiry: {
      create: true,
      read: true,
      update: true,
      delete: true,
      view: true
    },
    system: {
      fullAccess: false,
      manageAdmins: false, // Cannot manage other admins
      manageStaff: true,
      manageCustomers: true,
      assignCompanies: true
    }
  },
  staff: {
    companies: {
      create: false, // Cannot create companies
      read: true,
      update: true, // Can update companies created by creator/admin
      delete: false,
      edit: true,
      view: true,
      assign: false // Cannot be assigned companies by admin
    },
    staff: {
      create: false,
      read: true,
      update: false,
      delete: false,
      assign: false,
      view: true
    },
    customers: {
      create: false,
      read: true,
      update: false,
      delete: false,
      edit: false,
      view: true,
      assign: false
    },
    users: {
      create: false,
      read: false,
      update: false,
      delete: false,
      assign: false,
      view: false
    },
    employees: {
      create: true, // Can add employees in assigned companies
      read: true,  // Can view employees in assigned companies
      update: true, // Can update employees in assigned companies
      delete: true, // Can delete employees in assigned companies
      edit: true,
      view: true
    },
    expiry: {
      create: false,
      read: true,
      update: true,
      delete: false,
      view: true
    },
    system: {
      fullAccess: false,
      manageAdmins: false,
      manageStaff: false,
      manageCustomers: false,
      assignCompanies: false
    }
  },
  customer: {
    companies: {
      create: false,
      read: true, // Can view assigned companies
      update: false,
      delete: false,
      edit: false,
      view: true,
      assign: false
    },
    staff: {
      create: false,
      read: false,
      update: false,
      delete: false,
      assign: false,
      view: false
    },
    customers: {
      create: false,
      read: true, // Can view own details
      update: false,
      delete: false,
      edit: false,
      view: true,
      assign: false
    },
    users: {
      create: false,
      read: false,
      update: false,
      delete: false,
      assign: false,
      view: false
    },
    employees: {
      create: false,
      read: true, // Can view employees in assigned companies
      update: false,
      delete: false,
      edit: false,
      view: true
    },
    expiry: {
      create: false,
      read: true, // Can view expiry for assigned companies
      update: false,
      delete: false,
      view: true
    },
    system: {
      fullAccess: false,
      manageAdmins: false,
      manageStaff: false,
      manageCustomers: false,
      assignCompanies: false
    }
  }
};

// Check if user has specific permission
export function hasPermission(
  userRole: string,
  category: keyof RolePermissions,
  action: string
): boolean {
  const permissions = ROLE_PERMISSIONS[userRole];
  if (!permissions) return false;
  
  const categoryPermissions = permissions[category] as any;
  return categoryPermissions[action] || false;
}

// Check if user can access specific company
export function canAccessCompany(
  userRole: string,
  userEmail: string,
  companyCode: string,
  assignedCompanies?: string[]
): boolean {
  // Creator and Admin can access all companies
  if (userRole === 'creator' || userRole === 'admin') {
    return true;
  }
  
  // Staff can access assigned companies
  if (userRole === 'staff' && assignedCompanies) {
    return assignedCompanies.includes(companyCode);
  }
  
  // Customer can access assigned companies
  if (userRole === 'customer' && assignedCompanies) {
    return assignedCompanies.includes(companyCode);
  }
  
  return false;
}

// Get user's accessible companies
export function getAccessibleCompanies(
  userRole: string,
  userEmail: string,
  allCompanies: any[],
  assignedCompanies?: string[]
) {
  if (userRole === 'creator' || userRole === 'admin') {
    return allCompanies; // Full access
  }
  
  if (userRole === 'staff' || userRole === 'customer') {
    if (!assignedCompanies) return [];
    return allCompanies.filter(company => 
      assignedCompanies.includes(company.company_code || '') || 
      assignedCompanies.includes(company.id || '')
    );
  }
  
  return [];
}

// Check if user can perform action on specific company
export function canPerformCompanyAction(
  userRole: string,
  action: string,
  companyCreatedBy?: string,
  userRoleForCompany?: string
): boolean {
  // Creator can do anything
  if (userRole === 'creator') return true;
  
  // Admin can do anything except manage other admins
  if (userRole === 'admin') {
    return action !== 'manageAdmins';
  }
  
  // Staff can only update/edit companies created by creator/admin
  if (userRole === 'staff') {
    if (action === 'create') return false;
    if (action === 'update' || action === 'edit') {
      return companyCreatedBy === 'creator' || companyCreatedBy === 'admin';
    }
    return false;
  }
  
  // Customer can only view
  if (userRole === 'customer') {
    return action === 'read' || action === 'view';
  }
  
  return false;
}

// Get user's dashboard features based on role
export function getDashboardFeatures(userRole: string) {
  const features = {
    creator: [
      'companies', 'staff', 'customers', 'users', 'expiry', 'reports', 'settings'
    ],
    admin: [
      'companies', 'staff', 'customers', 'expiry', 'reports'
    ],
    staff: [
      'companies', 'expiry'
    ],
    customer: [
      'companies', 'expiry'
    ]
  };
  
  return features[userRole as keyof typeof features] || [];
}
