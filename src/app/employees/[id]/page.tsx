'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft, FiEdit, FiTrash2, FiBriefcase, FiUser, FiPhone, FiMail, FiMapPin, FiCalendar, FiCreditCard, FiBook, FiEye } from 'react-icons/fi';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { getEmployee, deleteEmployee, getEmploymentsByEmployee } from '@/utils/firebaseUtils';
import { Employee, Employment } from '@/types';

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
        
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-lg font-bold text-gray-800">{employee.name}</h2>
            <div className="flex items-center text-gray-600 mt-1">
              <span className="inline-flex items-center mr-3">
                <FiUser className="mr-1" size={14} />
                {employee.employeeId || 'No ID'}
              </span>
              {employee.position && (
                <span className="inline-flex items-center mr-3">
                  <FiBriefcase className="mr-1" size={14} />
                  {employee.position}
                </span>
              )}
              {employee.department && (
                <span className="inline-flex items-center">
                  {employee.department}
                </span>
              )}
            </div>
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
              <p className="text-lg font-medium text-gray-900">{employee.employeeId || '-'}</p>
              <p className="text-sm text-gray-500">Employee ID</p>
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
              <p className="text-sm text-gray-500">Aadhar Card</p>
            </div>
            
            <div>
              <p className="text-lg font-medium text-gray-900">{employee.panCard || '-'}</p>
              <p className="text-sm text-gray-500">PAN Card</p>
            </div>
            
            <div>
              <p className="text-lg font-medium text-gray-900">{employee.drivingLicense || '-'}</p>
              <p className="text-sm text-gray-500">Driving License</p>
            </div>
            
            <div>
              <p className="text-lg font-medium text-gray-900">{employee.voterID || '-'}</p>
              <p className="text-sm text-gray-500">Voter ID</p>
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
                <p className="text-lg font-medium text-gray-900">{employee.graduation.collegeName || '-'}</p>
                <p className="text-sm text-gray-500">College Name</p>
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
                <p className="text-sm text-gray-500">School</p>
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
        <h3 className="text-md font-medium text-gray-700 mt-6 mb-4">Other Education</h3>
        {employee.otherEducation ? (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <p className="text-lg font-medium text-gray-900">{employee.otherEducation.diploma || '-'}</p>
                <p className="text-sm text-gray-500">Diploma</p>
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
                <p className="text-lg font-medium text-gray-900">{employee.otherEducation.collegeName || '-'}</p>
                <p className="text-sm text-gray-500">College Name</p>
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
      <div id="employments" className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold flex items-center text-gray-900">
            <FiCalendar className="mr-2" /> Employment
          </h2>
          <Link
            href={`/employments/add?employeeId=${id}`}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-gren-700 flex items-center gap-2"
          >
            <FiBriefcase size={16} /> Add Employment
          </Link>
        </div>
        
        {employments.length === 0 ? (
          <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
            <FiBriefcase className="w-12 h-12 mx-auto text-gray-400 mb-3" />
            <p>No employment records found for this employee.</p>
            <p className="text-sm mt-2">Click "Add Employment" to create a new employment record.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
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
                    Total Salaries Credited
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {employments.map((employment) => (
                  <tr key={employment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="text-xs leading-5 font-semibold text-black">
                        {employment.contractType}
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
                        {employment.endDate && (
                          <div className="text-xs text-gray-500 mt-1">
                            ({calculateDuration(employment.startDate, employment.endDate)})
                          </div>
                        )}
                        {!employment.endDate && (
                          <div className="text-xs text-gray-500 mt-1">
                            ({calculateDuration(employment.startDate, new Date().toISOString())})
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="text-sm text-gray-900 font-medium">
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
                      <div className="text-sm text-gray-900">
                        12 {/* Placeholder count */}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center space-x-3">
                        <Link
                          href={`/employments/${employment.id}`}
                          className="border border-blue-500 text-blue-600 hover:bg-blue-50 p-2 rounded text-xs flex items-center justify-center"
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
                      </div>
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