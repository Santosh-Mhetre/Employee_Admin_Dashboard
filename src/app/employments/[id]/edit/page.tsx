'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { FiArrowLeft, FiSave } from 'react-icons/fi';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { getEmployment, updateEmployment, getEmployees } from '@/utils/firebaseUtils';
import { Employment, Employee } from '@/types';
import toast, { Toaster } from 'react-hot-toast';

interface EmploymentFormData extends Omit<Employment, 'id' | 'benefits'> {
  benefits: string | string[];
}

export default function EditEmploymentPage({ params }: { params: { id: string } }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  
  const router = useRouter();
  const id = params.id;
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm<EmploymentFormData>();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch employees for the dropdown
        const employeesData = await getEmployees();
        setEmployees(employeesData);
        
        // Fetch employment data
        const employmentData = await getEmployment(id);
        
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
          isIT: employmentData.isIT || false,
          isResignation: employmentData.isResignation || false,
          
          // Salary Information
          salaryId: employmentData.salaryId || '',
          salaryPerMonth: employmentData.salaryPerMonth || employmentData.salary / 12 || 0,
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
      
      // Convert string numbers to actual numbers
      const formattedData = {
        ...data,
        salary: Number(data.salary),
        ctc: Number(data.ctc),
        inHandCtc: Number(data.inHandCtc),
        relievingCtc: Number(data.relievingCtc),
        salaryPerMonth: Number(data.salaryPerMonth),
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
        benefits: benefitsArray,
        // Handle empty string fields
        endDate: data.endDate || undefined,
        employmentId: data.employmentId || undefined,
        joiningDate: data.joiningDate || undefined,
        incrementDate: data.incrementDate || undefined,
        salaryId: data.salaryId || undefined,
        salaryCreditDate: data.salaryCreditDate || undefined,
        paymentMode: data.paymentMode || undefined,
        jobTitle: data.jobTitle || undefined,
        department: data.department || undefined,
        location: data.location || undefined,
        reportingManager: data.reportingManager || undefined,
        employmentType: data.employmentType || undefined,
        workSchedule: data.workSchedule || undefined
      };
      
      await updateEmployment(id, formattedData);
      toast.success('Employment updated successfully!', { id: 'updateEmployment' });
      router.push(`/employments/${id}`);
    } catch (error: any) {
      setError(error.message || 'Failed to update employment');
      toast.error('Failed to update employment', { id: 'updateEmployment' });
      setIsSubmitting(false);
    }
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

  return (
    <DashboardLayout>
      <Toaster position="top-center" />
      
      {/* Breadcrumb Navigation */}
      <div className="flex items-center text-sm text-gray-600 mb-4">
        <Link href="/dashboard" className="hover:text-blue-600">Dashboard</Link>
        <span className="mx-2">/</span>
        <Link href="/employments" className="hover:text-blue-600">Employments</Link>
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
          Edit Employment
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
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 border-l-4 border-blue-500 pl-2">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employee
              </label>
              <select
                {...register('employeeId', { required: 'Employee is required' })}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Employee</option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name} - {employee.position}
                  </option>
                ))}
              </select>
              {errors.employeeId && (
                <p className="mt-1 text-sm text-red-600">{errors.employeeId.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contract Type
              </label>
              <select
                {...register('contractType', { required: 'Contract type is required' })}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="full-time">Full Time</option>
                <option value="part-time">Part Time</option>
                <option value="contract">Contract</option>
              </select>
              {errors.contractType && (
                <p className="mt-1 text-sm text-red-600">{errors.contractType.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                {...register('startDate', { required: 'Start date is required' })}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.startDate && (
                <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date (Optional)
              </label>
              <input
                type="date"
                {...register('endDate')}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Salary
              </label>
              <input
                type="number"
                {...register('salary', { 
                  required: 'Salary is required',
                  min: { value: 0, message: 'Salary must be positive' },
                  valueAsNumber: true
                })}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Annual salary"
              />
              {errors.salary && (
                <p className="mt-1 text-sm text-red-600">{errors.salary.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Frequency
              </label>
              <select
                {...register('paymentFrequency')}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="monthly">Monthly</option>
                <option value="bi-weekly">Bi-Weekly</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Employment Information */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 border-l-4 border-blue-500 pl-2">Employment Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employment ID
              </label>
              <input
                type="text"
                {...register('employmentId')}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="E.g., EMP-001"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Joining Date
              </label>
              <input
                type="date"
                {...register('joiningDate')}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Increment Date
              </label>
              <input
                type="date"
                {...register('incrementDate')}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CTC
              </label>
              <input
                type="number"
                {...register('ctc', { 
                  min: { value: 0, message: 'CTC must be positive' },
                  valueAsNumber: true
                })}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Total Cost to Company"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                In-hand CTC
              </label>
              <input
                type="number"
                {...register('inHandCtc', { 
                  min: { value: 0, message: 'In-hand CTC must be positive' },
                  valueAsNumber: true
                })}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="In-hand CTC"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Relieving CTC
              </label>
              <input
                type="number"
                {...register('relievingCtc')}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Relieving CTC"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                IT
              </label>
              <div className="flex items-center space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    value="true"
                    {...register('isIT')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2">Yes</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    value="false"
                    {...register('isIT')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2">No</span>
                </label>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resignation
              </label>
              <div className="flex items-center space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    value="true"
                    {...register('isResignation')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2">Yes</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    value="false"
                    {...register('isResignation')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2">No</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Salary Information */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 border-l-4 border-green-500 pl-2">Salary Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Salary ID
              </label>
              <input
                type="text"
                {...register('salaryId')}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="E.g., SAL-001"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Salary per month
              </label>
              <input
                type="number"
                {...register('salaryPerMonth')}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Monthly salary"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Basic
              </label>
              <input
                type="number"
                {...register('basic')}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Basic pay"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                DA (Dearness Allowance)
              </label>
              <input
                type="number"
                {...register('da')}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Dearness allowance"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                HRA (House Rent Allowance)
              </label>
              <input
                type="number"
                {...register('hra')}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="House rent allowance"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                PF (Provident Fund)
              </label>
              <input
                type="number"
                {...register('pf')}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Provident fund"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Medical Allowance
              </label>
              <input
                type="number"
                {...register('medicalAllowance')}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Medical allowance"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Transport
              </label>
              <input
                type="number"
                {...register('transport')}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Transport allowance"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gratuity
              </label>
              <input
                type="number"
                {...register('gratuity')}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Gratuity"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Leaves
              </label>
              <input
                type="number"
                {...register('totalLeaves')}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Total leaves per year"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Salary Credit Date
              </label>
              <input
                type="text"
                {...register('salaryCreditDate')}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="E.g., 1st of every month"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payable Days
              </label>
              <input
                type="number"
                {...register('payableDays')}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Payable days"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Mode
              </label>
              <input
                type="text"
                {...register('paymentMode')}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="E.g., Bank Transfer, Cash"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Additional Allowance
              </label>
              <input
                type="number"
                {...register('additionalAllowance')}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Additional allowance"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Special Allowance
              </label>
              <input
                type="number"
                {...register('specialAllowance')}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Special allowance"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-between gap-4 mt-6">
          <Link
            href={`/employments/${id}`}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
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