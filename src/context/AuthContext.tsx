'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  signInWithPhoneNumber, 
  PhoneAuthProvider, 
  signOut,
  onAuthStateChanged,
  User,
  RecaptchaVerifier,
  signInWithCredential,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { clearFirestoreCache } from '@/utils/firebaseUtils';
import { AdminUser } from '@/firebase/admin-auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

// Extend Window interface to include recaptchaVerifier
declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier | null;
  }
}

type AuthContextType = {
  currentUser: User | null;
  loading: boolean;
  signInWithPhone: (phoneNumber: string) => Promise<any>;
  verifyOTP: (verificationId: string, otp: string) => Promise<any>;
  signInWithCredentials: (adminUser: AdminUser) => Promise<any>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithPhone = async (phoneNumber: string) => {
    try {
      // Special case for test user - bypass actual SMS
      if (phoneNumber === '+919999999999') {
        // Return a mock verification ID for the test user
        return { verificationId: 'test-verification-id-for-9999999999' };
      }
      
      // For real users, proceed with actual SMS verification
      // Create a RecaptchaVerifier instance
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
          callback: () => {
            // reCAPTCHA solved, allow signInWithPhoneNumber.
            console.log('Recaptcha verified');
          },
          'expired-callback': () => {
            // Response expired. Ask user to solve reCAPTCHA again.
            console.log('Recaptcha expired');
          }
        });
      }

      const appVerifier = window.recaptchaVerifier;
      if (!appVerifier) {
        throw new Error('RecaptchaVerifier is not initialized');
      }
      
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      return { verificationId: confirmationResult.verificationId };
    } catch (error) {
      console.error('Error during phone sign in:', error);
      // Reset the reCAPTCHA so the user can try again
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
      return Promise.reject(error);
    }
  };

  const verifyOTP = async (verificationId: string, otp: string) => {
    try {
      // Special case for test user
      if (verificationId === 'test-verification-id-for-9999999999') {
        // For test user, any 6-digit OTP is valid
        if (otp.length === 6) {
          return { user: { uid: 'test-user-uid', phoneNumber: '+919999999999' } };
        } else {
          throw new Error('Invalid verification code');
        }
      }
      
      // For real users, verify with Firebase
      const credential = PhoneAuthProvider.credential(verificationId, otp);
      const result = await signInWithCredential(auth, credential);
      return { user: result.user };
    } catch (error) {
      console.error('Error during OTP verification:', error);
      return Promise.reject(error);
    }
  };

  // New method for admin credentials authentication
  const signInWithCredentials = async (adminUser: AdminUser) => {
    try {
      // Format the phone number with country code
      const phoneNumber = `+91${adminUser.mobile}`;
      
      // Create RecaptchaVerifier if it doesn't exist
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
          callback: () => {
            console.log('Recaptcha verified');
          },
          'expired-callback': () => {
            console.log('Recaptcha expired');
          }
        });
      }

      const appVerifier = window.recaptchaVerifier;
      if (!appVerifier) {
        throw new Error('RecaptchaVerifier is not initialized');
      }
      
      // Send verification code
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      
      // Since this is a hardcoded admin, we'll use a verification bypass approach
      // In a real application, you would need to implement a proper verification flow
      // This is just for demo purposes with hardcoded admins
      
      // Store admin info in session storage
      sessionStorage.setItem('currentAdmin', JSON.stringify({
        name: adminUser.name,
        mobile: adminUser.mobile,
        role: adminUser.role
      }));
      
      return { confirmationResult };
    } catch (error) {
      console.error('Error during admin credentials sign in:', error);
      // Reset the reCAPTCHA so the user can try again
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
      return Promise.reject(error);
    }
  };

  const logout = async () => {
    try {
      console.log('Starting logout process...');
      
      // Clear Firebase cache first to ensure data consistency
      clearFirestoreCache();
      console.log('Firestore cache cleared');
      
      // Clear session storage
      sessionStorage.removeItem('currentAdmin');
      console.log('Session storage cleared');
      
      // Then sign out from Firebase auth
      await signOut(auth);
      console.log('Firebase auth signed out');
    } catch (error) {
      console.error('Error during logout:', error);
      throw error;
    }
  };

  const value = {
    currentUser,
    loading,
    signInWithPhone,
    verifyOTP,
    signInWithCredentials,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 