'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft, FiEdit, FiTrash2, FiUser, FiBriefcase, FiCalendar, FiDollarSign, FiMapPin } from 'react-icons/fi';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { getEmployment, deleteEmployment, getEmployee } from '@/utils/firebaseUtils';
import { Employment, Employee } from '@/types';
import toast, { Toaster } from 'react-hot-toast';

export default function EmploymentViewPage({ params }: { params: { id: string } }) {
  const [employment, setEmployment] = useState<Employment | null>(null);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  
  const router = useRouter();
  const id = params.id;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const employmentData = await getEmployment(id);
        setEmployment(employmentData);
        
        // Fetch related employee
        const employeeData = await getEmployee(employmentData.employeeId);
        setEmployee(employeeData);
      } catch (error: any) {
        setError(error.message || 'Failed to fetch employment data');
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
      toast.loading('Deleting employment...', { id: 'delete-employment' });
      await deleteEmployment(id);
      toast.success('Employment deleted successfully', { id: 'delete-employment' });
      router.push('/employments');
    } catch (error: any) {
      setError(error.message || 'Failed to delete employment');
      toast.error('Failed to delete employment', { id: 'delete-employment' });
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-pulse flex space-x-4">
            <div className="rounded-full bg-gray-200 h-12 w-12"></div>
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
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
          <Link href="/employments" className="text-blue-600 hover:underline flex items-center gap-1">
            <FiArrowLeft size={16} /> Back to Employments
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  if (!employment) {
    return (
      <DashboardLayout>
        <div className="bg-yellow-50 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
          <p>Employment not found</p>
        </div>
        <div className="mt-4">
          <Link href="/employments" className="text-blue-600 hover:underline flex items-center gap-1">
            <FiArrowLeft size={16} /> Back to Employments
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Toaster position="top-center" />
      
      {/* Breadcrumb Navigation */}
      <div className="flex items-center text-sm text-gray-600 mb-4">
        <Link href="/dashboard" className="hover:text-blue-600">Dashboard</Link>
        <span className="mx-2">/</span>
        <Link href="/employments" className="hover:text-blue-600">Employments</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-800 font-medium">
          {employment.employmentId || id.substring(0, 8)}
        </span>
      </div>
      
      {/* Employee Info with Header and Actions */}
      {employee && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <Link
              href="/employments"
              className="px-3 py-1 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 flex items-center gap-1"
            >
              <FiArrowLeft size={14} /> Back
            </Link>
            
            <h1 className="text-xl font-bold text-gray-800 text-center flex-1">
              Employment Details
              <span className="ml-2 text-sm font-normal text-gray-500">
                #{employment.employmentId || id.substring(0, 8)}
              </span>
            </h1>
            
            <div className="flex items-center gap-2">
              <Link
                href={`/employments/${id}/edit`}
                className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-1"
              >
                <FiEdit size={14} /> Edit
              </Link>
              
              {!deleteConfirm ? (
                <button
                  onClick={handleDeleteClick}
                  className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center gap-1"
                >
                  <FiTrash2 size={14} /> Delete
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={confirmDelete}
                    className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={cancelDelete}
                    className="px-3 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold flex items-center text-black">
                <FiUser className="mr-2" /> Employee Information
              </h2>
              <Link
                href={`/employees/${employee.id}`}
                className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <FiUser size={16} /> View Employee Profile
              </Link>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900">{employee.name}</h3>
              <p className="text-sm text-gray-500">{employee.email} • {employee.phone}</p>
              <p className="text-sm text-gray-500">{employment.jobTitle || employee.position} • {employment.department || employee.department}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* If no employee, still show the header with actions */}
      {!employee && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <Link
              href="/employments"
              className="px-3 py-1 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 flex items-center gap-1"
            >
              <FiArrowLeft size={14} /> Back
            </Link>
            
            <h1 className="text-xl font-bold text-gray-800 text-center flex-1">
              Employment Details
              <span className="ml-2 text-sm font-normal text-gray-500">
                #{employment.employmentId || id.substring(0, 8)}
              </span>
            </h1>
            
            <div className="flex items-center gap-2">
              <Link
                href={`/employments/${id}/edit`}
                className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-1"
              >
                <FiEdit size={14} /> Edit
              </Link>
              
              {!deleteConfirm ? (
                <button
                  onClick={handleDeleteClick}
                  className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center gap-1"
                >
                  <FiTrash2 size={14} /> Delete
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={confirmDelete}
                    className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={cancelDelete}
                    className="px-3 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Employment Information Section */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <FiBriefcase className="mr-2" /> Employment Information
        </h2>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <p className="text-lg font-medium text-gray-900">{employment.employmentId || '-'}</p>
              <p className="text-sm text-gray-500">Employment ID</p>
            </div>
            
            <div>
              <p className="text-lg font-medium text-gray-900">
                {employment.joiningDate 
                  ? new Date(employment.joiningDate).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    }) 
                  : employment.startDate 
                    ? new Date(employment.startDate).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })
                    : '-'}
              </p>
              <p className="text-sm text-gray-500">Joining Date</p>
            </div>
            
            <div>
              <p className="text-lg font-medium text-gray-900">
                {employment.incrementDate 
                  ? new Date(employment.incrementDate).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })
                  : '-'}
              </p>
              <p className="text-sm text-gray-500">Increment Date</p>
            </div>
            
            <div>
              <p className="text-lg font-medium text-gray-900">
                {employment.ctc 
                  ? new Intl.NumberFormat('en-IN', {
                      style: 'currency',
                      currency: 'INR',
                      maximumFractionDigits: 0
                    }).format(employment.ctc).replace('₹', '').trim()
                  : employment.salary
                    ? new Intl.NumberFormat('en-IN', {
                        style: 'currency',
                        currency: 'INR',
                        maximumFractionDigits: 0
                      }).format(employment.salary).replace('₹', '').trim()
                    : '-'}
              </p>
              <p className="text-sm text-gray-500">CTC</p>
            </div>
            
            <div>
              <p className="text-lg font-medium text-gray-900">
                {employment.inHandCtc 
                  ? new Intl.NumberFormat('en-IN', {
                      style: 'currency',
                      currency: 'INR',
                      maximumFractionDigits: 0
                    }).format(employment.inHandCtc).replace('₹', '').trim()
                  : '-'}
              </p>
              <p className="text-sm text-gray-500">In-hand CTC</p>
            </div>
            
            <div>
              <p className="text-lg font-medium text-gray-900">
                {employment.relievingCtc 
                  ? new Intl.NumberFormat('en-IN', {
                      style: 'currency',
                      currency: 'INR',
                      maximumFractionDigits: 0
                    }).format(employment.relievingCtc).replace('₹', '').trim()
                  : '-'}
              </p>
              <p className="text-sm text-gray-500">Relieving CTC</p>
            </div>
            
            <div>
              <p className="text-lg font-medium text-gray-900">{employment.isIT === true ? 'Yes' : employment.isIT === false ? 'No' : '-'}</p>
              <p className="text-sm text-gray-500">IT</p>
            </div>
            
            <div>
              <p className="text-lg font-medium text-gray-900">{employment.isResignation ? 'Yes' : 'No'}</p>
              <p className="text-sm text-gray-500">Resignation</p>
            </div>
            
            <div>
              <p className="text-lg font-medium text-gray-900">
                {employment.contractType.split('-').map(word => 
                  word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ')}
              </p>
              <p className="text-sm text-gray-500">Contract Type</p>
            </div>
          </div>
        </div>
      </div>

      {/* Salary Information */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <FiDollarSign className="mr-2" /> Salary Information
        </h2>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <p className="text-lg font-medium text-gray-900">{employment.salaryId || '-'}</p>
              <p className="text-sm text-gray-500">Salary ID</p>
            </div>
            
            <div>
              <p className="text-lg font-medium text-gray-900">
                {employment.salary ? new Intl.NumberFormat('en-IN', {
                  style: 'currency',
                  currency: 'INR',
                  maximumFractionDigits: 0
                }).format(employment.salary).replace('₹', '').trim() : '-'} 
                {employment.salary ? '/' + (employment.paymentFrequency === 'monthly' ? 'yr' : employment.paymentFrequency) : ''}
              </p>
              <p className="text-sm text-gray-500">Salary per annum</p>
            </div>
            
            <div>
              <p className="text-lg font-medium text-gray-900">
                {employment.salaryPerMonth 
                  ? new Intl.NumberFormat('en-IN', {
                      style: 'currency',
                      currency: 'INR',
                      maximumFractionDigits: 0
                    }).format(employment.salaryPerMonth).replace('₹', '').trim()
                  : employment.salary 
                    ? new Intl.NumberFormat('en-IN', {
                        style: 'currency',
                        currency: 'INR',
                        maximumFractionDigits: 0
                      }).format(employment.salary / 12).replace('₹', '').trim()
                    : '-'} 
                {(employment.salaryPerMonth || employment.salary) ? '/mo' : ''}
              </p>
              <p className="text-sm text-gray-500">Salary per month</p>
            </div>
            
            <div>
              <p className="text-lg font-medium text-gray-900">
                {employment.basic 
                  ? new Intl.NumberFormat('en-IN', {
                      style: 'currency',
                      currency: 'INR',
                      maximumFractionDigits: 0
                    }).format(employment.basic).replace('₹', '').trim()
                  : '-'}
              </p>
              <p className="text-sm text-gray-500">Basic</p>
            </div>
            
            <div>
              <p className="text-lg font-medium text-gray-900">
                {employment.da 
                  ? new Intl.NumberFormat('en-IN', {
                      style: 'currency',
                      currency: 'INR',
                      maximumFractionDigits: 0
                    }).format(employment.da).replace('₹', '').trim()
                  : '-'}
              </p>
              <p className="text-sm text-gray-500">DA (Dearness Allowance)</p>
            </div>
            
            <div>
              <p className="text-lg font-medium text-gray-900">
                {employment.hra 
                  ? new Intl.NumberFormat('en-IN', {
                      style: 'currency',
                      currency: 'INR',
                      maximumFractionDigits: 0
                    }).format(employment.hra).replace('₹', '').trim()
                  : '-'}
              </p>
              <p className="text-sm text-gray-500">HRA (House Rent Allowance)</p>
            </div>
            
            <div>
              <p className="text-lg font-medium text-gray-900">
                {employment.pf 
                  ? new Intl.NumberFormat('en-IN', {
                      style: 'currency',
                      currency: 'INR',
                      maximumFractionDigits: 0
                    }).format(employment.pf).replace('₹', '').trim()
                  : '-'}
              </p>
              <p className="text-sm text-gray-500">PF (Provident Fund)</p>
            </div>
            
            <div>
              <p className="text-lg font-medium text-gray-900">
                {employment.medicalAllowance 
                  ? new Intl.NumberFormat('en-IN', {
                      style: 'currency',
                      currency: 'INR',
                      maximumFractionDigits: 0
                    }).format(employment.medicalAllowance).replace('₹', '').trim()
                  : '-'}
              </p>
              <p className="text-sm text-gray-500">Medical Allowance</p>
            </div>
            
            <div>
              <p className="text-lg font-medium text-gray-900">
                {employment.transport 
                  ? new Intl.NumberFormat('en-IN', {
                      style: 'currency',
                      currency: 'INR',
                      maximumFractionDigits: 0
                    }).format(employment.transport).replace('₹', '').trim()
                  : '-'}
              </p>
              <p className="text-sm text-gray-500">Transport</p>
            </div>
            
            <div>
              <p className="text-lg font-medium text-gray-900">
                {employment.gratuity 
                  ? new Intl.NumberFormat('en-IN', {
                      style: 'currency',
                      currency: 'INR',
                      maximumFractionDigits: 0
                    }).format(employment.gratuity).replace('₹', '').trim()
                  : '-'}
              </p>
              <p className="text-sm text-gray-500">Gratuity</p>
            </div>
            
            <div>
              <p className="text-lg font-medium text-gray-900">{employment.totalLeaves || '-'} {employment.totalLeaves ? 'days/year' : ''}</p>
              <p className="text-sm text-gray-500">Total Leaves</p>
            </div>
            
            <div>
              <p className="text-lg font-medium text-gray-900">{employment.salaryCreditDate || '-'}</p>
              <p className="text-sm text-gray-500">Salary Credit Date</p>
            </div>
            
            <div>
              <p className="text-lg font-medium text-gray-900">{employment.payableDays || '-'}</p>
              <p className="text-sm text-gray-500">Payable Days</p>
            </div>
            
            <div>
              <p className="text-lg font-medium text-gray-900 capitalize">{employment.paymentMode || '-'}</p>
              <p className="text-sm text-gray-500">Payment Mode</p>
            </div>
            
            <div>
              <p className="text-lg font-medium text-gray-900">
                {employment.additionalAllowance 
                  ? new Intl.NumberFormat('en-IN', {
                      style: 'currency',
                      currency: 'INR',
                      maximumFractionDigits: 0
                    }).format(employment.additionalAllowance).replace('₹', '').trim()
                  : '-'}
              </p>
              <p className="text-sm text-gray-500">Additional Allowance</p>
            </div>
            
            <div>
              <p className="text-lg font-medium text-gray-900">
                {employment.specialAllowance 
                  ? new Intl.NumberFormat('en-IN', {
                      style: 'currency',
                      currency: 'INR',
                      maximumFractionDigits: 0
                    }).format(employment.specialAllowance).replace('₹', '').trim()
                  : '-'}
              </p>
              <p className="text-sm text-gray-500">Special Allowance</p>
            </div>
            
            <div>
              <p className="text-lg font-medium text-gray-900 capitalize">
                {employment.paymentFrequency ? (
                  employment.paymentFrequency.includes('-') ?
                    employment.paymentFrequency.split('-').map(word => 
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ') :
                    employment.paymentFrequency.charAt(0).toUpperCase() + employment.paymentFrequency.slice(1)
                ) : '-'}
              </p>
              <p className="text-sm text-gray-500">Payment Frequency</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Job Details */}
    
    </DashboardLayout>
  );
} 