'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { FiHome, FiUser, FiChevronRight } from 'react-icons/fi';
import { SkeletonBreadcrumb, SkeletonCard } from '@/components/ui/SkeletonLoader';

export default function ProfilePage() {
  const [adminData, setAdminData] = useState<{
    name: string;
    mobile: string;
    role: string;
  } | null>(null);
  
  const router = useRouter();

  useEffect(() => {
    // Get admin data from session storage
    const storedAdmin = sessionStorage.getItem('currentAdmin');
    if (!storedAdmin) {
      // Redirect to login if no admin data found
      router.push('/login');
      return;
    }
    
    try {
      const parsedData = JSON.parse(storedAdmin);
      setAdminData(parsedData);
    } catch (error) {
      console.error('Error parsing admin data:', error);
      router.push('/login');
    }
  }, [router]);

  // Format role for display (convert snake_case to Title Case)
  const formatRole = (role: string) => {
    return role
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Breadcrumb */}
        <nav className="flex mb-6" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link href="/dashboard" className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600">
              
                Dashboard
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <FiChevronRight className="text-gray-400" />
                <span className="ml-1 text-sm font-medium text-gray-700 md:ml-2">Profile</span>
              </div>
            </li>
          </ol>
        </nav>

      

        {adminData ? (
          <div className="bg-white shadow-sm rounded-lg p-6">
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-medium text-slate-800 mb-4">Account Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <p className="text-slate-800 text-lg font-medium">{adminData.name}</p>
                    <label className="block text-sm text-gray-500 mt-1">Name</label>
                  </div>
                  <div>
                    <p className="text-slate-800 text-lg font-medium">{formatRole(adminData.role)}</p>
                    <label className="block text-sm text-gray-500 mt-1">Role</label>
                  </div>
                  <div>
                    <p className="text-slate-800 text-lg font-medium">{adminData.mobile}</p>
                    <label className="block text-sm text-gray-500 mt-1">Mobile Number</label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <SkeletonBreadcrumb levels={2} />
            <SkeletonCard rows={1} columns={3} />
          </>
        )}
      </div>
    </DashboardLayout>
  );
} 