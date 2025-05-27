import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, getDoc, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Employee, Employment } from '../types';

// Simple cache implementation
const cache = {
  employees: null as Employee[] | null,
  employeesTimestamp: 0,
  employments: null as Employment[] | null,
  employmentsTimestamp: 0,
  employeeDetails: new Map<string, {data: Employee, timestamp: number}>(),
  employmentDetails: new Map<string, {data: Employment, timestamp: number}>(),
  cacheDuration: 60000, // 1 minute cache
  currentAdminId: '', // Track the current admin
  
  clearCache() {
    console.log('Clearing all cache data');
    this.employees = null;
    this.employments = null;
    this.employeesTimestamp = 0;
    this.employmentsTimestamp = 0;
    this.employeeDetails.clear();
    this.employmentDetails.clear();
  },
  
  setCurrentAdmin(adminMobile: string) {
    if (this.currentAdminId !== adminMobile) {
      console.log(`Admin changed from ${this.currentAdminId} to ${adminMobile}, clearing cache`);
      this.clearCache();
      this.currentAdminId = adminMobile;
    }
  },
  
  isCacheValid(timestamp: number) {
    // Check if we have a current admin and if the cache is still valid
    if (!this.currentAdminId) {
      console.log('No current admin set, cache invalid');
      return false;
    }
    
    const isValid = Date.now() - timestamp < this.cacheDuration;
    if (!isValid) {
      console.log('Cache expired');
    }
    return isValid;
  }
};

// Employee CRUD operations
export const addEmployee = async (employeeData: Omit<Employee, 'id'>) => {
  try {
    const docRef = await addDoc(collection(db, 'employees'), employeeData);
    // Invalidate cache after adding new data
    cache.employees = null;
    cache.employeesTimestamp = 0;
    return { id: docRef.id, ...employeeData };
  } catch (error) {
    console.error('Error adding employee:', error);
    throw error;
  }
};

export const updateEmployee = async (id: string, employeeData: Partial<Employee>) => {
  try {
    const docRef = doc(db, 'employees', id);
    await updateDoc(docRef, employeeData);
    // Invalidate cache after updating data
    cache.employees = null;
    cache.employeesTimestamp = 0;
    cache.employeeDetails.delete(id);
    return { id, ...employeeData };
  } catch (error) {
    console.error('Error updating employee:', error);
    throw error;
  }
};

export const deleteEmployee = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'employees', id));
    // Invalidate cache after deleting data
    cache.employees = null;
    cache.employeesTimestamp = 0;
    cache.employeeDetails.delete(id);
    return id;
  } catch (error) {
    console.error('Error deleting employee:', error);
    throw error;
  }
};

export const getEmployees = async () => {
  try {
    // Check if we have a valid cache
    if (cache.employees && cache.isCacheValid(cache.employeesTimestamp)) {
      console.log('Using cached employees data');
      return cache.employees;
    }
    
    console.log('Fetching employees from Firestore');
    const querySnapshot = await getDocs(collection(db, 'employees'));
    const employees: Employee[] = [];
    querySnapshot.forEach((doc) => {
      employees.push({ id: doc.id, ...doc.data() } as Employee);
    });
    
    // Update cache
    cache.employees = employees;
    cache.employeesTimestamp = Date.now();
    
    return employees;
  } catch (error) {
    console.error('Error getting employees:', error);
    throw error;
  }
};

export const getEmployee = async (id: string) => {
  try {
    // Check if we have a valid cache for this employee
    const cached = cache.employeeDetails.get(id);
    if (cached && cache.isCacheValid(cached.timestamp)) {
      console.log(`Using cached data for employee ${id}`);
      return cached.data;
    }
    
    console.log(`Fetching employee ${id} from Firestore`);
    const docRef = doc(db, 'employees', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const employee = { id: docSnap.id, ...docSnap.data() } as Employee;
      
      // Update cache
      cache.employeeDetails.set(id, {
        data: employee,
        timestamp: Date.now()
      });
      
      return employee;
    } else {
      throw new Error('Employee not found');
    }
  } catch (error) {
    console.error('Error getting employee:', error);
    throw error;
  }
};

