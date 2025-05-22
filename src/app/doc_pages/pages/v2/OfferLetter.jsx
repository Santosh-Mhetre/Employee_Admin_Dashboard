'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiArrowLeft, FiDownload } from 'react-icons/fi';
import { 
  Document, 
  Page, 
  PDFDownloadLink, 
  PDFViewer,
  Text, 
  View, 
  Image,
  StyleSheet
} from '@react-pdf/renderer';
import { db } from '@/firebase/config';
import { collection, getDocs, query, where } from 'firebase/firestore';
import toast, { Toaster } from 'react-hot-toast';

// Import our custom PDF components and styles
import { 
  offerLetterStyles,
  commonStyles 
} from '@/components/pdf/PDFStyles';
import { 
  CompanyHeader, 
  LetterTitle,
  FormattedDate,
  Addressee,
  Paragraph,
  Signature,
  Footer,
  SalaryTable,
} from '@/components/pdf/PDFComponents';
import { 
  calculateSalaryComponentsV2,
  formatIndianCurrency,
  numberToWords
} from '@/components/pdf/SalaryUtils';

// Create watermark styles
const watermarkStyles = StyleSheet.create({
  watermarkContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  watermarkImage: {
    width: '70%',
    height: 'auto',
    opacity: 0.17,
  }
});

// Document style overrides to standardize font sizes
const documentStyles = StyleSheet.create({
  // Base text style with 12pt font
  text: {
    fontSize: 12,
    fontFamily: 'Calibri',
  },
  // Bold text with 12pt font
  boldText: {
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'Calibri',
  },
  // Section headers with 14pt font
  sectionHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'Calibri',
    textAlign: 'center',
    marginVertical: 8,
  },
  // Document title with 16pt font
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Calibri',
    textAlign: 'center',
    marginVertical: 10,
  },
  // Footer text with 10pt font
  footerText: {
    fontSize: 10,
    fontFamily: 'Calibri',
  },
  // Company name in header with 18pt font
  companyName: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Calibri',
    textTransform: 'uppercase',
  },
  // Address text with 10pt font
  addressText: {
    fontSize: 10,
    fontFamily: 'Calibri',
  },
  // Standard page styling
  page: {
    ...offerLetterStyles.page,
    fontSize: 12, // Update base font size
    paddingBottom: 60, // Add more padding at the bottom to prevent footer overlap
  }
});

// Watermark Component
const Watermark = ({ logoSrc }) => {
  // Only render if logo exists
  if (!logoSrc) return null;
  
  return (
    <View style={watermarkStyles.watermarkContainer}>
      <Image src={logoSrc} style={watermarkStyles.watermarkImage} />
    </View>
  );
};

