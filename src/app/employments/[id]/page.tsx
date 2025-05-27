'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft, FiEdit, FiTrash2, FiUser, FiBriefcase, FiCalendar, FiDollarSign, FiMapPin, FiPlus, FiCheck, FiX } from 'react-icons/fi';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { getEmployment, deleteEmployment, getEmployee, updateEmployment, addSalaryHistory, getSalaryHistoryByEmployment } from '@/utils/firebaseUtils';
import { Employment, Employee } from '@/types';
import toast, { Toaster } from 'react-hot-toast';
import SalaryModal from '@/components/employment/SalaryModal';
import { SkeletonBreadcrumb, SkeletonHeader, SkeletonCard, SkeletonTable } from '@/components/ui/SkeletonLoader';

export default function EmploymentViewPage({ params }: { params: { id: string } }) {
  const [employment, setEmployment] = useState<Employment | null>(null);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [salaryHistory, setSalaryHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [isSalaryModalOpen, setIsSalaryModalOpen] = useState(false);
  
  const router = useRouter();
  const [id, setId] = useState<string>('');
  
  useEffect(() => {
    if (params && params.id) {
      setId(params.id);
    }
  }, [params]);

  useEffect(() => {
    if (!id) return;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        const employmentData = await getEmployment(id);
        setEmployment(employmentData);
        
        // Fetch related employee
        const employeeData = await getEmployee(employmentData.employeeId);
        setEmployee(employeeData);
        
        // Fetch salary history
        const salaryHistoryData = await getSalaryHistoryByEmployment(id);
        setSalaryHistory(salaryHistoryData);
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
      
      // Navigate to the employee details page if we have employee info, otherwise to employees list
      if (employee) {
        router.push(`/employees/${employee.id}`);
      } else {
        router.push('/employees');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to delete employment');
      toast.error('Failed to delete employment', { id: 'delete-employment' });
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm(false);
  };

  const handleSaveSalary = async (salaryData: Partial<Employment>) => {
    try {
      if (!employment) return;
      
      toast.loading('Adding new salary record...', { id: 'add-salary' });
      
      // Create a new salary record with the employment ID
      const newSalaryData = {
        ...salaryData,
        employmentId: id,
        employeeId: employment.employeeId,
        createdAt: new Date().toISOString()
      };
      
      // Add new salary history record
      const result = await addSalaryHistory(newSalaryData);
      
      // Add the new record to the salary history array
      setSalaryHistory(prevHistory => [...prevHistory, result]);
      
      toast.success('Salary record added successfully', { id: 'add-salary' });
    } catch (error: any) {
      toast.error(error.message || 'Failed to add salary record', { id: 'add-salary' });
      throw error; // Re-throw to be caught by the modal
    }
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
        <SkeletonBreadcrumb levels={4} />
        <SkeletonHeader />
        
        {/* Employee Information Card */}
        <SkeletonCard rows={1} columns={3} />
        
        {/* Employment Information Section */}
        <SkeletonCard rows={2} columns={4} />
        
        {/* Salary History Table */}
        <SkeletonTable rows={3} columns={10} />
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

  if (!employment) {
    return (
      <DashboardLayout>
        <div className="bg-yellow-50 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
          <p>Employment not found</p>
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
      <Toaster position="top-center" />
      
      {/* Salary Modal */}
      <SalaryModal 
        isOpen={isSalaryModalOpen}
        onClose={() => setIsSalaryModalOpen(false)}
        onSave={handleSaveSalary}
        employmentId={id}
        currentSalary={employment}
      />
      
      {/* Breadcrumb Navigation */}
      <div className="flex items-center text-sm text-gray-600 mb-4">
        <Link href="/dashboard" className="hover:text-blue-600">Dashboard</Link>
        <span className="mx-2">/</span>
        <Link href="/employees" className="hover:text-blue-600">Employees</Link>
        <span className="mx-2">/</span>
        {employee && (
          <>
            <Link href={`/employees/${employee.id}`} className="hover:text-blue-600">{employee.name}</Link>
            <span className="mx-2">/</span>
          </>
        )}
        <span className="text-gray-800 font-medium">
          Employment
        </span>
      </div>
      
      {/* Header with Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex justify-between items-center">
          <Link
            href={employee ? `/employees/${employee.id}` : '/employees'}
            className="px-3 py-1 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 flex items-center gap-1"
          >
            <FiArrowLeft size={14} /> Back
          </Link>
          
          <h1 className="text-xl font-bold text-gray-800 text-center flex-1">
            Employment Details
            
          </h1>
          
          <div className="flex items-center gap-2">
            <Link
              href={`/employments/${id}/edit`}
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
      
      {/* Employee Information Card */}
      {employee && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <FiUser className="mr-2" /> Employee Information
          </h2>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <p className="text-lg font-medium text-gray-900">{employee.name}</p>
                <p className="text-sm text-gray-500">Name</p>
              </div>
              
              <div>
                <p className="text-lg font-medium text-gray-900">{employee.email}</p>
                <p className="text-sm text-gray-500">Email</p>
              </div>
              
              <div>
                <p className="text-lg font-medium text-gray-900">{employee.phone}</p>
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
              
              {employee.status && (
                <div>
                  <div className="mb-1">
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                      employee.status.toLowerCase() === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {employee.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">Status</p>
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
                    }).format(employment.ctc)
                  : employment.salary
                    ? new Intl.NumberFormat('en-IN', {
                        style: 'currency',
                        currency: 'INR',
                        maximumFractionDigits: 0
                      }).format(employment.salary)
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
                    }).format(employment.inHandCtc)
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
                    }).format(employment.relievingCtc)
                  : '-'}
              </p>
              <p className="text-sm text-gray-500">Relieving CTC</p>
            </div>
            
            <div>
              <p className="text-lg font-medium text-gray-900">{employment.isPF === true ? 'Yes' : employment.isPF === false ? 'No' : '-'}</p>
              <p className="text-sm text-gray-500">PF</p>
            </div>
            
            <div>
              <p className="text-lg font-medium text-gray-900">{employment.designation || '-'}</p>
              <p className="text-sm text-gray-500">Designation</p>
            </div>
            
           
            <div>
              <p className="text-lg font-medium text-gray-900">
                {employment.jobMode ? employment.jobMode.charAt(0).toUpperCase() + employment.jobMode.slice(1) : '-'}
              </p>
              <p className="text-sm text-gray-500">Job Mode</p>
            </div>
          </div>
        </div>
      </div>

      {/* Salary Information */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center justify-between">
          <div className="flex items-center">
            <span className="mr-2">₹</span> Salary Information
          </div>
          <button 
            className="px-3 py-1 bg-green-600 text-white rounded-md flex items-center gap-1 hover:bg-green-700 text-sm"
            onClick={() => setIsSalaryModalOpen(true)}
          >
            <FiPlus size={14} /> Add Salary
          </button>
        </h2>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sr No
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Credit Month
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Basic
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    DA
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    HRA
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    PF
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Medical
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transport
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gratuity
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Leaves
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payable Days
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Credited Amount
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {/* Show current employment data as the first row */}
                <tr>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                    1
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                    {employment.salaryCreditDate 
                      ? new Date(employment.salaryCreditDate).toLocaleDateString('en-GB', {
                          month: 'short',
                          year: 'numeric'
                        })
                      : '-'}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                    {employment.basic ? new Intl.NumberFormat('en-IN', {
                      style: 'currency',
                      currency: 'INR',
                      maximumFractionDigits: 0
                    }).format(employment.basic) : '-'}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                    {employment.da ? new Intl.NumberFormat('en-IN', {
                      style: 'currency',
                      currency: 'INR',
                      maximumFractionDigits: 0
                    }).format(employment.da) : '-'}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                    {employment.hra ? new Intl.NumberFormat('en-IN', {
                      style: 'currency',
                      currency: 'INR',
                      maximumFractionDigits: 0
                    }).format(employment.hra) : '-'}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                    {employment.pf ? new Intl.NumberFormat('en-IN', {
                      style: 'currency',
                      currency: 'INR',
                      maximumFractionDigits: 0
                    }).format(employment.pf) : '-'}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                    {employment.medicalAllowance ? new Intl.NumberFormat('en-IN', {
                      style: 'currency',
                      currency: 'INR',
                      maximumFractionDigits: 0
                    }).format(employment.medicalAllowance) : '-'}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                    {employment.transport ? new Intl.NumberFormat('en-IN', {
                      style: 'currency',
                      currency: 'INR',
                      maximumFractionDigits: 0
                    }).format(employment.transport) : '-'}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                    {employment.gratuity ? new Intl.NumberFormat('en-IN', {
                      style: 'currency',
                      currency: 'INR',
                      maximumFractionDigits: 0
                    }).format(employment.gratuity) : '-'}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                    {employment.totalLeaves !== undefined ? `${employment.totalLeaves} days` : '-'}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                    {employment.payableDays !== undefined ? employment.payableDays : '-'}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                    {employment.salaryCreditedAmount ? new Intl.NumberFormat('en-IN', {
                      style: 'currency',
                      currency: 'INR',
                      maximumFractionDigits: 0
                    }).format(employment.salaryCreditedAmount) : '-'}
                  </td>
                </tr>
                
                {/* Show salary history records */}
                {salaryHistory.map((record, index) => (
                  <tr key={record.id || index}>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                      {index + 2}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                      {record.salaryCreditDate 
                        ? new Date(record.salaryCreditDate).toLocaleDateString('en-GB', {
                            month: 'short',
                            year: 'numeric'
                          })
                        : '-'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                      {record.basic ? new Intl.NumberFormat('en-IN', {
                        style: 'currency',
                        currency: 'INR',
                        maximumFractionDigits: 0
                      }).format(record.basic) : '-'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                      {record.da ? new Intl.NumberFormat('en-IN', {
                        style: 'currency',
                        currency: 'INR',
                        maximumFractionDigits: 0
                      }).format(record.da) : '-'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                      {record.hra ? new Intl.NumberFormat('en-IN', {
                        style: 'currency',
                        currency: 'INR',
                        maximumFractionDigits: 0
                      }).format(record.hra) : '-'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                      {record.pf ? new Intl.NumberFormat('en-IN', {
                        style: 'currency',
                        currency: 'INR',
                        maximumFractionDigits: 0
                      }).format(record.pf) : '-'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                      {record.medicalAllowance ? new Intl.NumberFormat('en-IN', {
                        style: 'currency',
                        currency: 'INR',
                        maximumFractionDigits: 0
                      }).format(record.medicalAllowance) : '-'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                      {record.transport ? new Intl.NumberFormat('en-IN', {
                        style: 'currency',
                        currency: 'INR',
                        maximumFractionDigits: 0
                      }).format(record.transport) : '-'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                      {record.gratuity ? new Intl.NumberFormat('en-IN', {
                        style: 'currency',
                        currency: 'INR',
                        maximumFractionDigits: 0
                      }).format(record.gratuity) : '-'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                      {record.totalLeaves !== undefined ? `${record.totalLeaves} days` : '-'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                      {record.payableDays !== undefined ? record.payableDays : '-'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                      {record.salaryCreditedAmount ? new Intl.NumberFormat('en-IN', {
                        style: 'currency',
                        currency: 'INR',
                        maximumFractionDigits: 0
                      }).format(record.salaryCreditedAmount) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
    </DashboardLayout>
  );
} 