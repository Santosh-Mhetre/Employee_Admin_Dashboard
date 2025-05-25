'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { FiArrowLeft, FiSave } from 'react-icons/fi';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { getEmployment, updateEmployment, getEmployees } from '@/utils/firebaseUtils';
import { Employment, Employee } from '@/types';
import toast, { Toaster } from 'react-hot-toast';
import { SkeletonBreadcrumb, SkeletonHeader, SkeletonCard } from '@/components/ui/SkeletonLoader';

interface EmploymentFormData extends Omit<Employment, 'id' | 'benefits'> {
  benefits: string | string[];
}

export default function EditEmploymentPage({ params }: { params: { id: string } }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [employment, setEmployment] = useState<Employment | null>(null);
  
  const router = useRouter();
  const [id, setId] = useState<string>('');
  
  useEffect(() => {
    // Set the ID from params once on component mount
    if (params && params.id) {
      setId(params.id);
    }
  }, [params]);
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm<EmploymentFormData>();

  useEffect(() => {
    if (!id) return;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch employees for the dropdown
        const employeesData = await getEmployees();
        setEmployees(employeesData);
        
        // Fetch employment data
        const employmentData = await getEmployment(id);
        setEmployment(employmentData);
        
        // Find the associated employee
        const employee = employeesData.find(emp => emp.id === employmentData.employeeId);
        if (employee) {
          setSelectedEmployee(employee);
        }
        
        // Reset form with employment data
        reset({
          employeeId: employmentData.employeeId,
          contractType: employmentData.contractType,
          startDate: employmentData.startDate,
          endDate: employmentData.endDate || '',
          salary: employmentData.salary,
          paymentFrequency: employmentData.paymentFrequency,
          benefits: employmentData.benefits?.join(', ') || '',
          
          // Employment Information
          employmentId: employmentData.employmentId || '',
          joiningDate: employmentData.joiningDate || employmentData.startDate || '',
          incrementDate: employmentData.incrementDate || '',
          ctc: employmentData.ctc || employmentData.salary || 0,
          inHandCtc: employmentData.inHandCtc || 0,
          relievingCtc: employmentData.relievingCtc || 0,
          isPF: employmentData.isPF || false,
          designation: employmentData.designation || '',
          
          // Salary Information
          salaryId: employmentData.salaryId || '',
          salaryCreditedAmount: employmentData.salaryCreditedAmount || 0,
          basic: employmentData.basic || 0,
          da: employmentData.da || 0,
          hra: employmentData.hra || 0,
          pf: employmentData.pf || 0,
          medicalAllowance: employmentData.medicalAllowance || 0,
          transport: employmentData.transport || 0,
          gratuity: employmentData.gratuity || 0,
          totalLeaves: employmentData.totalLeaves || 0,
          salaryCreditDate: employmentData.salaryCreditDate || '',
          payableDays: employmentData.payableDays || 0,
          paymentMode: employmentData.paymentMode || '',
          additionalAllowance: employmentData.additionalAllowance || 0,
          specialAllowance: employmentData.specialAllowance || 0,
          
          // Job Details
          jobTitle: employmentData.jobTitle || '',
          department: employmentData.department || '',
          location: employmentData.location || '',
          jobMode: employmentData.jobMode || 'onsite',
          reportingManager: employmentData.reportingManager || '',
          employmentType: employmentData.employmentType || employmentData.contractType || '',
          workSchedule: employmentData.workSchedule || '',
        });
      } catch (error: any) {
        setError(error.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, reset]);

  const onSubmit = async (data: EmploymentFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      toast.loading('Updating employment...', { id: 'updateEmployment' });
      
      // Convert benefits string to array
      const benefitsArray = typeof data.benefits === 'string' 
        ? data.benefits.split(',').map(b => b.trim()).filter(b => b !== '')
        : data.benefits;
      
      // First, create a clean object with all fields converted to appropriate types
      const formattedData = {
        employeeId: data.employeeId,
        contractType: data.contractType,
        startDate: data.startDate,
        endDate: data.endDate || null,
        salary: Number(data.salary),
        paymentFrequency: data.paymentFrequency,
        benefits: benefitsArray,
        
        // Employment Information
        employmentId: data.employmentId || null,
        joiningDate: data.joiningDate || null,
        incrementDate: data.incrementDate || null,
        ctc: Number(data.ctc) || null,
        inHandCtc: Number(data.inHandCtc) || null,
        relievingCtc: Number(data.relievingCtc) || null,
        isPF: typeof data.isPF === 'boolean' ? data.isPF : data.isPF === 'true' ? true : data.isPF === 'false' ? false : null,
        designation: data.designation || null,
        
        // Salary Information
        salaryId: data.salaryId || null,
        salaryCreditedAmount: Number(data.salaryCreditedAmount) || null,
        basic: Number(data.basic) || null,
        da: Number(data.da) || null,
        hra: Number(data.hra) || null,
        pf: Number(data.pf) || null,
        medicalAllowance: Number(data.medicalAllowance) || null,
        transport: Number(data.transport) || null,
        gratuity: Number(data.gratuity) || null,
        totalLeaves: Number(data.totalLeaves) || null,
        salaryCreditDate: data.salaryCreditDate || null,
        payableDays: Number(data.payableDays) || null,
        paymentMode: data.paymentMode || null,
        additionalAllowance: Number(data.additionalAllowance) || null,
        specialAllowance: Number(data.specialAllowance) || null,
        
        // Job Details
        jobTitle: data.jobTitle || null,
        department: data.department || null,
        location: data.location || null,
        jobMode: data.jobMode || null,
        reportingManager: data.reportingManager || null,
        employmentType: data.employmentType || null,
        workSchedule: data.workSchedule || null,
      };
      
      // Remove any null, undefined, or NaN values to prevent Firestore errors
      const cleanData: Record<string, any> = {};
      Object.entries(formattedData).forEach(([key, value]) => {
        // Skip undefined values
        if (value === undefined) return;
        
        // Skip NaN values
        if (typeof value === 'number' && isNaN(value)) return;
        
        // Include all other values (including null, which Firestore accepts)
        cleanData[key] = value;
      });
      
      console.log('Clean data prepared for update:', cleanData);
      
      // Update employment record
      await updateEmployment(id, cleanData);
      
      // Show success message
      toast.success('Employment updated successfully!', { id: 'updateEmployment' });
      
      // Navigate to employment details page
      setTimeout(() => {
        router.push(`/employments/${id}`);
      }, 500); // Small delay to ensure toast is visible
    } catch (error: any) {
      console.error('Update failed:', error);
      setError(error.message || 'Failed to update employment');
      toast.error('Failed to update employment', { id: 'updateEmployment' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <SkeletonBreadcrumb levels={4} />
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
        <Link href={`/employments/${id}`} className="hover:text-blue-600">Employment Details</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-800 font-medium">Edit</span>
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <Link
          href={`/employments/${id}`}
          className="px-3 py-1 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 flex items-center gap-1"
        >
          <FiArrowLeft size={14} /> Back
        </Link>
        
        <h1 className="text-xl font-bold text-gray-800 text-center flex-1">
          {selectedEmployee ? `Edit Employment for ${selectedEmployee.name}` : 'Edit Employment'}
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

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Hidden input for employeeId */}
        <input type="hidden" {...register('employeeId')} />
        <input type="hidden" {...register('contractType')} />
        <input type="hidden" {...register('startDate')} />
        <input type="hidden" {...register('endDate')} />
        <input type="hidden" {...register('salary')} />
        <input type="hidden" {...register('paymentFrequency')} />
        <input type="hidden" {...register('benefits')} />

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

        {/* Salary Information */}
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
            href={`/employments/${id}`}
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
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </DashboardLayout>
  );
} 