// Employment CRUD operations
export const addEmployment = async (employmentData: Omit<Employment, 'id'>) => {
  try {
    const docRef = await addDoc(collection(db, 'employments'), employmentData);
    // Invalidate cache
    cache.employments = null;
    cache.employmentsTimestamp = 0;
    return { id: docRef.id, ...employmentData };
  } catch (error) {
    console.error('Error adding employment:', error);
    throw error;
  }
};

export const updateEmployment = async (id: string, employmentData: Partial<Employment>) => {
  try {
    const docRef = doc(db, 'employments', id);
    await updateDoc(docRef, employmentData);
    // Invalidate cache
    cache.employments = null;
    cache.employmentsTimestamp = 0;
    cache.employmentDetails.delete(id);
    return { id, ...employmentData };
  } catch (error) {
    console.error('Error updating employment:', error);
    throw error;
  }
};

export const deleteEmployment = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'employments', id));
    // Invalidate cache
    cache.employments = null;
    cache.employmentsTimestamp = 0;
    cache.employmentDetails.delete(id);
    return id;
  } catch (error) {
    console.error('Error deleting employment:', error);
    throw error;
  }
};

export const getEmployments = async () => {
  try {
    // Check if we have a valid cache
    if (cache.employments && cache.isCacheValid(cache.employmentsTimestamp)) {
      console.log('Using cached employments data');
      return cache.employments;
    }
    
    console.log('Fetching employments from Firestore');
    const querySnapshot = await getDocs(collection(db, 'employments'));
    const employments: Employment[] = [];
    querySnapshot.forEach((doc) => {
      employments.push({ id: doc.id, ...doc.data() } as Employment);
    });
    
    // Update cache
    cache.employments = employments;
    cache.employmentsTimestamp = Date.now();
    
    return employments;
  } catch (error) {
    console.error('Error getting employments:', error);
    throw error;
  }
};

export const getEmployment = async (id: string) => {
  try {
    // Check if we have a valid cache for this employment
    const cached = cache.employmentDetails.get(id);
    if (cached && cache.isCacheValid(cached.timestamp)) {
      console.log(`Using cached data for employment ${id}`);
      return cached.data;
    }
    
    console.log(`Fetching employment ${id} from Firestore`);
    const docRef = doc(db, 'employments', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const employment = { id: docSnap.id, ...docSnap.data() } as Employment;
      
      // Update cache
      cache.employmentDetails.set(id, {
        data: employment,
        timestamp: Date.now()
      });
      
      return employment;
    } else {
      throw new Error('Employment not found');
    }
  } catch (error) {
    console.error('Error getting employment:', error);
    throw error;
  }
};

export const getEmploymentsByEmployee = async (employeeId: string) => {
  try {
    const q = query(collection(db, 'employments'), where('employeeId', '==', employeeId));
    const querySnapshot = await getDocs(q);
    const employments: Employment[] = [];
    querySnapshot.forEach((doc) => {
      employments.push({ id: doc.id, ...doc.data() } as Employment);
    });
    return employments;
  } catch (error) {
    console.error('Error getting employments by employee:', error);
    throw error;
  }
};

// Add function to clear cache when needed (e.g., on logout)
export const clearFirestoreCache = () => {
  cache.clearCache();
  cache.currentAdminId = '';
};

// Set current admin for cache isolation
export const setCurrentAdminForCache = (adminMobile: string) => {
  if (adminMobile) {
    cache.setCurrentAdmin(adminMobile);
  } else {
    clearFirestoreCache();
  }
};

// Salary History CRUD operations
export const addSalaryHistory = async (salaryData: Omit<any, 'id'>) => {
  try {
    const docRef = await addDoc(collection(db, 'salaryHistory'), salaryData);
    return { id: docRef.id, ...salaryData };
  } catch (error) {
    console.error('Error adding salary history:', error);
    throw error;
  }
};

export const getSalaryHistoryByEmployment = async (employmentId: string) => {
  try {
    const q = query(collection(db, 'salaryHistory'), where('employmentId', '==', employmentId));
    const querySnapshot = await getDocs(q);
    const salaryHistory: any[] = [];
    querySnapshot.forEach((doc) => {
      salaryHistory.push({ id: doc.id, ...doc.data() });
    });
    return salaryHistory;
  } catch (error) {
    console.error('Error getting salary history:', error);
    throw error;
  }
}; 