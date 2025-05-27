import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db } from './config';

// Admin user type definition
export interface AdminUser {
  id: string;
  name: string;
  mobile: string;
  role: string;
  password: string;
}

// Function to authenticate admin user
export const authenticateAdmin = async (mobile: string, password: string): Promise<AdminUser | null> => {
  try {
    console.log(`Authenticating admin with mobile: ${mobile}`);
    
    // Query Firestore for the admin with the provided mobile number
    const adminsRef = collection(db, 'admins');
    const q = query(adminsRef, where('mobile', '==', mobile));
    const querySnapshot = await getDocs(q);
    
    console.log(`Query results: ${querySnapshot.size} documents found`);
    
    if (querySnapshot.empty) {
      console.log('No admin found with this mobile number');
      return null;
    }
    
    // Get the admin document
    const adminDoc = querySnapshot.docs[0];
    const adminData = adminDoc.data() as Omit<AdminUser, 'id'>;
    
    console.log('Admin data found:', { 
      name: adminData.name, 
      mobile: adminData.mobile, 
      role: adminData.role,
      passwordLength: adminData.password ? adminData.password.length : 0
    });
    
    // Check if password matches
    if (adminData.password !== password) {
      console.log('Invalid password');
      return null;
    }
    
    console.log('Authentication successful for:', adminData.name);
    
    // Return the authenticated admin user with complete data
    const adminUser = {
      id: adminDoc.id,
      name: adminData.name,
      mobile: adminData.mobile,
      role: adminData.role,
      password: adminData.password
    };
    
    console.log('Returning admin user data:', {
      id: adminUser.id,
      name: adminUser.name,
      mobile: adminUser.mobile,
      role: adminUser.role
    });
    
    return adminUser;
  } catch (error) {
    console.error('Error authenticating admin:', error);
    return null;
  }
};

// Function to initialize admin users in Firestore
export const initializeAdminUsers = async (): Promise<void> => {
  try {
    console.log('Checking if admin users exist in Firestore...');
    // Check if admin collection already has data
    const adminsRef = collection(db, 'admins');
    const snapshot = await getDocs(adminsRef);
    
    if (!snapshot.empty) {
      console.log(`Found ${snapshot.size} existing admin users in the database`);
      // Log existing admins for debugging
      snapshot.docs.forEach((doc, index) => {
        const admin = doc.data();
        console.log(`Admin ${index + 1}: ${admin.name}, Mobile: ${admin.mobile}, Role: ${admin.role}`);
      });
      
      // Check if test user exists, if not add it
      await ensureTestUserExists();
      return;
    }
    
    console.log('No admin users found, creating default admins...');
    
    // Hardcoded admin users
    const adminUsers = [
      {
        name: 'Viraj Kadam',
        mobile: '8806431723',
        role: 'super_admin',
        password: 'admin1'
      },
      {
        name: 'Santosh Mhetre',
        mobile: '8459719119',
        role: 'admin',
        password: 'admin2'
      },
      {
        name: 'Test Admin',
        mobile: '9999999999',
        role: 'admin',
        password: '123456'
      }
    ];
    
    // Add admin users to Firestore
    for (const admin of adminUsers) {
      await addAdminUser(admin);
    }
    
    console.log('Admin users initialized successfully');
  } catch (error) {
    console.error('Error initializing admin users:', error);
  }
};

// Function to ensure test user exists
export const ensureTestUserExists = async (): Promise<void> => {
  try {
    console.log('Checking if test user exists...');
    const adminsRef = collection(db, 'admins');
    const q = query(adminsRef, where('mobile', '==', '9999999999'));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log('Test user does not exist, creating it...');
      const testUser = {
        name: 'Test Admin',
        mobile: '9999999999',
        role: 'test_admin',
        password: '123456'
      };
      
      await addAdminUser(testUser);
    } else {
      console.log('Test user already exists');
    }
  } catch (error) {
    console.error('Error ensuring test user exists:', error);
  }
};

// Helper function to add an admin user
export const addAdminUser = async (admin: Omit<AdminUser, 'id'>): Promise<string | null> => {
  try {
    console.log(`Attempting to add admin: ${admin.name}, Mobile: ${admin.mobile}`);
    const adminsRef = collection(db, 'admins');
    
    // Check if admin with this mobile already exists
    const q = query(adminsRef, where('mobile', '==', admin.mobile));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      console.log(`Admin with mobile ${admin.mobile} already exists, skipping`);
      return null;
    }
    
    // Add the new admin user
    const docRef = await addDoc(collection(db, 'admins'), admin);
    console.log(`Successfully added admin ${admin.name} with ID: ${docRef.id}`);
    return docRef.id;
  } catch (error) {
    console.error(`Error adding admin user ${admin.name}:`, error);
    return null;
  }
}; 