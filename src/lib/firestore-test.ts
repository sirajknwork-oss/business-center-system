import { collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "./firebase";

export async function testFirestore() {
  try {
    console.log("🔥 Testing Firestore connection...");
    
    // Test adding a company
    const companiesRef = collection(db, "companies");
    await addDoc(companiesRef, {
      companyName: "Test Company LLC",
      licenseNo: "123456",
      email: "test@company.com",
      phone: "+971-50-123-4567",
      createdAt: new Date(),
    });
    
    // Test fetching companies
    const querySnapshot = await getDocs(companiesRef);
    console.log(`✅ Found ${querySnapshot.docs.length} companies`);
    
    querySnapshot.docs.forEach((doc) => {
      console.log(`📄 Company: ${doc.data().companyName}`);
    });
    
    return true;
  } catch (error) {
    console.error("❌ Firestore test failed:", error);
    return false;
  }
}

// Firestore services for business center
export const firestoreServices = {
  // Companies
  async addCompany(companyData: any) {
    const companiesRef = collection(db, "companies");
    return await addDoc(companiesRef, {
      ...companyData,
      createdAt: new Date(),
    });
  },
  
  async getCompanies() {
    const companiesRef = collection(db, "companies");
    const querySnapshot = await getDocs(companiesRef);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  },
  
  // Employees
  async addEmployee(employeeData: any) {
    const employeesRef = collection(db, "employees");
    return await addDoc(employeesRef, {
      ...employeeData,
      createdAt: new Date(),
    });
  },
  
  async getEmployees() {
    const employeesRef = collection(db, "employees");
    const querySnapshot = await getDocs(employeesRef);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  },
  
  // Users
  async addUser(userData: any) {
    const usersRef = collection(db, "users");
    return await addDoc(usersRef, {
      ...userData,
      createdAt: new Date(),
    });
  },
  
  async getUsers() {
    const usersRef = collection(db, "users");
    const querySnapshot = await getDocs(usersRef);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }
};
