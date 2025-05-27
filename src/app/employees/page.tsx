'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FiEdit, FiTrash2, FiPlus, FiSearch, FiEye, FiBriefcase, FiArrowLeft, FiX, FiCheck } from 'react-icons/fi';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { getEmployees, deleteEmployee, getEmploymentsByEmployee, getSalaryHistoryByEmployment } from '@/utils/firebaseUtils';
import { Employee, Employment } from '@/types';
import toast, { Toaster } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { SkeletonBreadcrumb, SkeletonHeader, SkeletonTable } from '@/components/ui/SkeletonLoader';

interface EmployeeWithEmploymentDetails extends Employee {
  employmentDetails?: {
    joiningDate: string | null;
    currentPackage: number | null;
    totalSalaries: number;
    hasEmployment: boolean;
  };
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<EmployeeWithEmploymentDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [showEmploymentAdd, setShowEmploymentAdd] = useState<string | null>(null);
  const [loadingEmployment, setLoadingEmployment] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const data = await getEmployees();
      
      // Fetch employment details for each employee
      const employeesWithDetails = await Promise.all(
        data.map(async (employee) => {
          try {
            // Get all employments for this employee
            const employments = await getEmploymentsByEmployee(employee.id);
            
            if (employments && employments.length > 0) {
              // Sort employments by joining date (most recent first)
              employments.sort((a, b) => {
                const dateA = a.joiningDate || a.startDate || '';
                const dateB = b.joiningDate || b.startDate || '';
                if (!dateA || !dateB) return 0;
                return new Date(dateB).getTime() - new Date(dateA).getTime();
              });
              
              // Get the most recent employment
              const latestEmployment = employments[0];
              
              // Get salary history for the most recent employment
              const salaryHistory = await getSalaryHistoryByEmployment(latestEmployment.id || '');
              
              // Count total salary records (including the current employment record)
              const totalSalaries = salaryHistory ? salaryHistory.length + 1 : 1;
              
              const employeeWithDetails: EmployeeWithEmploymentDetails = {
                ...employee,
                employmentDetails: {
                  joiningDate: latestEmployment.joiningDate || latestEmployment.startDate || null,
                  currentPackage: latestEmployment.ctc || latestEmployment.salary || null,
                  totalSalaries: totalSalaries,
                  hasEmployment: true
                }
              };
              
              return employeeWithDetails;
            }
            
            const employeeWithoutEmployment: EmployeeWithEmploymentDetails = {
              ...employee,
              employmentDetails: {
                joiningDate: null,
                currentPackage: null,
                totalSalaries: 0,
                hasEmployment: false
              }
            };
            
            return employeeWithoutEmployment;
          } catch (error) {
            console.error(`Error fetching employments for employee ${employee.id}:`, error);
            const fallbackEmployee: EmployeeWithEmploymentDetails = {
              ...employee,
              employmentDetails: {
                joiningDate: null,
                currentPackage: null,
                totalSalaries: 0,
                hasEmployment: false
              }
            };
            return fallbackEmployee;
          }
        })
      );
      
