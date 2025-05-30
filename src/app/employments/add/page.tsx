'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { addEmployment, getEmployees } from '@/utils/firebaseUtils';
import { Employment, Employee } from '@/types';
import { FiSave, FiX } from 'react-icons/fi';
import toast, { Toaster } from 'react-hot-toast';

interface EmploymentFormData extends Omit<Employment, 'id'> {
  // Add all the fields we need
  employmentId: string;
  joiningDate: string;
  incrementDate: string;
  ctc: number;
  inHandCtc: number;
  relievingCtc?: number;
  isIT: boolean;
  isResignation: boolean;
  
  // Salary details
  salaryId: string;
  salaryPerMonth: number;
  basic: number;
  da: number;
  hra: number;
  pf: number;
  medicalAllowance: number;
  transport: number;
  gratuity: number;
  totalLeaves: number;
  salaryCreditDate: string;
  payableDays: number;
  paymentMode: string;
  additionalAllowance: number;
  specialAllowance: number;
  
  // Job details
  jobTitle: string;
  department: string;
  location: string;
  reportingManager: string;
  employmentType: string;
  workSchedule: string;
}

export default function AddEmploymentPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  
  const router = useRouter();
  
  const { register, handleSubmit, watch, formState: { errors } } = useForm<EmploymentFormData>({
    defaultValues: {
      employmentType: 'full-time',
      paymentFrequency: 'monthly',
      paymentMode: 'bank-transfer',
      isIT: true,
      isResignation: false,
      payableDays: 30,
      totalLeaves: 24,
      salaryCreditDate: '1st of every month',
    }
  });

  // Watch salary for calculations
  const salary = watch('salary');

  // Calculate salary per month when annual salary changes
  useEffect(() => {
    if (salary) {
      const monthlyValue = Math.round(Number(salary) / 12);
      // We're not setting this automatically as the form might have other calculations
    }
  }, [salary]);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const data = await getEmployees();
        setEmployees(data);
      } catch (error) {
        console.error('Error fetching employees:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  const onSubmit = async (data: EmploymentFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);
      toast.loading('Creating employment record...', { id: 'add-employment' });
      
      // Convert string values to numbers and handle undefined values
      const formattedData = {
        ...data,
        salary: Number(data.salary),
        ctc: Number(data.ctc),
        inHandCtc: Number(data.inHandCtc),
        relievingCtc: data.relievingCtc ? Number(data.relievingCtc) : undefined,
        basic: Number(data.basic),
        da: Number(data.da),
        hra: Number(data.hra),
        pf: Number(data.pf),
        medicalAllowance: Number(data.medicalAllowance),
        transport: Number(data.transport),
        gratuity: Number(data.gratuity),
        totalLeaves: Number(data.totalLeaves),
        payableDays: Number(data.payableDays),
        additionalAllowance: Number(data.additionalAllowance),
        specialAllowance: Number(data.specialAllowance),
      };
      
      await addEmployment(formattedData);
      toast.success('Employment record created successfully!', { id: 'add-employment' });
      router.push('/employments');
    } catch (error: any) {
      setError(error.message || 'Failed to add employment');
      toast.error(error.message || 'Failed to add employment', { id: 'add-employment' });
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Toaster position="top-center" />
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Add New Employment</h1>
          <div className="bg-gray-200 h-10 w-10 rounded animate-pulse"></div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-gray-200 rounded w-1/2"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
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
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Add New Employment</h1>
        <button
          onClick={() => router.back()}
          className="text-gray-600 hover:text-gray-800"
        >
          <FiX size={24} />
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
          <p>{error}</p>
        </div>
      )}

      {employees.length === 0 ? (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
          <p>No employees found. Please add employees first.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Employee Selection */}
            <div className="mb-6">
              <div className="w-full md:w-1/2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employee*
                </label>
                <select
                  {...register('employeeId', { required: 'Employee is required' })}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                >
                  <option value="">Select Employee</option>
                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.name} {employee.employeeId ? `- ${employee.employeeId}` : ''}
                    </option>
                  ))}
                </select>
                {errors.employeeId && (
                  <p className="mt-1 text-sm text-red-600">{errors.employeeId.message}</p>
                )}
              </div>
            </div>

            {/* Employment Information Section */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h2 className="text-lg font-medium text-gray-800 mb-4 border-l-4 border-blue-500 pl-2">Employment Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Employment ID*
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. EMP-001"
                    {...register('employmentId', { 
                      required: 'Employment ID is required',
                      pattern: { 
                        value: /^[A-Z0-9-]{3,10}$/i, 
                        message: 'Please enter a valid ID format' 
                      }
                    })}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                  />
                  {errors.employmentId && (
                    <p className="mt-1 text-sm text-red-600">{errors.employmentId.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Joining Date*
                  </label>
                  <input
                    type="date"
                    {...register('joiningDate', { required: 'Joining date is required' })}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                  />
                  {errors.joiningDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.joiningDate.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Increment Date
                  </label>
                  <input
                    type="date"
                    {...register('incrementDate')}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CTC (₹)*
                  </label>
                  <input
                    type="number"
                    placeholder="Annual CTC amount"
                    {...register('ctc', { 
                      required: 'CTC is required',
                      min: { value: 0, message: 'CTC must be positive' },
                      valueAsNumber: true
                    })}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                  />
                  {errors.ctc && (
                    <p className="mt-1 text-sm text-red-600">{errors.ctc.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    In-hand CTC (₹)*
                  </label>
                  <input
                    type="number"
                    placeholder="In-hand CTC amount"
                    {...register('inHandCtc', { 
                      required: 'In-hand CTC is required',
                      min: { value: 0, message: 'In-hand CTC must be positive' },
                      valueAsNumber: true
                    })}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                  />
                  {errors.inHandCtc && (
                    <p className="mt-1 text-sm text-red-600">{errors.inHandCtc.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Relieving CTC (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="Relieving CTC (if applicable)"
                    {...register('relievingCtc')}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    IT
                  </label>
                  <select
                    {...register('isIT')}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                  >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Resignation
                  </label>
                  <select
                    {...register('isResignation')}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                  >
                    <option value="false">No</option>
                    <option value="true">Yes</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Salary Details Section */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h2 className="text-lg font-medium text-gray-800 mb-4 border-l-4 border-green-500 pl-2">Salary Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Salary ID*
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. SAL-001"
                    {...register('salaryId', { 
                      required: 'Salary ID is required',
                      pattern: { 
                        value: /^[A-Z0-9-]{3,10}$/i, 
                        message: 'Please enter a valid ID format' 
                      }
                    })}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                  />
                  {errors.salaryId && (
                    <p className="mt-1 text-sm text-red-600">{errors.salaryId.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Salary per annum (₹)*
                  </label>
                  <input
                    type="number"
                    placeholder="Annual salary amount"
                    {...register('salary', { 
                      required: 'Salary is required',
                      min: { value: 0, message: 'Salary must be positive' },
                      valueAsNumber: true
                    })}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                  />
                  {errors.salary && (
                    <p className="mt-1 text-sm text-red-600">{errors.salary.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Salary per month (₹)*
                  </label>
                  <input
                    type="number"
                    placeholder="Monthly salary amount"
                    {...register('salaryPerMonth', { 
                      required: 'Monthly salary is required',
                      min: { value: 0, message: 'Amount must be positive' }
                    })}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                  />
                  {errors.salaryPerMonth && (
                    <p className="mt-1 text-sm text-red-600">{errors.salaryPerMonth.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Basic (₹)*
                  </label>
                  <input
                    type="number"
                    placeholder="Basic salary amount"
                    {...register('basic', { 
                      required: 'Basic salary is required',
                      min: { value: 0, message: 'Amount must be positive' }
                    })}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                  />
                  {errors.basic && (
                    <p className="mt-1 text-sm text-red-600">{errors.basic.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    DA (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="Dearness Allowance"
                    {...register('da', { 
                      min: { value: 0, message: 'Amount must be positive' }
                    })}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                  />
                  {errors.da && (
                    <p className="mt-1 text-sm text-red-600">{errors.da.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    HRA (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="House Rent Allowance"
                    {...register('hra', { 
                      min: { value: 0, message: 'Amount must be positive' }
                    })}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                  />
                  {errors.hra && (
                    <p className="mt-1 text-sm text-red-600">{errors.hra.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    PF (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="Provident Fund"
                    {...register('pf', { 
                      min: { value: 0, message: 'Amount must be positive' }
                    })}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                  />
                  {errors.pf && (
                    <p className="mt-1 text-sm text-red-600">{errors.pf.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Medical Allowance (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="Medical Allowance"
                    {...register('medicalAllowance', { 
                      min: { value: 0, message: 'Amount must be positive' }
                    })}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                  />
                  {errors.medicalAllowance && (
                    <p className="mt-1 text-sm text-red-600">{errors.medicalAllowance.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Transport (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="Transport Allowance"
                    {...register('transport', { 
                      min: { value: 0, message: 'Amount must be positive' }
                    })}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                  />
                  {errors.transport && (
                    <p className="mt-1 text-sm text-red-600">{errors.transport.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gratuity (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="Gratuity"
                    {...register('gratuity', { 
                      min: { value: 0, message: 'Amount must be positive' }
                    })}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                  />
                  {errors.gratuity && (
                    <p className="mt-1 text-sm text-red-600">{errors.gratuity.message}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Leaves
                  </label>
                  <input
                    type="number"
                    placeholder="Days per year"
                    {...register('totalLeaves', { 
                      min: { value: 0, message: 'Value must be positive' }
                    })}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                  />
                  {errors.totalLeaves && (
                    <p className="mt-1 text-sm text-red-600">{errors.totalLeaves.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Salary Credit Date
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 1st of every month"
                    {...register('salaryCreditDate')}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payable Days
                  </label>
                  <input
                    type="number"
                    placeholder="Days"
                    {...register('payableDays')}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Mode
                  </label>
                  <select
                    {...register('paymentMode')}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                  >
                    <option value="bank-transfer">Bank Transfer</option>
                    <option value="cheque">Cheque</option>
                    <option value="cash">Cash</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Allowance (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="Additional Allowance"
                    {...register('additionalAllowance', { 
                      min: { value: 0, message: 'Amount must be positive' }
                    })}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Special Allowance (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="Special Allowance"
                    {...register('specialAllowance', { 
                      min: { value: 0, message: 'Amount must be positive' }
                    })}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                  />
                </div>
              </div>
            </div>

            {/* Job Details Section */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h2 className="text-lg font-medium text-gray-800 mb-4 border-l-4 border-purple-500 pl-2">Job Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Job Title*
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Software Engineer"
                    {...register('jobTitle', { 
                      required: 'Job title is required' 
                    })}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                  />
                  {errors.jobTitle && (
                    <p className="mt-1 text-sm text-red-600">{errors.jobTitle.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Engineering"
                    {...register('department')}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Headquarters"
                    {...register('location')}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reporting Manager
                  </label>
                  <input
                    type="text"
                    placeholder="Manager's name"
                    {...register('reportingManager')}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Employment Type*
                  </label>
                  <select
                    {...register('employmentType', { required: 'Employment type is required' })}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                  >
                    <option value="full-time">Full Time</option>
                    <option value="part-time">Part Time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                  </select>
                  {errors.employmentType && (
                    <p className="mt-1 text-sm text-red-600">{errors.employmentType.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Work Schedule
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 9:00 AM - 6:00 PM"
                    {...register('workSchedule')}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                type="button"
                onClick={() => router.back()}
                className="mr-4 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
              >
                <FiSave />
                {isSubmitting ? 'Saving...' : 'Save Employment'}
              </button>
            </div>
          </form>
        </div>
      )}
    </DashboardLayout>
  );
} 