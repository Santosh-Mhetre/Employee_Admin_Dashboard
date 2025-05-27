'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/context/AuthContext';
import toast, { Toaster } from 'react-hot-toast';
import { authenticateAdmin } from '@/firebase/admin-auth';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { setCurrentAdminForCache } from '@/utils/firebaseUtils';

type LoginFormValues = {
  mobile: string;
  password: string;
};

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOtp] = useState('');
  const [adminData, setAdminData] = useState<any>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordValue, setPasswordValue] = useState('');
  
  const { register, handleSubmit, formState: { errors }, watch } = useForm<LoginFormValues>();
  const { signInWithPhone, verifyOTP } = useAuth();
  const router = useRouter();
  
  // Watch the password field value
  const watchPassword = watch('password', '');

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Replace with these mouse event handlers
  const handleMouseDown = () => {
    setShowPassword(true);
  };
  
  const handleMouseUp = () => {
    setShowPassword(false);
  };
  
  const handleMouseLeave = () => {
    setShowPassword(false);
  };

  const handleLoginSubmit = async (data: LoginFormValues) => {
    try {
      setIsLoading(true);
      setError(null);
      
      toast.loading('Verifying credentials...', { id: 'login' });
      
      console.log("Attempting login with:", data.mobile);
      
      // Authenticate admin user against Firestore
      const adminUser = await authenticateAdmin(data.mobile, data.password);
      
      console.log("Authentication result:", adminUser ? {
        id: adminUser.id,
        name: adminUser.name,
        mobile: adminUser.mobile,
        role: adminUser.role
      } : 'Authentication failed');
      
      if (!adminUser) {
        throw new Error('Invalid mobile number or password');
      }
      
      // Store admin data for later use
      setAdminData(adminUser);
      
      // Store admin info in session storage directly - make sure we use the actual admin data
      // and don't override it with test admin data
      const adminSessionData = {
        name: adminUser.name,
        mobile: adminUser.mobile,
        role: adminUser.role
      };
      
      // Clear any existing session data first
      sessionStorage.removeItem('currentAdmin');
      
      // Store the new admin data
      sessionStorage.setItem('currentAdmin', JSON.stringify(adminSessionData));
      
      // Set current admin for cache isolation
      setCurrentAdminForCache(adminUser.mobile);
      
      console.log("Stored admin data in session storage:", adminSessionData);
      
      // For hardcoded admins, we'll bypass the SMS verification completely
      // and redirect directly to the dashboard
      toast.success('Login successful!', { id: 'login' });
      
      // Short delay to ensure session storage is updated before navigation
      setTimeout(() => {
        router.push('/dashboard');
      }, 100);
      
    } catch (error: any) {
      setError(error.message || 'Failed to login');
      toast.error(error.message || 'Failed to login', { id: 'login' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!verificationId || !otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit verification code');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      toast.loading('Verifying code...', { id: 'verifyOtp' });
      
      await verifyOTP(verificationId, otp);
      
      // Store admin info in session storage
      if (adminData) {
        sessionStorage.setItem('currentAdmin', JSON.stringify({
          name: adminData.name,
          mobile: adminData.mobile,
          role: adminData.role
        }));
      }
      
      toast.success('Login successful!', { id: 'verifyOtp' });
      
      // Navigate to dashboard
      router.push('/dashboard');
    } catch (error: any) {
      setError(error.message || 'Invalid verification code');
      toast.error(error.message || 'Invalid verification code', { id: 'verifyOtp' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Toaster position="top-center" />
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Admin Login</h1>
          <p className="mt-2 text-gray-600">
            {showOTP ? 'Enter verification code' : 'Enter your credentials to continue'}
          </p>
        
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 p-4 rounded-md">
            {error}
          </div>
        )}

        {!showOTP ? (
          <form 
            onSubmit={handleSubmit(handleLoginSubmit)}
            className="mt-8 space-y-6"
          >
            <div>
              <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-2">
                Mobile Number
              </label>
              <input
                id="mobile"
                type="tel"
                inputMode="numeric"
                {...register('mobile', { 
                  required: 'Mobile number is required',
                  pattern: {
                    value: /^[0-9]{10}$/,
                    message: 'Please enter a valid 10-digit mobile number'
                  }
                })}
                className="py-3 px-4 block w-full rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500 text-black"
                placeholder="Enter mobile number"
              />
              {errors.mobile && (
                <p className="mt-2 text-sm text-red-600">{errors.mobile.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  {...register('password', { 
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters'
                    }
                  })}
                  className="py-3 px-4 block w-full rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500 text-black"
                  placeholder="Enter password"
                  autoComplete="current-password"
                />
                {watchPassword && watchPassword.length > 0 && (
                  <button
                    type="button"
                    onMouseDown={handleMouseDown}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseLeave}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    <FiEye size={20} />
                  </button>
                )}
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Verifying...' : 'Login'}
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-8 space-y-6">
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                Verification Code
              </label>
              <input
                id="otp"
                type="text"
                inputMode="numeric"
                value={otp}
                onChange={(e) => setOtp(e.target.value.slice(0, 6))}
                className="py-3 px-4 block w-full rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500 text-black"
                placeholder="Enter 6-digit code"
                maxLength={6}
              />
            </div>

            <div>
              <button
                onClick={handleVerifyOTP}
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Verifying...' : 'Verify & Login'}
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setShowOTP(false)}
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                Back to Login
              </button>
            </div>
          </div>
        )}
        
        {/* Hidden recaptcha container */}
        <div id="recaptcha-container"></div>
      </div>
    </div>
  );
} 