// Offer Letter PDF Document Component
const OfferLetterPDF = ({ formData }) => {
  // Format salary values to ensure they display correctly
  const formatSalaryValues = () => {
    if (!formData.salaryComponentsV2) {
      // If no salary data available, return zeros 
      // This is just structural - not default values
      return [
        { label: 'Basic', value: '0.00' },
        { label: 'Dearness Allowance', value: '0.00' },
        { label: 'Conveyance Allowance', value: '0.00' },
        { label: 'Other Allowance', value: '0.00' },
        { total: '0.00' },
      ];
    }
    
    try {
      // Format with exact spacing and formatting as in current PDF
      // Use actual values from the employee record with no defaults
      return [
        {
          label: 'Basic',
          value: formatIndianCurrency(formData.salaryComponentsV2.annual.basic || 0),
        },
        {
          label: 'Dearness Allowance',
          value: formatIndianCurrency(formData.salaryComponentsV2.annual.dearnessAllowance || 0),
        },
        {
          label: 'Conveyance Allowance',
          value: formatIndianCurrency(formData.salaryComponentsV2.annual.conveyanceAllowance || 0),
        },
        {
          label: 'Other Allowance',
          value: formatIndianCurrency(formData.salaryComponentsV2.annual.otherAllowance || 0),
        },
        {
          total: formatIndianCurrency(formData.lpa ? formData.lpa * 100000 : 0),
        },
      ];
    } catch (error) {
      console.error("Error formatting salary values:", error);
      // Return zeros if there's an error, not defaults
      return [
        { label: 'Basic', value: '0.00' },
        { label: 'Dearness Allowance', value: '0.00' },
        { label: 'Conveyance Allowance', value: '0.00' },
        { label: 'Other Allowance', value: '0.00' },
        { total: '0.00' },
      ];
    }
  };

  return (
    <Document>
      {/* Page 1 - Joining Cum Appointment Letter */}
      <Page size="A4" style={documentStyles.page}>
        {/* Watermark */}
        <Watermark logoSrc={formData.companyLogo} />
        
        {/* Company Header */}
        <CompanyHeader 
          companyName={formData.companyName || 'COMPANY NAME'} 
          companyAddress={formData.companyAddressLine1 || 'COMPANY ADDRESS'} 
          companyPhone={formData.companyPhone || 'PHONE NUMBER'}
          companyWebsite={formData.companyWebsite || 'WEBSITE'}
          companyLogo={formData.companyLogo}
          companyColor={formData.companyColor || '#FF0000'}
        />
        
        {/* Letter Title */}
        <Text style={documentStyles.sectionHeader}>Joining Cum Appointment Letter</Text>
        
        {/* Letter Date */}
        <Text style={documentStyles.text}>Date: {new Date(formData.joiningDate || new Date()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</Text>
        
        {/* Addressee */}
        <View style={{ marginBottom: 8 }}>
          <Text style={documentStyles.text}>Dear {formData.employeeName || 'EMPLOYEE NAME'},</Text>
        </View>
        
        {/* Letter Content */}
        <View style={offerLetterStyles.letterContent}>
          <Text style={[documentStyles.text, {marginBottom: 6, textAlign: 'justify'}]}>
            We Pleased In Appointing You As {formData.designation || 'DESIGNATION'} In {formData.companyName || 'COMPANY NAME'}, 
            at Our Office In Our Organization, Effective From {formData.joiningDate ? new Date(formData.joiningDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'DD MMM YYYY'} On The Following Terms And Conditions:
          </Text>
          
          <Text style={[documentStyles.text, {marginBottom: 6, textAlign: 'justify'}]}>
            You will be placed in the appropriate responsibility level of the Company, and will be entitled to compensation (salary and other applicable benefits) as discussed. Compensation will be governed by the rules of the Company on the subject, as applicable and/or amended hereafter.
          </Text>
          
          <Text style={[documentStyles.text, {marginBottom: 6, textAlign: 'justify'}]}>
            You will be eligible to the benefits of the Company's Leave Rules on your confirmation in the Company's Service as discussed. During the period of your employment you will devote full time to the work of the Company. Further, you will not take any other employment or assignment or any office honorary or for any consideration in cash or in kind or otherwise, without the prior written permission of the Company.
          </Text>
          
          <Text style={[documentStyles.text, {marginBottom: 6, textAlign: 'justify'}]}>
            You will be on a Probation period for the Three months based on your performance. During the probation period your services can be terminated with seven day's notice on either side and without any reasons whatsoever. If your services are found satisfactory during the probation period, you will be confirmed in the present position and thereafter your services can be terminated on one month's notice on either side. The period of probation can be extended at the discretion of the Management and you will continue to be on probation till an order of confirmation has been issued in writing.
          </Text>
          
          <Text style={[documentStyles.text, {marginBottom: 6, textAlign: 'justify'}]}>
            {formData.lpa && formData.lpa > 0 ? (
              `Your salary package will be Rs. ${formatIndianCurrency(formData.lpa * 100000)}/- (${numberToWords(formData.lpa)} Lakh Rupees Only) and no other allowance is provided in that period.`
            ) : (
              `Your salary package will be as per company policy and no other allowance is provided in that period.`
            )}
          </Text>
        </View>
        
        {/* Footer */}
        <Footer
          companyName={formData.companyName || 'COMPANY NAME'}
          companyAddress={formData.companyAddressLine1 || 'COMPANY ADDRESS'}
          companyPhone={formData.companyPhone || 'PHONE NUMBER'}
          companyWebsite={formData.companyWebsite || 'WEBSITE'}
          companyColor={formData.companyColor || '#FF0000'}
        />
      </Page>

      {/* Page 2 - Split of Additional Terms and Salary Annexure to fit content properly */}
      <Page size="A4" style={documentStyles.page}>
        {/* Watermark */}
        <Watermark logoSrc={formData.companyLogo} />
        
        {/* Company Header */}
        <CompanyHeader 
          companyName={formData.companyName || 'COMPANY NAME'} 
          companyAddress={formData.companyAddressLine1 || 'COMPANY ADDRESS'}
          companyPhone={formData.companyPhone || 'PHONE NUMBER'}
          companyWebsite={formData.companyWebsite || 'WEBSITE'}
          companyLogo={formData.companyLogo}
          companyColor={formData.companyColor || '#FF0000'}
        />
        
        {/* Letter Title */}
        <Text style={documentStyles.sectionHeader}>Additional Terms</Text>
        
        {/* Letter Content */}
        <View style={offerLetterStyles.letterContent}>
          <Text style={[documentStyles.text, {marginBottom: 6, textAlign: 'justify'}]}>
            You will not disclose any of our technical or other important information which might come into your possession during the continuation of your service with us shall not be disclosed, divulged or made public by you even thereafter.
          </Text>
          
          <Text style={[documentStyles.text, {marginBottom: 6, textAlign: 'justify'}]}>
            If you conceive any new or advanced method of improving designs / processes / formulae / systems, etc. related to the interest / business of the Company, such developments will be fully communicated to the company and will be and will remain the sole right/property of the Company. Also includes Technology, Software packages license, Company's policy, Company's platform & Trade Mark and Company's human assets profile. Also the usage of personal USB Drives and CD-ROM's are strictly prohibited.
          </Text>
          
          <Text style={[documentStyles.text, {marginBottom: 6, textAlign: 'justify'}]}>
            If any declaration given or information furnished by you, to the Company proves to be false, or if you are found to have willfully suppressed any material information, in such cases you will be liable to removal from services without any notice.
          </Text>
          
          <Text style={[documentStyles.text, {marginBottom: 6, textAlign: 'justify'}]}>
            During the probationary period and any extension thereof, your service may be terminated on either side by giving one week's notice or salary in lieu thereof. Upon confirmation the services can be terminated from either side by giving one-month (30 Days) notice or salary in lieu thereof. Upon termination of employment you will immediately hand over to the Company all correspondence, specifications, formulae, books, documents, market data, cost data, drawings, affects or records belonging to the Company or relating to its business and shall not retain or make copies of these items.
          </Text>
          
          <Text style={[documentStyles.text, {marginBottom: 6, textAlign: 'justify'}]}>
            If at any time in our opinion which is final in this matter you are found non-performer or guilty of fraud, dishonest, disobedience, disorderly behavior, negligence, indiscipline, absence from duty without permission or any other conduct considered by us deterrent to our interest or of violation of one or more terms of this letter, your services may be terminated without notice.
          </Text>
        </View>
        
        {/* Footer */}
        <Footer
          companyName={formData.companyName || 'COMPANY NAME'}
          companyAddress={formData.companyAddressLine1 || 'COMPANY ADDRESS'}
          companyPhone={formData.companyPhone || 'PHONE NUMBER'}
          companyWebsite={formData.companyWebsite || 'WEBSITE'}
          companyColor={formData.companyColor || '#FF0000'}
        />
      </Page>

      {/* Page 3 - Continuation of Additional Terms and Salary Annexure */}
      <Page size="A4" style={documentStyles.page}>
        {/* Watermark */}
        <Watermark logoSrc={formData.companyLogo} />
        
        {/* Company Header */}
        <CompanyHeader 
          companyName={formData.companyName || 'COMPANY NAME'} 
          companyAddress={formData.companyAddressLine1 || 'COMPANY ADDRESS'}
          companyPhone={formData.companyPhone || 'PHONE NUMBER'}
          companyWebsite={formData.companyWebsite || 'WEBSITE'}
          companyLogo={formData.companyLogo}
          companyColor={formData.companyColor || '#FF0000'}
        />
        
        {/* Additional Terms Continuation */}
        <View style={{marginBottom: 10}}>
          <Text style={[documentStyles.text, {marginBottom: 6, textAlign: 'justify'}]}>
            You will be responsible for safekeeping and return in good condition and order of all Company property which may be in your use, custody or charge.
          </Text>
          
          <Text style={[documentStyles.text, {marginBottom: 6, textAlign: 'justify'}]}>
            All legal matters are subject to Pune Jurisdiction.
          </Text>
          
          <Text style={[documentStyles.text, {marginBottom: 6, textAlign: 'justify'}]}>
            Please confirm your acceptance of the appointment on the above terms and conditions by signing and returning this letter to us for our records.
          </Text>
          
          <Text style={[documentStyles.text, {marginBottom: 6, textAlign: 'justify'}]}>
            Enclosure:- Attaching herewith your salary annexure.
          </Text>
        </View>
        
        {/* Salary Annexure Section */}
        <View style={{marginTop: 10}}>
          <Text style={documentStyles.sectionHeader}>Salary Annexure</Text>
          
          {/* Date - Use current date instead of hardcoded value */}
          <Text style={documentStyles.text}>Date: {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</Text>
          
          {/* Addressee */}
          <View style={{ marginBottom: 8 }}>
            <Text style={documentStyles.text}>Dear {formData.employeeName || 'EMPLOYEE NAME'},</Text>
          </View>
          
          <Text style={[documentStyles.text, {marginBottom: 6, textAlign: 'justify'}]}>
            As per mentioned in the offer letter, here with attaching your salary structure which includes your Basic salary and other benefits received by you from the company.
          </Text>
          
          <Text style={[documentStyles.boldText, {marginTop: 8, marginBottom: 4}]}>
            Your salary structure as follows:
          </Text>
          
          {/* Salary Table with updated styles */}
          <View style={{width: '100%', marginVertical: 8}}>
            <Text style={[documentStyles.boldText, {marginBottom: 4}]}>Compensation Heads</Text>
            
            {formatSalaryValues().slice(0, -1).map((item, index) => (
              <View key={index} style={{flexDirection: 'row', justifyContent: 'space-between', borderBottom: '1pt solid #ddd', paddingVertical: 4}}>
                <Text style={{flex: 3, fontSize: 12, fontFamily: 'Calibri'}}>{item.label}</Text>
                <Text style={{flex: 2, textAlign: 'right', fontSize: 12, fontFamily: 'Calibri'}}>: Rs. {item.value}</Text>
              </View>
            ))}
            
            <View style={{flexDirection: 'row', justifyContent: 'space-between', marginTop: 4, borderTop: '2pt solid #000', borderBottom: '2pt solid #000', paddingVertical: 4, fontWeight: 'bold'}}>
              <Text style={{flex: 3, fontSize: 12, fontFamily: 'Calibri', fontWeight: 'bold'}}>Annual Total</Text>
              <Text style={{flex: 2, textAlign: 'right', fontSize: 12, fontFamily: 'Calibri', fontWeight: 'bold'}}>: Rs. {formatSalaryValues()[formatSalaryValues().length - 1].total}</Text>
            </View>
          </View>
          
          <Text style={[documentStyles.text, {marginBottom: 6, textAlign: 'justify'}]}>
            We expect you to keep up your performance in the years to come and grow with the organization and we will expect you will get happy and enthusiastic environment for work at the organization.
          </Text>
          
          <Text style={[documentStyles.text, {marginTop: 8}]}>Wish you all the best.</Text>
          
          {/* Signature */}
          <View style={{marginTop: 15}}>
            <Text style={documentStyles.text}>Signature</Text>
            <Text style={[documentStyles.text, {marginTop: 15}]}>Head - HR Dept</Text>
          </View>
        </View>
        
        {/* Footer */}
        <Footer
          companyName={formData.companyName || 'COMPANY NAME'}
          companyAddress={formData.companyAddressLine1 || 'COMPANY ADDRESS'}
          companyPhone={formData.companyPhone || 'PHONE NUMBER'}
          companyWebsite={formData.companyWebsite || 'WEBSITE'}
          companyColor={formData.companyColor || '#FF0000'}
        />
      </Page>
    </Document>
  );
};

// Main Component
function OfferLetterV2() {
  const [companies, setCompanies] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [employments, setEmployments] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    employeeName: "",
    joiningDate: "",
    designation: "",
    lpa: "",
    companyName: "",
    companyAddressLine1: "",
    companyColor: "",
    companyEmail: "",
    companyPhone: "",
    companyWebsite: "",
    companyLogo: ""
  });
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showPDF, setShowPDF] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        await fetchCompanies();
        await fetchCandidates();
      } catch (error) {
        console.error("Error fetching data:", error);
      }
      setIsLoading(false);
    };

    fetchData();
  }, []);

  const fetchCompanies = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'companies'));
      const companiesList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCompanies(companiesList);
    } catch (error) {
      console.error('Error fetching companies:', error);
      toast.error('Failed to load companies data');
    }
  };

  const fetchCandidates = async () => {
    try {
      // Try fetching from 'employees' collection
      const querySnapshot = await getDocs(collection(db, 'employees'));
      const employeesList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      console.log("Fetched Employees:", employeesList);
      setCandidates(employeesList);
      
      // Now fetch all employments for these employees
      const employmentData = {};
      for (const employee of employeesList) {
        try {
          // Query employments for this employee
          const q = query(collection(db, 'employments'), where('employeeId', '==', employee.id));
          const empSnapshot = await getDocs(q);
          
          if (!empSnapshot.empty) {
            // Get the most recent employment (usually there will be just one)
            const employmentsList = empSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
            // Sort by startDate (descending) to get the most recent employment first
            const sortedEmployments = employmentsList.sort((a, b) => {
              return new Date(b.startDate) - new Date(a.startDate);
            });
            
            employmentData[employee.id] = sortedEmployments[0];
            console.log(`Found employment for ${employee.name}:`, sortedEmployments[0]);
          } else {
            console.log(`No employment found for employee: ${employee.name}`);
          }
        } catch (err) {
          console.error(`Error fetching employment for employee ${employee.id}:`, err);
        }
      }
      
      setEmployments(employmentData);
      
      if (employeesList.length === 0) {
        console.warn("No employees found in the database. Please add employees in the admin dashboard first.");
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "company") {
      const selectedCompany = companies.find(company => company.name === value);
      if (selectedCompany) {
        setFormData(prev => ({
          ...prev,
          companyName: selectedCompany.name,
          companyAddressLine1: selectedCompany.address,
          companyColor: selectedCompany.serverColor,
          companyEmail: selectedCompany.email,
          companyPhone: selectedCompany.mobile,
          companyWebsite: selectedCompany.website,
          companyLogo: selectedCompany.logo
        }));
      }
    } else if (name === "employeeName") {
      const selectedEmployee = candidates.find(employee => employee.name === value);
      if (selectedEmployee) {
        console.log("Selected Employee:", selectedEmployee);
        
        // Get the employment details for this employee
        const employmentDetails = employments[selectedEmployee.id];
        console.log("Employment details:", employmentDetails);
        
        let employeeSalary;
        let joiningDate;
        let employeeDesignation;
        
        if (employmentDetails) {
          // If we have employment details, use those for salary, joining date, etc.
          employeeSalary = employmentDetails.salary || employmentDetails.ctc;
          joiningDate = employmentDetails.joiningDate || employmentDetails.startDate;
          employeeDesignation = employmentDetails.jobTitle || employmentDetails.designation;
        } else {
          // Fallback to employee record if no employment details
          employeeSalary = selectedEmployee.salary;
          joiningDate = selectedEmployee.joinDate;
          employeeDesignation = selectedEmployee.position || selectedEmployee.jobTitle;
        }
        
        // Calculate LPA from annual salary if it exists
        const employeeLPA = employeeSalary ? (employeeSalary / 100000) : 0;
        
        // Calculate salary components
        const salaryComponentsV2 = calculateSalaryComponentsV2(employeeLPA);
        
        setFormData(prev => ({
          ...prev,
          employeeName: selectedEmployee.name,
          designation: employeeDesignation || "",
          joiningDate: joiningDate || new Date().toISOString().split('T')[0],
          lpa: employeeLPA,
          salaryComponentsV2
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleGenerateDocument = () => {
    try {
      // Validate form
      if (!formData.employeeName || !formData.companyName || !formData.joiningDate || !formData.designation || !formData.lpa) {
        toast.error('Please fill all required fields');
        return;
      }
      
      // Format data for PDF
      const selectedCompany = companies.find(c => c.id === formData.companyName);
      setSelectedCompany(selectedCompany);
      
      // Generate the PDF
      setShowPDF(true);
      toast.success('Offer letter generated successfully!');
    } catch (error) {
      console.error('Error generating offer letter:', error);
      toast.error('Failed to generate offer letter');
    }
  };

  const handleDownloadSuccess = () => {
    toast.success('Offer letter downloaded successfully');
  };

  return (
    <div className="container mx-auto p-4">
      <Toaster position="top-center" />
      <div className="mb-4">
        <Link href="/dashboard/documents" className="text-blue-600 hover:underline flex items-center gap-1">
          <FiArrowLeft size={16} /> Back to Documents
        </Link>
      </div>

      {/* Form Section */}
      <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Enter Offer Letter Details</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="form-group">
            <label className="block mb-2 text-sm font-medium text-slate-800">Employee Name</label>
            <select
              name="employeeName"
              value={formData.employeeName}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Employee</option>
              {candidates.map(employee => (
                <option key={employee.id} value={employee.name}>{employee.name}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label className="block mb-2 text-sm font-medium text-slate-800">Company</label>
            <select
              name="company"
              value={formData.companyName}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Company</option>
              {companies.map(company => (
                <option key={company.id} value={company.name}>{company.name}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="mt-6">
          <button
            onClick={handleGenerateDocument}
            className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 shadow-lg hover:shadow-md transition-all duration-200"
          >
            <FiDownload size={18} className="mr-2" />
            <span>Generate Offer Letter</span>
          </button>
        </div>
      </div>
      
      {/* PDF Preview Section - only show when Generate button is clicked */}
      {showPDF && (
        <div className="bg-white rounded-lg shadow-lg p-4 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-800">PDF Preview</h3>
            
            <PDFDownloadLink
              document={
                <OfferLetterPDF 
                  formData={formData}
                />
              }
              fileName={`OfferLetter_${formData.employeeName || 'Employee'}.pdf`}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              onClick={handleDownloadSuccess}
            >
              {({ loading }) => (loading ? 'Loading document...' : 'Download PDF')}
            </PDFDownloadLink>
          </div>
          
          <div className="border rounded-lg" style={{ height: '80vh' }}>
            <PDFViewer width="100%" height="100%" className="rounded-lg">
              <OfferLetterPDF 
                formData={formData}
              />
            </PDFViewer>
          </div>
        </div>
      )}
    </div>
  );
}

export default OfferLetterV2; 