      setEmployees(employeesWithDetails);
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeleteConfirm(id);
  };

  const confirmDelete = async (id: string) => {
    try {
      toast.loading('Deleting employee...', { id: 'delete-employee' });
      await deleteEmployee(id);
      setEmployees(employees.filter(emp => emp.id !== id));
      setDeleteConfirm(null);
      toast.success('Employee deleted successfully', { id: 'delete-employee' });
    } catch (error) {
      console.error('Error deleting employee:', error);
      toast.error('Failed to delete employee', { id: 'delete-employee' });
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  const handleEmploymentClick = async (employeeId: string) => {
    try {
      setLoadingEmployment(employeeId);
      const employments = await getEmploymentsByEmployee(employeeId);
      
      if (employments && employments.length > 0) {
        // Navigate to the first (most recent) employment
        router.push(`/employments/${employments[0].id}`);
      } else {
        // Show the Add Employment button
        setShowEmploymentAdd(employeeId);
      }
    } catch (error) {
      console.error('Error fetching employee employments:', error);
      toast.error('Failed to fetch employment details');
    } finally {
      setLoadingEmployment(null);
    }
  };

  const cancelEmploymentAdd = () => {
    setShowEmploymentAdd(null);
  };

  const formatCurrency = (amount: number) => {
    if (!amount) return '-';
    
    // Convert to lakhs (divide by 100,000)
    const inLakhs = amount / 100000;
    
    if (inLakhs >= 1) {
      // For amounts >= 1 lakh, show in lakhs with 1 decimal place
      return `${inLakhs.toFixed(1)} LPA`;
    } else {
      // For amounts < 1 lakh, show in thousands
      const inThousands = amount / 1000;
      return `${inThousands.toFixed(0)}K PA`;
    }
  };

  const filteredEmployees = employees.filter(employee => 
    employee.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.phone?.includes(searchTerm)
  );

  if (loading) {
    return (
      <DashboardLayout>
        <SkeletonBreadcrumb levels={2} />
        
        <div className="flex justify-between items-center mb-6">
          <div className="h-8 w-24 bg-gray-200 rounded"></div>
          <h1 className="text-2xl font-bold text-gray-800 mx-auto">Employees</h1>
          <div className="w-20"></div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 border-b flex justify-between items-center">
            <div className="h-5 bg-gray-200 rounded w-32"></div>
            <div className="flex items-center gap-4">
              <div className="h-10 bg-gray-200 rounded w-64"></div>
              <div className="h-10 bg-gray-200 rounded w-36"></div>
            </div>
          </div>
          
          <SkeletonTable rows={5} columns={7} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Toaster position="top-center" />
      <div className="flex items-center text-sm text-gray-600 mb-4">
        <Link href="/dashboard" className="hover:text-blue-600">Dashboard</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-800 font-medium">Employees</span>
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <Link
          href="/dashboard"
          className="flex items-center gap-1 text-gray-600 hover:text-blue-600 border border-gray-300 px-3 py-1 rounded-md"
        >
          <FiArrowLeft /> Back
        </Link>
        <h1 className="text-2xl font-bold text-gray-800 mx-auto">Employees</h1>
        <div className="w-20"></div> {/* This creates balance in the flex layout */}
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Total: <span className="font-medium">{filteredEmployees.length}</span> employees
          </div>
          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search employees..."
                className="pl-10 pr-4 py-2 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Search employees"
              />
            </div>
            <Link
              href="/employees/add"
              className="bg-green-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-green-700"
            >
              <FiPlus /> Add Employee
            </Link>
          </div>
        </div>

        {filteredEmployees.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {searchTerm ? 'No employees match your search' : 'No employees found. Add your first employee!'}
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-thin">
            <style jsx>{`
              .scrollbar-thin::-webkit-scrollbar {
                height: 6px;
                width: 6px;
              }
              .scrollbar-thin::-webkit-scrollbar-track {
                background: #f1f1f1;
                border-radius: 3px;
              }
              .scrollbar-thin::-webkit-scrollbar-thumb {
                background: #ccc;
                border-radius: 3px;
              }
              .scrollbar-thin::-webkit-scrollbar-thumb:hover {
                background: #aaa;
              }
            `}</style>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Name
                  </th>
                 
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Status
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Mobile
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Date of Joining
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Current Package
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Total Salaries
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEmployees.map((employee) => (
                  <tr key={employee.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                    </td>
                  
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {employee.status && (
                        <span
                          className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            employee.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {employee.status.charAt(0).toUpperCase() + employee.status.slice(1)}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="text-sm text-gray-900">{employee.phone || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="text-sm text-gray-900">
                        {employee.employmentDetails?.joiningDate ? 
                          (() => {
                            try {
                              return new Date(employee.employmentDetails.joiningDate).toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                              });
                            } catch (e) {
                              return '-';
                            }
                          })() : 
                          employee.joinDate ? 
                          (() => {
                            try {
                              return new Date(employee.joinDate).toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                              });
                            } catch (e) {
                              return '-';
                            }
                          })() : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="text-sm text-gray-900">
                        {employee.employmentDetails?.currentPackage ? 
                          formatCurrency(employee.employmentDetails.currentPackage) : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="text-sm text-gray-900">
                        {employee.employmentDetails?.totalSalaries || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {deleteConfirm === employee.id ? (
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={cancelDelete}
                            className="border border-gray-500 bg-gray-100 text-gray-600 hover:bg-gray-200 px-2 py-1 rounded-md text-xs flex items-center gap-1"
                          >
                            <FiX size={12} /> Cancel
                          </button>
                          <button
                            onClick={() => confirmDelete(employee.id)}
                            className="border border-red-500 bg-red-100 text-red-600 hover:bg-red-200 px-2 py-1 rounded-md text-xs flex items-center gap-1"
                          >
                            <FiCheck size={12} /> Confirm
                          </button>
                        </div>
                      ) : showEmploymentAdd === employee.id ? (
                        <div className="flex items-center justify-center space-x-2">
                          <Link
                            href={`/employments/add?employeeId=${employee.id}`}
                            className="border border-blue-500 bg-blue-50 text-blue-600 hover:bg-blue-100 px-2 py-1 rounded-md text-xs flex items-center gap-1"
                          >
                            <FiPlus size={12} /> Add Employment
                          </Link>
                          <button
                            onClick={cancelEmploymentAdd}
                            className="border border-gray-500 bg-gray-100 text-gray-600 hover:bg-gray-200 px-2 py-1 rounded-md text-xs flex items-center gap-1"
                          >
                            <FiX size={12} /> Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            href={`/employees/${employee.id}`}
                            className="border border-blue-500 text-blue-600 hover:bg-blue-50 p-2 rounded text-xs flex items-center"
                            title="View Employee Details"
                          >
                            <FiEye className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleEmploymentClick(employee.id)}
                            className="border border-green-500 text-green-600 hover:bg-green-50 p-2 rounded text-xs flex items-center"
                            title="View Employee Employment Details"
                            disabled={loadingEmployment === employee.id}
                          >
                            {loadingEmployment === employee.id ? (
                              <span className="w-4 h-4 border-2 border-t-transparent border-green-600 rounded-full animate-spin"></span>
                            ) : (
                              <FiBriefcase className="w-4 h-4" />
                            )}
                          </button>
                          <Link
                            href={`/employees/${employee.id}/edit`}
                            className="border border-amber-500 text-amber-600 hover:bg-amber-50 p-2 rounded text-xs flex items-center"
                            title="Edit Employee"
                          >
                            <FiEdit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDeleteClick(employee.id)}
                            className="border border-red-500 text-red-600 hover:bg-red-50 p-2 rounded text-xs flex items-center"
                            title="Delete Employee"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
} 