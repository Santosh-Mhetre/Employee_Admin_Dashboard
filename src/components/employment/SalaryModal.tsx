import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FiX, FiSave } from 'react-icons/fi';
import { Employment } from '@/types';

interface SalaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (salaryData: Partial<Employment>) => Promise<void>;
  employmentId: string;
  currentSalary?: Partial<Employment>;
}

interface SalaryFormData {
  basic: number | null;
  da: number | null;
  hra: number | null;
  pf: number | null;
  medicalAllowance: number | null;
  transport: number | null;
  gratuity: number | null;
  totalLeaves: number | null;
  salaryCreditDate: string;
  salaryCreditedAmount: number | null;
  payableDays: number | null;
  additionalAllowance: number | null;
  specialAllowance: number | null;
  educationAllowance: number | null;
  monthlyReimbursement: number | null;
  lta: number | null;
  statutoryBonus: number | null;
  healthInsurance: number | null;
  employerPF: number | null;
}

const SalaryModal: React.FC<SalaryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  employmentId,
  currentSalary
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const modalRef = React.useRef<HTMLDivElement>(null);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<SalaryFormData>({
    defaultValues: {
      basic: currentSalary?.basic || null,
      da: currentSalary?.da || null,
      hra: currentSalary?.hra || null,
      pf: currentSalary?.pf || null,
      medicalAllowance: currentSalary?.medicalAllowance || null,
      transport: currentSalary?.transport || null,
      gratuity: currentSalary?.gratuity || null,
      totalLeaves: currentSalary?.totalLeaves || null,
      salaryCreditDate: currentSalary?.salaryCreditDate || '1st of every month',
      salaryCreditedAmount: currentSalary?.salaryCreditedAmount || null,
      payableDays: currentSalary?.payableDays || null,
      additionalAllowance: currentSalary?.additionalAllowance || null,
      specialAllowance: currentSalary?.specialAllowance || null,
      educationAllowance: currentSalary?.educationAllowance || null,
      monthlyReimbursement: currentSalary?.monthlyReimbursement || null,
      lta: currentSalary?.lta || null,
      statutoryBonus: currentSalary?.statutoryBonus || null,
      healthInsurance: currentSalary?.healthInsurance || null,
      employerPF: currentSalary?.employerPF || null,
    }
  });

  useEffect(() => {
    // Reset form when modal opens with empty values
    if (isOpen) {
      reset({
        basic: null,
        da: null,
        hra: null,
        pf: null,
        medicalAllowance: null,
        transport: null,
        gratuity: null,
        totalLeaves: null,
        salaryCreditDate: '1st of every month',
        salaryCreditedAmount: null,
        payableDays: null,
        additionalAllowance: null,
        specialAllowance: null,
        educationAllowance: null,
        monthlyReimbursement: null,
        lta: null,
        statutoryBonus: null,
        healthInsurance: null,
        employerPF: null,
      });
    }
  }, [isOpen, reset]);
  
  // Handle click outside to close modal
  useEffect(() => {
    if (!isOpen) return;
    
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const onSubmit = async (data: SalaryFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Convert string values to numbers
      const formattedData = {
        ...data,
        basic: Number(data.basic || 0),
        da: Number(data.da || 0),
        hra: Number(data.hra || 0),
        pf: Number(data.pf || 0),
        medicalAllowance: Number(data.medicalAllowance || 0),
        transport: Number(data.transport || 0),
        gratuity: Number(data.gratuity || 0),
        totalLeaves: Number(data.totalLeaves || 0),
        salaryCreditedAmount: Number(data.salaryCreditedAmount || 0),
        payableDays: Number(data.payableDays || 0),
        additionalAllowance: Number(data.additionalAllowance || 0),
        specialAllowance: Number(data.specialAllowance || 0),
        educationAllowance: Number(data.educationAllowance || 0),
        monthlyReimbursement: Number(data.monthlyReimbursement || 0),
        lta: Number(data.lta || 0),
        statutoryBonus: Number(data.statutoryBonus || 0),
        healthInsurance: Number(data.healthInsurance || 0),
        employerPF: Number(data.employerPF || 0),
      };
      
      await onSave(formattedData);
      onClose();
    } catch (error: any) {
      setError(error.message || 'Failed to save salary data');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 z-50 flex items-center justify-center p-4">
      <div ref={modalRef} className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center z-10">
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-200"
          >
            <FiX size={24} />
          </button>
          <h2 className="text-xl font-bold text-gray-800">
            Add New Salary Record
          </h2>
          <div className="w-8"></div> {/* Empty div for spacing */}
        </div>
        
        <div className="p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
              <p>{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Basic Salary */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Basic Salary (₹)*
                </label>
                <input
                  type="number"
                  {...register('basic', { 
                    required: 'Basic salary is required',
                    min: { value: 0, message: 'Amount must be positive' }
                  })}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.basic && (
                  <p className="mt-1 text-sm text-red-600">{errors.basic.message}</p>
                )}
              </div>
              
              {/* DA */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  DA - Dearness Allowance (₹)
                </label>
                <input
                  type="number"
                  {...register('da', { 
                    min: { value: 0, message: 'Amount must be positive' }
                  })}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.da && (
                  <p className="mt-1 text-sm text-red-600">{errors.da.message}</p>
                )}
              </div>
              
              {/* HRA */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  HRA - House Rent Allowance (₹)
                </label>
                <input
                  type="number"
                  {...register('hra', { 
                    min: { value: 0, message: 'Amount must be positive' }
                  })}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.hra && (
                  <p className="mt-1 text-sm text-red-600">{errors.hra.message}</p>
                )}
              </div>
              
              {/* PF */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  PF - Provident Fund (₹)
                </label>
                <input
                  type="number"
                  {...register('pf', { 
                    min: { value: 0, message: 'Amount must be positive' }
                  })}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.pf && (
                  <p className="mt-1 text-sm text-red-600">{errors.pf.message}</p>
                )}
              </div>
              
              {/* Medical Allowance */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Medical Allowance (₹)
                </label>
                <input
                  type="number"
                  {...register('medicalAllowance', { 
                    min: { value: 0, message: 'Amount must be positive' }
                  })}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.medicalAllowance && (
                  <p className="mt-1 text-sm text-red-600">{errors.medicalAllowance.message}</p>
                )}
              </div>
              
              {/* Transport */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Transport Allowance (₹)
                </label>
                <input
                  type="number"
                  {...register('transport', { 
                    min: { value: 0, message: 'Amount must be positive' }
                  })}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.transport && (
                  <p className="mt-1 text-sm text-red-600">{errors.transport.message}</p>
                )}
              </div>
              
              {/* Gratuity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gratuity (₹)
                </label>
                <input
                  type="number"
                  {...register('gratuity', { 
                    min: { value: 0, message: 'Amount must be positive' }
                  })}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.gratuity && (
                  <p className="mt-1 text-sm text-red-600">{errors.gratuity.message}</p>
                )}
              </div>
              
              {/* Total Leaves */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Leaves
                </label>
                <input
                  type="number"
                  {...register('totalLeaves', { 
                    min: { value: 0, message: 'Value must be positive' }
                  })}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.totalLeaves && (
                  <p className="mt-1 text-sm text-red-600">{errors.totalLeaves.message}</p>
                )}
              </div>
              
              {/* Salary Credit Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Salary Credit Date
                </label>
                <input
                  type="text"
                  placeholder="e.g. 1st of every month"
                  {...register('salaryCreditDate')}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.salaryCreditDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.salaryCreditDate.message}</p>
                )}
              </div>
              
              {/* Salary Credited Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Salary Credited Amount (₹)*
                </label>
                <input
                  type="number"
                  {...register('salaryCreditedAmount', { 
                    required: 'Credited amount is required',
                    min: { value: 0, message: 'Amount must be positive' }
                  })}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.salaryCreditedAmount && (
                  <p className="mt-1 text-sm text-red-600">{errors.salaryCreditedAmount.message}</p>
                )}
              </div>
              
              {/* Payable Days */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payable Days
                </label>
                <input
                  type="number"
                  {...register('payableDays', { 
                    min: { value: 0, message: 'Value must be positive' }
                  })}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.payableDays && (
                  <p className="mt-1 text-sm text-red-600">{errors.payableDays.message}</p>
                )}
              </div>
              
              {/* Additional Allowance */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Allowance (₹)
                </label>
                <input
                  type="number"
                  {...register('additionalAllowance', { 
                    min: { value: 0, message: 'Amount must be positive' }
                  })}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.additionalAllowance && (
                  <p className="mt-1 text-sm text-red-600">{errors.additionalAllowance.message}</p>
                )}
              </div>
              
              {/* Special Allowance */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Special Allowance (₹)
                </label>
                <input
                  type="number"
                  {...register('specialAllowance', { 
                    min: { value: 0, message: 'Amount must be positive' }
                  })}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.specialAllowance && (
                  <p className="mt-1 text-sm text-red-600">{errors.specialAllowance.message}</p>
                )}
              </div>
              
              {/* Education Allowance */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Education Allowance (₹)
                </label>
                <input
                  type="number"
                  {...register('educationAllowance', { 
                    min: { value: 0, message: 'Amount must be positive' }
                  })}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.educationAllowance && (
                  <p className="mt-1 text-sm text-red-600">{errors.educationAllowance.message}</p>
                )}
              </div>
              
              {/* Monthly Reimbursement */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monthly Reimbursement (₹)
                </label>
                <input
                  type="number"
                  {...register('monthlyReimbursement', { 
                    min: { value: 0, message: 'Amount must be positive' }
                  })}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.monthlyReimbursement && (
                  <p className="mt-1 text-sm text-red-600">{errors.monthlyReimbursement.message}</p>
                )}
              </div>
              
              {/* LTA */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  LTA - Leave Travel Allowance (₹)
                </label>
                <input
                  type="number"
                  {...register('lta', { 
                    min: { value: 0, message: 'Amount must be positive' }
                  })}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.lta && (
                  <p className="mt-1 text-sm text-red-600">{errors.lta.message}</p>
                )}
              </div>
              
              {/* Statutory Bonus */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Statutory Bonus (₹)
                </label>
                <input
                  type="number"
                  {...register('statutoryBonus', { 
                    min: { value: 0, message: 'Amount must be positive' }
                  })}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.statutoryBonus && (
                  <p className="mt-1 text-sm text-red-600">{errors.statutoryBonus.message}</p>
                )}
              </div>
              
              {/* Health Insurance */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Health Insurance (₹)
                </label>
                <input
                  type="number"
                  {...register('healthInsurance', { 
                    min: { value: 0, message: 'Amount must be positive' }
                  })}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.healthInsurance && (
                  <p className="mt-1 text-sm text-red-600">{errors.healthInsurance.message}</p>
                )}
              </div>
              
              {/* Employer PF */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employer PF Contribution (₹)
                </label>
                <input
                  type="number"
                  {...register('employerPF', { 
                    min: { value: 0, message: 'Amount must be positive' }
                  })}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.employerPF && (
                  <p className="mt-1 text-sm text-red-600">{errors.employerPF.message}</p>
                )}
              </div>
            </div>
            
            <div className="mt-8 flex justify-end gap-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2 disabled:opacity-50"
              >
                <FiSave />
                {isSubmitting ? 'Saving...' : 'Add Salary Record'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SalaryModal; 