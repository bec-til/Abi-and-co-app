'use client';

import React, { useState } from 'react';
import Page1 from './components/Page1';
import Page2 from './components/Page2';
import Page3 from './components/Page3';
import Page4 from './components/Page4';
import Page5 from './components/Page5';
import ReviewPage from './components/ReviewPage';

export default function InquiryPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);

  const handleNext = (pageData: any, ...rest: any[]) => {
    setFormData((prev) => ({ ...prev, ...pageData }));
    setCurrentPage((prev) => prev + 1);
  };

  const handlePrevious = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleFinalSubmit = async () => {
    setLoading(true);
    try {
      // Add your API submission call here using `formData`
      console.log('Submitting complete form:', formData);
      alert('Form submitted successfully!');
    } catch (error) {
      console.error('Submission failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#EFEFEF]">
      {currentPage === 1 && (
        <Page1 
          onNext={(data: any, date?: any) => handleNext({ ...data, weddingDate: date })}
          savedData={formData} 
        />
      )}
      {currentPage === 2 && (
        <Page2 
          onNext={handleNext} 
          onPrevious={handlePrevious} 
          savedData={formData} 
        />
      )}
      {currentPage === 3 && (
        <Page3 
          onNext={handleNext} 
          onPrevious={handlePrevious} 
          savedData={formData} 
        />
      )}
      {currentPage === 4 && (
        <Page4 
          onNext={handleNext} 
          onPrevious={handlePrevious} 
          savedData={formData} 
        />
      )}
      {currentPage === 5 && (
        <Page5 
          onNext={handleNext} 
          onPrevious={handlePrevious} 
          savedData={formData} 
        />
      )}
      {currentPage === 6 && (
        <ReviewPage 
          formData={formData}
          onBackToEdit={() => setCurrentPage(1)} 
          onSubmit={handleFinalSubmit}
        />
      )}
    </main>
  );
}