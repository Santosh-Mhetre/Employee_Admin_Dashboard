'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FiEdit, FiTrash2, FiPlus, FiSearch, FiEye } from 'react-icons/fi';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { getEmployments, deleteEmployment, getEmployee } from '@/utils/firebaseUtils';
import { Employment, Employee } from '@/types';
import toast, { Toaster } from 'react-hot-toast';

// Calculate duration between two dates
const calculateDuration = (startDate: string, endDate?: string): string => {
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date();
  
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

export default function EmploymentsPage() {
  const [employments, setEmployments] = useState<Employment[]>([]);
  const [employeeNames, setEmployeeNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchEmployments();
  }, []);

  const fetchEmployments = async () => {
    try {
      setLoading(true);
      const data = await getEmployments();
      setEmployments(data);
      
      // Fetch employee names for each employment
      const namesMap: Record<string, string> = {};
      for (const employment of data) {
        try {
          const employee = await getEmployee(employment.employeeId);
          namesMap[employment.employeeId] = employee.name;
        } catch (error) {
          namesMap[employment.employeeId] = 'Unknown Employee';
        }
      }
      setEmployeeNames(namesMap);
    } catch (error) {
      console.error('Error fetching employments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeleteConfirm(id);
  };

  const confirmDelete = async (id: string) => {
    try {
      toast.loading('Deleting employment...', { id: 'delete-employment' });
      await deleteEmployment(id);
      setEmployments(employments.filter(emp => emp.id !== id));
      setDeleteConfirm(null);
      toast.success('Employment deleted successfully', { id: 'delete-employment' });
    } catch (error) {
      console.error('Error deleting employment:', error);
      toast.error('Failed to delete employment', { id: 'delete-employment' });
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const filteredEmployments = employments.filter(employment => {
    const employeeName = employeeNames[employment.employeeId] || '';
    return employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           employment.contractType.toLowerCase().includes(searchTerm.toLowerCase()) ||
           (employment.jobTitle && employment.jobTitle.toLowerCase().includes(searchTerm.toLowerCase())) ||
           (employment.department && employment.department.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Employments</h1>
          <div className="bg-gray-200 h-10 w-32 rounded animate-pulse"></div>
        </div>
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 border-b">
            <div className="bg-gray-200 h-10 w-full rounded animate-pulse"></div>
          </div>
          <div className="p-8">
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </div>
              ))}
            </div>
          </div>
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
        <span className="text-gray-800 font-medium">Employments</span>
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Employments</h1>
        <Link
          href="/employments/add"
          className="bg-green-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-green-700"
        >
          <FiPlus /> Add Employment
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center">
          <div className="text-gray-700 font-medium">
        Total:     {filteredEmployments.length}  {filteredEmployments.length === 1 ? 'Employment' : 'Employments'}  
          </div>
          <div className="relative w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search employments..."
              className="pl-10 pr-4 py-2 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search employments"
            />
          </div>
        </div>

        {filteredEmployments.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {searchTerm ? 'No employments match your search' : 'No employments found. Add your first employment!'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contract Type
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Salary
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEmployments.map((employment) => (
                  <tr key={employment.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="text-sm font-medium text-gray-900">
                        {employeeNames[employment.employeeId] || 'Unknown Employee'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="text-xs leading-5 font-semibold text-black">
                        {employment.contractType && employment.contractType.includes('-') ?
                          employment.contractType.split('-').map(word => 
                            word.charAt(0).toUpperCase() + word.slice(1)
                          ).join(' ') : 
                          employment.contractType ? 
                            employment.contractType.charAt(0).toUpperCase() + employment.contractType.slice(1) : 
                            'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="text-sm text-gray-900">
                        {new Date(employment.startDate).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                        {employment.endDate && (
                          <> - {new Date(employment.endDate).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}</>
                        )}
                        <div className="text-xs text-gray-500 mt-1">
                          {calculateDuration(employment.startDate, employment.endDate)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="text-sm text-gray-900">
                        {new Intl.NumberFormat('en-IN', {
                          style: 'currency',
                          currency: 'INR',
                          maximumFractionDigits: 0
                        }).format(employment.salary).replace('₹', '').trim()}
                        /{employment.paymentFrequency === 'monthly' ? 'mo' : 
                          employment.paymentFrequency === 'weekly' ? 'wk' : 
                          employment.paymentFrequency === 'bi-weekly' ? 'bw' : 
                          employment.paymentFrequency}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {deleteConfirm === employment.id ? (
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => confirmDelete(employment.id)}
                            className="bg-red-100 text-red-600 hover:bg-red-200 px-2 py-1 rounded-md text-xs"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={cancelDelete}
                            className="bg-gray-100 text-gray-600 hover:bg-gray-200 px-2 py-1 rounded-md text-xs"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            href={`/employments/${employment.id}`}
                            className="border border-blue-500 text-blue-600 hover:bg-blue-50 p-2 rounded text-xs flex items-center"
                            title="View Employment Details"
                          >
                            <FiEye className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/employments/${employment.id}/edit`}
                            className="border border-amber-500 text-amber-600 hover:bg-amber-50 p-2 rounded text-xs flex items-center"
                            title="Edit Employment"
                          >
                            <FiEdit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDeleteClick(employment.id)}
                            className="border border-red-500 text-red-600 hover:bg-red-50 p-2 rounded text-xs flex items-center"
                            title="Delete Employment"
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