'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft, FiEdit, FiTrash2, FiBriefcase, FiUser, FiPhone, FiMail, FiMapPin, FiCalendar, FiCreditCard, FiBook, FiEye, FiCheck, FiX } from 'react-icons/fi';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { getEmployee, deleteEmployee, getEmploymentsByEmployee } from '@/utils/firebaseUtils';
import { Employee, Employment } from '@/types';
import { SkeletonBreadcrumb, SkeletonHeader, SkeletonCard } from '@/components/ui/SkeletonLoader';

// Function to calculate duration between two dates
const calculateDuration = (startDate: string, endDate: string): string => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  const years = Math.floor(diffDays / 365);
  const months = Math.floor((diffDays % 365) / 30);
  const days = Math.floor((diffDays % 365) % 30);
  
  let duration = '';
  if (years > 0) {
    duration += `${years} year${years > 1 ? 's' : ''} `;
  }
  if (months > 0 || years > 0) {
    duration += `${months} month${months > 1 ? 's' : ''} `;
  }
  if (days > 0 || (months === 0 && years === 0)) {
    duration += `${days} day${days > 1 ? 's' : ''}`;
  }
  
  return duration.trim();
};

export default function EmployeeViewPage({ params }: { params: { id: string } }) {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [employments, setEmployments] = useState<Employment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  
  const router = useRouter();
  const id = params.id;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const employeeData = await getEmployee(id);
        setEmployee(employeeData);
        
        // Fetch related employments
        const employmentsData = await getEmploymentsByEmployee(id);
        setEmployments(employmentsData);
      } catch (error: any) {
        setError(error.message || 'Failed to fetch employee data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleDeleteClick = () => {
    setDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteEmployee(id);
      router.push('/employees');
    } catch (error: any) {
      setError(error.message || 'Failed to delete employee');
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm(false);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <SkeletonBreadcrumb levels={3} />
        <SkeletonHeader />
        
        {/* Personal Details Section */}
        <SkeletonCard rows={2} columns={4} />
        
        {/* Address Information */}
        <SkeletonCard rows={1} columns={2} />
        
        {/* Identification Documents */}
        <SkeletonCard rows={1} columns={4} />
        
        {/* Bank Details */}
        <SkeletonCard rows={1} columns={4} />
        
        {/* Educational Details */}
        <SkeletonCard rows={1} columns={4} />
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-4">
          <p>{error}</p>
        </div>
        <div className="mt-4">
          <Link href="/employees" className="text-blue-600 hover:underline flex items-center gap-1">
            <FiArrowLeft size={16} /> Back to Employees
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  if (!employee) {
    return (
      <DashboardLayout>
        <div className="bg-yellow-50 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
          <p>Employee not found</p>
        </div>
        <div className="mt-4">
          <Link href="/employees" className="text-blue-600 hover:underline flex items-center gap-1">
            <FiArrowLeft size={16} /> Back to Employees
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Breadcrumb Navigation */}
      <div className="flex items-center text-sm text-gray-600 mb-4">
        <Link href="/dashboard" className="hover:text-blue-600">Dashboard</Link>
        <span className="mx-2">/</span>
        <Link href="/employees" className="hover:text-blue-600">Employees</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-800 font-medium">{employee.name}</span>
      </div>

      {/* Header with Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <Link
            href="/employees"
            className="px-3 py-1 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 flex items-center gap-1"
          >
            <FiArrowLeft size={14} /> Back
          </Link>
          
          <h1 className="text-xl font-bold text-gray-800 flex-1 text-center">Employee Details</h1>
          
          <div className="flex items-center gap-2">
            <Link
              href={`/employees/${id}/edit`}
              className="border border-amber-500 bg-amber-100 text-amber-600 hover:bg-amber-200 px-3 py-1 rounded-md flex items-center gap-1 text-sm"
            >
              <FiEdit size={14} /> Edit
            </Link>
            
            {!deleteConfirm ? (
              <button
                onClick={handleDeleteClick}
                className="border border-red-500 bg-red-100 text-red-600 hover:bg-red-200 px-3 py-1 rounded-md flex items-center gap-1 text-sm"
              >
                <FiTrash2 size={14} /> Delete
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={confirmDelete}
                  className="border border-red-500 bg-red-100 text-red-600 hover:bg-red-200 px-3 py-1 rounded-md text-sm flex items-center gap-1"
                >
                  <FiCheck size={14} /> Confirm
                </button>
                <button
                  onClick={cancelDelete}
                  className="border border-gray-500 bg-gray-100 text-gray-600 hover:bg-gray-200 px-3 py-1 rounded-md text-sm flex items-center gap-1"
                >
                  <FiX size={14} /> Cancel
                </button>
              </div>
            )}
          </div>
        </div>
        
       
      </div>

      {/* Personal Details Section */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <FiUser className="mr-2" /> Personal Details
        </h2>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <p className="text-lg font-medium text-gray-900">{employee.name || '-'}</p>
              <p className="text-sm text-gray-500">Full Name</p>
            </div>
            
         
            
            <div>
              <p className="text-lg font-medium text-gray-900">
                {employee.dateOfBirth ? new Date(employee.dateOfBirth).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric'
                }) : '-'}
              </p>
              <p className="text-sm text-gray-500">Date of Birth</p>
            </div>
            
            <div>
              <p className="text-lg font-medium text-gray-900">
                {employee.joinDate ? new Date(employee.joinDate).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric'
                }) : '-'}
              </p>
              <p className="text-sm text-gray-500">Join Date</p>
            </div>
            
            <div>
              <span
                className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  employee.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {employee.status}
              </span>
              <p className="text-sm text-gray-500 mt-2">Status</p>
            </div>
            
            <div>
              <p className="text-lg font-medium text-gray-900">{employee.email || '-'}</p>
              <p className="text-sm text-gray-500">Email</p>
            </div>
            
            <div>
              <p className="text-lg font-medium text-gray-900">{employee.phone || '-'}</p>
              <p className="text-sm text-gray-500">Phone</p>
            </div>
            
            {employee.position && (
              <div>
                <p className="text-lg font-medium text-gray-900">{employee.position}</p>
                <p className="text-sm text-gray-500">Position</p>
              </div>
            )}
            
            {employee.department && (
              <div>
                <p className="text-lg font-medium text-gray-900">{employee.department}</p>
                <p className="text-sm text-gray-500">Department</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Addresses Section */}
        <h3 className="text-md font-medium text-gray-700 mt-6 mb-4">Address Information</h3>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-lg font-medium text-gray-900 whitespace-pre-wrap">{employee.currentAddress || '-'}</p>
              <p className="text-sm text-gray-500">Current Address</p>
            </div>
            
            <div>
              <p className="text-lg font-medium text-gray-900 whitespace-pre-wrap">{employee.permanentAddress || '-'}</p>
              <p className="text-sm text-gray-500">Permanent Address</p>
            </div>
          </div>
        </div>
        
        {/* Identification Documents */}
        <h3 className="text-md font-medium text-gray-700 mt-6 mb-4">Identification Documents</h3>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <p className="text-lg font-medium text-gray-900">{employee.aadharCard || '-'}</p>
              <p className="text-sm text-gray-500">Aadhar Card Number</p>
            </div>
            
            <div>
              <p className="text-lg font-medium text-gray-900">{employee.panCard || '-'}</p>
              <p className="text-sm text-gray-500">PAN Card Number</p>
            </div>
            
            <div>
              <p className="text-lg font-medium text-gray-900">{employee.drivingLicense || '-'}</p>
              <p className="text-sm text-gray-500">Driving License Number</p>
            </div>
            
           
          </div>
        </div>
        
        {/* Bank Details */}
        <h3 className="text-md font-medium text-gray-700 mt-6 mb-4">Bank Details</h3>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <p className="text-lg font-medium text-gray-900">{employee.bankName || '-'}</p>
              <p className="text-sm text-gray-500">Bank Name</p>
            </div>
            
            <div>
              <p className="text-lg font-medium text-gray-900">{employee.accountNo || '-'}</p>
              <p className="text-sm text-gray-500">Account Number</p>
            </div>
            
            <div>
              <p className="text-lg font-medium text-gray-900">{employee.ifscCode || '-'}</p>
              <p className="text-sm text-gray-500">IFSC Code</p>
            </div>
            
            <div>
              <p className="text-lg font-medium text-gray-900">{employee.accountHolderName || '-'}</p>
              <p className="text-sm text-gray-500">Account Holder Name</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Educational Details Section */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <FiBook className="mr-2" /> Educational Details
        </h2>
        
        {/* Higher Education */}
        <h3 className="text-md font-medium text-gray-700 mb-4">Higher Education</h3>
        {employee.graduation ? (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

            <div>
                <p className="text-lg font-medium text-gray-900">{employee.graduation.collegeName || '-'}</p>
                <p className="text-sm text-gray-500">College Name</p>
              </div>
              
              <div>
                <p className="text-lg font-medium text-gray-900">{employee.graduation.degree || '-'}</p>
                <p className="text-sm text-gray-500">Degree</p>
              </div>
              
              <div>
                <p className="text-lg font-medium text-gray-900">{employee.graduation.branch || '-'}</p>
                <p className="text-sm text-gray-500">Branch</p>
              </div>
              
              <div>
                <p className="text-lg font-medium text-gray-900">
                  {employee.graduation.month ? `${employee.graduation.month} ` : ''}
                  {employee.graduation.passingYear || '-'}
                </p>
                <p className="text-sm text-gray-500">Passout Year</p>
              </div>
              
             
              
              <div>
                <p className="text-lg font-medium text-gray-900">{employee.graduation.universityName || '-'}</p>
                <p className="text-sm text-gray-500">University Name</p>
              </div>
              
              <div>
                <p className="text-lg font-medium text-gray-900">{employee.graduation.marks || '-'}</p>
                <p className="text-sm text-gray-500">Marks</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-5 mb-4">
            <p className="text-gray-500 italic">No higher education details available</p>
          </div>
        )}
        
        {/* 12th Standard */}
        <h3 className="text-md font-medium text-gray-700 mt-6 mb-4">12th Standard</h3>
        {employee.twelthStandard ? (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <p className="text-lg font-medium text-gray-900">{employee.twelthStandard.school || '-'}</p>
                <p className="text-sm text-gray-500">School Name</p>
              </div>
              
              <div>
                <p className="text-lg font-medium text-gray-900">{employee.twelthStandard.branch || '-'}</p>
                <p className="text-sm text-gray-500">Branch</p>
              </div>
              
              <div>
                <p className="text-lg font-medium text-gray-900">
                  {employee.twelthStandard.month ? `${employee.twelthStandard.month} ` : ''}
                  {employee.twelthStandard.passingYear || '-'}
                </p>
                <p className="text-sm text-gray-500">Passout Year</p>
              </div>
              
              <div>
                <p className="text-lg font-medium text-gray-900">{employee.twelthStandard.marks || '-'}</p>
                <p className="text-sm text-gray-500">Marks</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-5 mb-4">
            <p className="text-gray-500 italic">No 12th standard details available</p>
          </div>
        )}
        
        {/* Other Education */}
        <h3 className="text-md font-medium text-gray-700 mt-6 mb-4">Diploma</h3>
        {employee.otherEducation ? (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
             
            <div>
                <p className="text-lg font-medium text-gray-900">{employee.otherEducation.collegeName || '-'}</p>
                <p className="text-sm text-gray-500">College Name</p>
              </div>


              <div>
                <p className="text-lg font-medium text-gray-900">{employee.otherEducation.branch || '-'}</p>
                <p className="text-sm text-gray-500">Branch</p>
              </div>
              
              <div>
                <p className="text-lg font-medium text-gray-900">
                  {employee.otherEducation.month ? `${employee.otherEducation.month} ` : ''}
                  {employee.otherEducation.passingYear || '-'}
                </p>
                <p className="text-sm text-gray-500">Passout Year</p>
              </div>
              
             
              
              <div>
                <p className="text-lg font-medium text-gray-900">{employee.otherEducation.marks || '-'}</p>
                <p className="text-sm text-gray-500">Marks</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-5 mb-4">
            <p className="text-gray-500 italic">No other education details available</p>
          </div>
        )}
        
        {/* 10th Standard */}
        <h3 className="text-md font-medium text-gray-700 mt-6 mb-4">10th Standard</h3>
        {employee.tenthStandard ? (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <p className="text-lg font-medium text-gray-900">{employee.tenthStandard.school || '-'}</p>
                <p className="text-sm text-gray-500">School</p>
              </div>
              
              <div>
                <p className="text-lg font-medium text-gray-900">
                  {employee.tenthStandard.month ? `${employee.tenthStandard.month} ` : ''}
                  {employee.tenthStandard.passingYear || '-'}
                </p>
                <p className="text-sm text-gray-500">Passout Year</p>
              </div>
              
              <div>
                <p className="text-lg font-medium text-gray-900">{employee.tenthStandard.marks || '-'}</p>
                <p className="text-sm text-gray-500">Marks</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-5 mb-4">
            <p className="text-gray-500 italic">No 10th standard details available</p>
          </div>
        )}
      </div>

      {/* Employment History */}
    
    </DashboardLayout>
  );
} 