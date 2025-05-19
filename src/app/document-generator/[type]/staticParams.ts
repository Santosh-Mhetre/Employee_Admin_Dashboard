export async function generateStaticParams() {
  // Return document types for static export
  return [
    { type: 'offer-letter' },
    { type: 'appointment-letter' },
    { type: 'relieving-letter' },
    { type: 'payslip' },
    { type: 'increment-letter' },
    { type: 'appraisal-letter' },
    { type: 'manage-company' },
    { type: 'manage-student' },
    { type: 'home' },
    { type: 'v2/offer-letter' },
    { type: 'v2/appointment-letter' },
    { type: 'v2/relieving-letter' },
    { type: 'v2/appraisal-letter' },
    { type: 'v2/payslip' },
    { type: 'v2/bank-statement' },
    { type: 'v2/manage-bank' }
  ];
} 