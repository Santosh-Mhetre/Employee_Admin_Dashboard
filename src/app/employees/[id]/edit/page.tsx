'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { FiArrowLeft, FiSave } from 'react-icons/fi';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { getEmployee, updateEmployee } from '@/utils/firebaseUtils';
import { Employee } from '@/types';
import toast, { Toaster } from 'react-hot-toast';
import { SkeletonBreadcrumb, SkeletonHeader } from '@/components/ui/SkeletonLoader';

function EditEmployeePage({ params }: { params: { id: string } }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const id = params.id;
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm<Omit<Employee, 'id'>>();

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        setLoading(true);
        const employeeData = await getEmployee(id);
        // Reset form with all employee data except id
        const { id: _id, ...rest } = employeeData;
        reset(rest);
      } catch (error: any) {
        setError(error.message || 'Failed to fetch employee data');
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [id, reset]);

  const onSubmit = async (data: Omit<Employee, 'id'>) => {
    try {
      setIsSubmitting(true);
      setError(null);
      await updateEmployee(id, data);
      router.push(`/employees/${id}`);
    } catch (error: any) {
      setError(error.message || 'Failed to update employee');
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
              {[...Array(15)].map((_, index) => (
                <div key={index} className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-10 bg-gray-200 rounded w-full"></div>
                </div>
              ))}
            </div>
            
            <div className="h-6 bg-gray-200 rounded w-1/4 my-6"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-24 bg-gray-200 rounded w-full"></div>
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
      {/* Breadcrumb Navigation */}
      <div className="flex items-center text-sm text-gray-600 mb-4">
        <Link href="/dashboard" className="hover:text-blue-600">Dashboard</Link>
        <span className="mx-2">/</span>
        <Link href="/employees" className="hover:text-blue-600">Employees</Link>
        <span className="mx-2">/</span>
        <Link href={`/employees/${id}`} className="hover:text-blue-600">Employee Details</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-800 font-medium">Edit</span>
      </div>

      <div className="flex justify-between items-center mb-6">
        <Link
          href={`/employees/${id}`}
          className="px-3 py-1 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 flex items-center gap-1"
        >
          <FiArrowLeft size={14} /> Back
        </Link>
        
        <h1 className="text-xl font-bold text-gray-800 text-center flex-1">
          Edit Employee
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

      <div className="bg-white rounded-lg shadow-sm p-6">
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Personal Details Section */}
          <div className="bg-gray-100 p-4 mb-4 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-800 mb-2 border-l-4 border-blue-500 pl-2">Personal Details</h2>
            <div className="bg-white p-4 rounded-lg mb-4">
              <h3 className="text-md font-medium text-gray-700 mb-3 border-l-2 border-green-500 pl-2">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name*</label>
                  <input type="text" placeholder="Enter full name" {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Name must be at least 2 characters' }, maxLength: { value: 50, message: 'Name cannot exceed 50 characters' } })} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black" />
                  {errors.name && (<p className="mt-1 text-sm text-red-600">{errors.name.message}</p>)}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth*</label>
                  <input type="date" {...register('dateOfBirth', { required: 'Date of birth is required', validate: value => { if (!value) return 'Date of birth is required'; const date = new Date(value); const today = new Date(); const age = today.getFullYear() - date.getFullYear(); return (age >= 18) || 'Employee must be at least 18 years old'; } })} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black" />
                  {errors.dateOfBirth && (<p className="mt-1 text-sm text-red-600">{errors.dateOfBirth.message}</p>)}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Is Active</label>
                  <select {...register('isActive')} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black">
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Home Town</label>
                  <input type="text" placeholder="Enter home town" {...register('homeTown', { maxLength: { value: 50, message: 'Home town cannot exceed 50 characters' } })} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black" />
                  {errors.homeTown && (<p className="mt-1 text-sm text-red-600">{errors.homeTown.message}</p>)}
                </div>
              </div>
            </div>
            {/* Contact Information */}
            <div className="bg-white p-4 rounded-lg mb-4">
              <h3 className="text-md font-medium text-gray-700 mb-3 border-l-2 border-green-500 pl-2">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mobile No.*</label>
                  <input type="tel" placeholder="Enter 10-digit mobile number" {...register('phone', { required: 'Phone number is required', pattern: { value: /^[0-9]{10}$/, message: 'Please enter a valid 10-digit phone number' } })} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black" />
                  {errors.phone && (<p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>)}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email ID*</label>
                  <input type="email" placeholder="Enter email address" {...register('email', { required: 'Email is required', pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Invalid email address' } })} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black" />
                  {errors.email && (<p className="mt-1 text-sm text-red-600">{errors.email.message}</p>)}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Address*</label>
                  <textarea placeholder="Enter current address" {...register('currentAddress', { required: 'Current address is required' })} rows={3} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"></textarea>
                  {errors.currentAddress && (<p className="mt-1 text-sm text-red-600">{errors.currentAddress.message}</p>)}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Permanent Address</label>
                  <textarea placeholder="Enter permanent address (if different from current)" {...register('permanentAddress')} rows={3} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"></textarea>
                </div>
              </div>
            </div>
            {/* Identification Documents */}
            <div className="bg-white p-4 rounded-lg mb-4">
              <h3 className="text-md font-medium text-gray-700 mb-3 border-l-2 border-green-500 pl-2">Identification Documents</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Aadhar Card*</label>
                  <input type="text" placeholder="Enter 12-digit Aadhar number" {...register('aadharCard', { pattern: { value: /^\d{12}$/, message: 'Please enter a valid 12-digit Aadhar number' } })} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black" />
                  {errors.aadharCard && (<p className="mt-1 text-sm text-red-600">{errors.aadharCard.message}</p>)}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Driving License</label>
                  <input type="text" placeholder="Enter driving license number" {...register('drivingLicense')} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">PAN Card*</label>
                  <input type="text" placeholder="Enter PAN number" {...register('panCard', { pattern: { value: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, message: 'Please enter a valid PAN number (e.g., ABCDE1234F)' } })} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black" />
                  {errors.panCard && (<p className="mt-1 text-sm text-red-600">{errors.panCard.message}</p>)}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Van No</label>
                  <input type="text" placeholder="Enter van number" {...register('vanNo', { pattern: { value: /^[A-Z0-9]{2,10}$/i, message: 'Please enter a valid van number' } })} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black" />
                  {errors.vanNo && (<p className="mt-1 text-sm text-red-600">{errors.vanNo.message}</p>)}
                </div>
              </div>
            </div>
            {/* Bank Details */}
            <div className="bg-white p-4 rounded-lg mb-4">
              <h3 className="text-md font-medium text-gray-700 mb-3 border-l-2 border-green-500 pl-2">Bank Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name*</label>
                  <input type="text" placeholder="Enter bank name" {...register('bankName', { required: 'Bank name is required' })} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black" />
                  {errors.bankName && (<p className="mt-1 text-sm text-red-600">{errors.bankName.message}</p>)}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Account No.*</label>
                  <input type="text" placeholder="Enter account number" {...register('accountNo', { required: 'Account number is required', pattern: { value: /^\d{9,18}$/, message: 'Please enter a valid account number' } })} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black" />
                  {errors.accountNo && (<p className="mt-1 text-sm text-red-600">{errors.accountNo.message}</p>)}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">IFSC Code*</label>
                  <input type="text" placeholder="Enter IFSC code" {...register('ifscCode', { required: 'IFSC code is required', pattern: { value: /^[A-Z]{4}0[A-Z0-9]{6}$/, message: 'Please enter a valid IFSC code' } })} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black" />
                  {errors.ifscCode && (<p className="mt-1 text-sm text-red-600">{errors.ifscCode.message}</p>)}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Account Holder Name*</label>
                  <input type="text" placeholder="Enter account holder name" {...register('accountHolderName', { required: 'Account holder name is required' })} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black" />
                  {errors.accountHolderName && (<p className="mt-1 text-sm text-red-600">{errors.accountHolderName.message}</p>)}
                </div>
              </div>
            </div>
          </div>
          {/* Educational Details Section */}
          <div className="bg-gray-100 p-4 mb-4 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-800 mb-2 border-l-4 border-blue-500 pl-2">Educational Details</h2>
            {/* Higher Education */}
            <div className="bg-white p-4 rounded-lg mb-4">
              <h3 className="text-md font-medium text-gray-700 mb-3 border-l-2 border-green-500 pl-2">Higher Education</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Degree</label>
                  <input type="text" placeholder="Enter degree name (e.g., B.Tech, MBA)" {...register('graduation.degree')} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
                  <input type="text" placeholder="Enter specialization/branch" {...register('graduation.branch')} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                  <select {...register('graduation.month')} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black">
                    <option value="">Select Month</option>
                    <option value="January">January</option>
                    <option value="February">February</option>
                    <option value="March">March</option>
                    <option value="April">April</option>
                    <option value="May">May</option>
                    <option value="June">June</option>
                    <option value="July">July</option>
                    <option value="August">August</option>
                    <option value="September">September</option>
                    <option value="October">October</option>
                    <option value="November">November</option>
                    <option value="December">December</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Passing Year</label>
                  <input type="text" placeholder="YYYY" {...register('graduation.passingYear', { pattern: { value: /^(19|20)\d{2}$/, message: 'Enter a valid 4-digit year' } })} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black" />
                  {errors.graduation?.passingYear && (<p className="mt-1 text-sm text-red-600">{errors.graduation.passingYear.message}</p>)}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">College Name</label>
                  <input type="text" placeholder="Enter college/institution name" {...register('graduation.collegeName')} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">University Name</label>
                  <input type="text" placeholder="Enter university name" {...register('graduation.universityName')} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Marks</label>
                  <input type="text" placeholder="CGPA or Percentage" {...register('graduation.marks')} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black" />
                </div>
              </div>
            </div>
            {/* 12th Standard */}
            <div className="bg-white p-4 rounded-lg mb-4">
              <h3 className="text-md font-medium text-gray-700 mb-3 border-l-2 border-green-500 pl-2">12th Standard</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">School</label>
                  <input type="text" placeholder="Enter school name" {...register('twelthStandard.school')} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
                  <input type="text" placeholder="Enter branch/stream (e.g., Science, Commerce)" {...register('twelthStandard.branch')} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                  <select {...register('twelthStandard.month')} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black">
                    <option value="">Select Month</option>
                    <option value="January">January</option>
                    <option value="February">February</option>
                    <option value="March">March</option>
                    <option value="April">April</option>
                    <option value="May">May</option>
                    <option value="June">June</option>
                    <option value="July">July</option>
                    <option value="August">August</option>
                    <option value="September">September</option>
                    <option value="October">October</option>
                    <option value="November">November</option>
                    <option value="December">December</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Passing Year</label>
                  <input type="text" placeholder="YYYY" {...register('twelthStandard.passingYear', { pattern: { value: /^(19|20)\d{2}$/, message: 'Enter a valid 4-digit year' } })} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black" />
                  {errors.twelthStandard?.passingYear && (<p className="mt-1 text-sm text-red-600">{errors.twelthStandard.passingYear.message}</p>)}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">School Name</label>
                  <input type="text" placeholder="Enter full school name" {...register('twelthStandard.schoolName')} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Marks</label>
                  <input type="text" placeholder="Percentage" {...register('twelthStandard.marks')} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black" />
                </div>
              </div>
            </div>
            {/* Other Education */}
            <div className="bg-white p-4 rounded-lg mb-4">
              <h3 className="text-md font-medium text-gray-700 mb-3 border-l-2 border-green-500 pl-2">Other Education</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Diploma</label>
                  <input type="text" placeholder="Enter diploma name" {...register('otherEducation.diploma')} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
                  <input type="text" placeholder="Enter specialization/branch" {...register('otherEducation.branch')} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                  <select {...register('otherEducation.month')} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black">
                    <option value="">Select Month</option>
                    <option value="January">January</option>
                    <option value="February">February</option>
                    <option value="March">March</option>
                    <option value="April">April</option>
                    <option value="May">May</option>
                    <option value="June">June</option>
                    <option value="July">July</option>
                    <option value="August">August</option>
                    <option value="September">September</option>
                    <option value="October">October</option>
                    <option value="November">November</option>
                    <option value="December">December</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Passing Year</label>
                  <input type="text" placeholder="YYYY" {...register('otherEducation.passingYear', { pattern: { value: /^(19|20)\d{2}$/, message: 'Enter a valid 4-digit year' } })} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black" />
                  {errors.otherEducation?.passingYear && (<p className="mt-1 text-sm text-red-600">{errors.otherEducation.passingYear.message}</p>)}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">College Name</label>
                  <input type="text" placeholder="Enter college/institution name" {...register('otherEducation.collegeName')} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Marks</label>
                  <input type="text" placeholder="Percentage" {...register('otherEducation.marks')} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black" />
                </div>
              </div>
            </div>
            {/* 10th Standard */}
            <div className="bg-white p-4 rounded-lg mb-4">
              <h3 className="text-md font-medium text-gray-700 mb-3 border-l-2 border-green-500 pl-2">10th Standard</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">School</label>
                  <input type="text" placeholder="Enter school name" {...register('tenthStandard.school')} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                  <select {...register('tenthStandard.month')} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black">
                    <option value="">Select Month</option>
                    <option value="January">January</option>
                    <option value="February">February</option>
                    <option value="March">March</option>
                    <option value="April">April</option>
                    <option value="May">May</option>
                    <option value="June">June</option>
                    <option value="July">July</option>
                    <option value="August">August</option>
                    <option value="September">September</option>
                    <option value="October">October</option>
                    <option value="November">November</option>
                    <option value="December">December</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Passing Year</label>
                  <input type="text" placeholder="YYYY" {...register('tenthStandard.passingYear', { pattern: { value: /^(19|20)\d{2}$/, message: 'Enter a valid 4-digit year' } })} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black" />
                  {errors.tenthStandard?.passingYear && (<p className="mt-1 text-sm text-red-600">{errors.tenthStandard.passingYear.message}</p>)}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">School Name</label>
                  <input type="text" placeholder="Enter full school name" {...register('tenthStandard.schoolName')} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Marks</label>
                  <input type="text" placeholder="Percentage" {...register('tenthStandard.marks')} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black" />
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-between gap-4 mt-6">
            <Link 
              href={`/employees/${id}`} 
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
      </div>
    </DashboardLayout>
  );
}

export default EditEmployeePage; 