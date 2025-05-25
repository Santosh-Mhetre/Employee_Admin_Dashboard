// Employee type
export interface Employee {
  id: string;
  // Personal Details
  name: string;
  dateOfBirth?: string;
  employeeId?: string;
  isActive?: boolean;
  homeTown?: string;
  
  // Contact Information
  email: string;
  phone: string;
  currentAddress?: string;
  permanentAddress?: string;
  
  // Identification Documents
  aadharCard?: string;
  drivingLicense?: string;
  panCard?: string;
  voterID?: string;
  vanNo?: string;
  
  // Bank Details
  bankName?: string;
  accountNo?: string;
  ifscCode?: string;
  accountHolderName?: string;
  branchName?: string;
  
  // Educational Details
  // Higher Education
  graduation?: {
    degree?: string;
    branch?: string;
    month?: string;
    passingYear?: string;
    collegeName?: string;
    universityName?: string;
    marks?: string;
  };
  
  // 12th Standard
  twelthStandard?: {
    school?: string;
    branch?: string;
    month?: string;
    passingYear?: string;
    schoolName?: string;
    marks?: string;
  };
  
  // Other Education
  otherEducation?: {
    diploma?: string;
    branch?: string;
    month?: string;
    passingYear?: string;
    collegeName?: string;
    marks?: string;
  };
  
  // 10th Standard
  tenthStandard?: {
    school?: string;
    month?: string;
    passingYear?: string;
    schoolName?: string;
    marks?: string;
  };
  
  // Legacy fields (keeping for backward compatibility)
  position: string;
  department: string;
  joinDate: string;
  status: 'active' | 'inactive';
  imageUrl?: string;
  
  // Salary information for offer letter
  salary?: number;
}

// Employment type
export interface Employment {
  id: string;
  employeeId: string;
  
  // Employment Information
  employmentId?: string;
  joiningDate?: string;
  incrementDate?: string;
  contractType: 'full-time' | 'part-time' | 'contract';
  startDate: string;
  endDate?: string;
  ctc?: number;
  inHandCtc?: number;
  relievingCtc?: number;
  isPF?: boolean;
  isResignation?: boolean;
  
  // Salary Information
  salary: number;
  salaryId?: string;
  salaryCreditedAmount?: number;
  basic?: number;
  da?: number;
  hra?: number;
  pf?: number;
  medicalAllowance?: number;
  transport?: number;
  gratuity?: number;
  totalLeaves?: number;
  salaryCreditDate?: string;
  payableDays?: number;
  paymentMode?: string;
  additionalAllowance?: number;
  specialAllowance?: number;
  educationAllowance?: number;
  monthlyReimbursement?: number;
  lta?: number;
  statutoryBonus?: number;
  healthInsurance?: number;
  employerPF?: number;
  paymentFrequency: 'monthly' | 'bi-weekly' | 'weekly';
  
  // Job Details
  jobTitle?: string;
  designation?: string;
  department?: string;
  location?: string;
  jobMode?: 'remote' | 'onsite' | 'hybrid';
  reportingManager?: string;
  reportingAuthority?: string;
  employmentType?: string;
  workSchedule?: string;
  probationPeriod?: string;
  noticePeriod?: string;
  benefits: string[];
  
  // Resignation Details
  resignationDate?: string;
  lastWorkingDate?: string;
  reasonForLeaving?: string;
  exitInterviewDate?: string;
  
  // Appraisal Details
  appraisalDate?: string;
  previousSalary?: number;
  newSalary?: number;
  percentageIncrease?: number;
  performanceRating?: string;
  effectiveDate?: string;
}

// Salary Slip type
export interface SalarySlip {
  id: string;
  employeeId: string;
  employmentId: string;
  month: number;
  year: number;
  basicSalary: number;
  allowances: {
    type: string;
    amount: number;
  }[];
  deductions: {
    type: string;
    amount: number;
  }[];
  netSalary: number;
  grossSalary?: number;
  totalAllowances?: number;
  totalDeductions?: number;
  lossOfPay?: number;
  workingDays?: number;
  paidDays?: number;
  issueDate: string;
  paidDate?: string;
  status: 'draft' | 'issued' | 'paid';
  documentUrl?: string;
}

// Document types for document generation
export interface Document {
  id: string;
  employeeId: string;
  employmentId?: string;
  documentType: 'offer' | 'appointment' | 'relieving' | 'appraisal' | 'increment' | 'payslip';
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'issued' | 'signed';
  documentUrl?: string;
  data?: any;
}

// Company information for documents
export interface Company {
  id: string;
  name: string;
  address: string;
  mobile: string;
  email: string;
  website: string;
  cin: string;
  logo: string;
  hrName: string;
  hrMobile: string;
  color: string;
  gstin?: string;
  pan?: string;
  bankDetails?: {
    accountName: string;
    accountNumber: string;
    bankName: string;
    ifscCode: string;
    branch: string;
  };
  signatory?: {
    name: string;
    designation: string;
  };
} 