'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { FiHome, FiUser, FiChevronRight, FiArrowLeft } from 'react-icons/fi';
import { SkeletonBreadcrumb, SkeletonCard, SkeletonHeader } from '@/components/ui/SkeletonLoader';

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
      {/* Breadcrumb Navigation */}
      <div className="flex items-center text-sm text-gray-600 mb-4">
        <Link href="/dashboard" className="hover:text-blue-600">Dashboard</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-800 font-medium">Profile</span>
      </div>
      
      {/* Header with Back Button */}
      <div className="flex justify-between items-center mb-6">
        <Link
          href="/dashboard"
          className="px-3 py-1 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 flex items-center gap-1"
        >
          <FiArrowLeft size={14} /> Back
        </Link>
        
        <h1 className="text-xl font-bold text-gray-800 flex-1 text-center">
          Profile Information
        </h1>
        
        <div className="px-3 py-1 opacity-0">
          {/* Empty div for spacing */}
          <FiArrowLeft size={14} className="invisible" />
        </div>
      </div>

      {adminData ? (
        <div className="bg-white shadow-sm rounded-lg p-6">
          <div className="space-y-6">
            <div>
             
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
          <SkeletonHeader />
          <SkeletonCard rows={1} columns={3} />
        </>
      )}
    </DashboardLayout>
  );
} 