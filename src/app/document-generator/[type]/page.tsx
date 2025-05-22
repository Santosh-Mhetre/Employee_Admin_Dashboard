'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import DashboardLayout from '@/components/layout/DashboardLayout';

// Import the regular Home component since V2 version might not exist
const Home = dynamic(() => import('@/app/doc_pages/pages/Home'), { ssr: false });

// Import both V1 and V2 components
const ManageCompany = dynamic(() => import('@/app/doc_pages/pages/ManageCompany'), { ssr: false });

// V2 Document Components
const OfferLetterV2 = dynamic(() => import('@/app/doc_pages/pages/v2/OfferLetter'), { ssr: false });
const AppointmentLetterV2 = dynamic(() => import('@/app/doc_pages/pages/v2/AppointmentLetter'), { ssr: false });
const RelievingLetterV2 = dynamic(() => import('@/app/doc_pages/pages/v2/RelievingLetter'), { ssr: false });
const AppraisalLetterV2 = dynamic(() => import('@/app/doc_pages/pages/v2/AppraisalLetter'), { ssr: false });
const PaySlipGeneratorV2 = dynamic(() => import('@/app/doc_pages/pages/v2/PaySlipGenerator'), { ssr: false });
const BankStatementV2 = dynamic(() => import('@/app/doc_pages/pages/v2/BankStatement'), { ssr: false });
const ManageBankV2 = dynamic(() => import('@/app/doc_pages/pages/v2/ManageBank'), { ssr: false });

// Document generator wrapper component
const DocumentGeneratorPage = () => {
  const params = useParams();
  const fullPath = params.type as string;
  
  // Handle both direct paths and v2/ prefixed paths
  const docType = fullPath.startsWith('v2/') ? fullPath.replace('v2/', '') : fullPath;

  // Map document type to the appropriate component
  const renderDocumentComponent = () => {
    switch (docType) {
      case 'offer-letter':
        return <OfferLetterV2 />;
      case 'appointment-letter':
        return <AppointmentLetterV2 />;
      case 'relieving-letter':
        return <RelievingLetterV2 />;
      case 'appraisal-letter':
        return <AppraisalLetterV2 />;
      case 'payslip':
        return <PaySlipGeneratorV2 />;
      case 'bank-statement':
        return <BankStatementV2 />;
      case 'manage-bank':
        return <ManageBankV2 />;
      case 'manage-company':
        return <ManageCompany />;
      default:
        return <Home />;
    }
  };

  return (
    <DashboardLayout>
      <div className="document-generator-container p-4">
        {renderDocumentComponent()}
      </div>
    </DashboardLayout>
  );
};

export default DocumentGeneratorPage; 