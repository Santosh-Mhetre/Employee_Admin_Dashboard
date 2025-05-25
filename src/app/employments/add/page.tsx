'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { addEmployment, getEmployees } from '@/utils/firebaseUtils';
import { Employment, Employee } from '@/types';
import { FiSave, FiX, FiArrowLeft } from 'react-icons/fi';
import toast, { Toaster } from 'react-hot-toast';
import Link from 'next/link';
import { SkeletonBreadcrumb, SkeletonHeader } from '@/components/ui/SkeletonLoader';

interface EmploymentFormData extends Omit<Employment, 'id'> {
  // Add all the fields we need
  employmentId: string;
  joiningDate: string;
  incrementDate: string;
  ctc: number;
  inHandCtc: number;
  relievingCtc?: number;
  isPF: boolean;
  designation: string;
  
  // Salary details
  salaryId: string;
  salaryCreditedAmount: number;
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
  jobMode: 'remote' | 'onsite' | 'hybrid';
  reportingManager: string;
  employmentType: string;
  workSchedule: string;
}

export default function AddEmploymentPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  
  const router = useRouter();
  
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<EmploymentFormData>({
    defaultValues: {
      employmentType: 'full-time',
      paymentFrequency: 'monthly',
      paymentMode: 'bank-transfer',
      isPF: true,
      designation: '',
      jobMode: 'onsite',
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
        
        // Check for employeeId in URL query params
        const params = new URLSearchParams(window.location.search);
        const employeeId = params.get('employeeId');
        
        if (employeeId) {
          const foundEmployee = data.find(emp => emp.id === employeeId);
          if (foundEmployee) {
            setSelectedEmployee(foundEmployee);
            setValue('employeeId', employeeId);
          } else {
            setError('Selected employee not found');
          }
        }
      } catch (error) {
        console.error('Error fetching employees:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [setValue]);

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
        isPF: data.isPF,
        designation: data.designation,
      };
      
      await addEmployment(formattedData);
      toast.success('Employment record created successfully!', { id: 'add-employment' });
      
      // Navigate back to the employee details page or employees list
      if (selectedEmployee) {
        router.push(`/employees/${selectedEmployee.id}`);
      } else {
        router.push('/employees');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to add employment');
      toast.error(error.message || 'Failed to add employment', { id: 'add-employment' });
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <SkeletonBreadcrumb levels={3} />
        <SkeletonHeader />
        
        {/* Form skeleton */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="space-y-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(12)].map((_, index) => (
                <div key={index} className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-10 bg-gray-200 rounded w-full"></div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-end space-x-4 pt-4">
              <div className="h-10 bg-gray-200 rounded w-24"></div>
              <div className="h-10 bg-gray-200 rounded w-32"></div>
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
        <Link href="/employees" className="hover:text-blue-600">Employees</Link>
        {selectedEmployee && (
          <>
            <span className="mx-2">/</span>
            <Link href={`/employees/${selectedEmployee.id}`} className="hover:text-blue-600">{selectedEmployee.name}</Link>
          </>
        )}
        <span className="mx-2">/</span>
        <span className="text-gray-800 font-medium">Add Employment</span>
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <Link
          href={selectedEmployee ? `/employees/${selectedEmployee.id}` : '/employees'}
          className="px-3 py-1 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 flex items-center gap-1"
        >
          <FiArrowLeft size={14} /> Back
        </Link>
        
        <h1 className="text-xl font-bold text-gray-800 text-center flex-1">
          {selectedEmployee ? `Add Employment for ${selectedEmployee.name}` : 'Add New Employment'}
        </h1>
        
        <div className="px-3 py-1 opacity-0">
          {/* Empty div for spacing */}
          <FiArrowLeft size={14} className="invisible" />
        </div>
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
      ) : !selectedEmployee ? (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
          <p>No employee selected. Please go back to the employees list and select an employee.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Hidden input for employeeId */}
            <input type="hidden" {...register('employeeId')} />

            {/* Employment Information Section */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h2 className="text-lg font-medium text-gray-800 mb-4 border-l-4 border-blue-500 pl-2">Employment Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                

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
                    PF
                  </label>
                  <select
                    {...register('isPF')}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                  >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Designation
                  </label>
                  <input
                    type="text"
                    placeholder="Employee designation"
                    {...register('designation')}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Job Mode
                  </label>
                  <select
                    {...register('jobMode')}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                  >
                    <option value="onsite">Onsite</option>
                    <option value="remote">Remote</option>
                    <option value="hybrid">Hybrid</option>
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
                    Salary Credited Amount (₹)*
                  </label>
                  <input
                    type="number"
                    placeholder="Salary Credited Amount"
                    {...register('salaryCreditedAmount', { 
                      required: 'Salary credited amount is required',
                      min: { value: 0, message: 'Amount must be positive' }
                    })}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                  />
                  {errors.salaryCreditedAmount && (
                    <p className="mt-1 text-sm text-red-600">{errors.salaryCreditedAmount.message}</p>
                  )}
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

            <div className="flex justify-between gap-4 mt-6">
              <Link
                href={selectedEmployee ? `/employees/${selectedEmployee.id}` : '/employees'}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center gap-1"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2 disabled:opacity-50"
              >
                <FiSave />
                {isSubmitting ? 'Saving...' : 'Add Employment'}
              </button>
            </div>
          </form>
        </div>
      )}
    </DashboardLayout>
  );
} 