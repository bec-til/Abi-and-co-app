'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface ReviewPageProps {
  formData: Record<string, any>;
  onBackToEdit: () => void;
  onSubmit: () => void;
}

export default function ReviewPage({ formData = {}, onBackToEdit, onSubmit }: ReviewPageProps) {
  const [loading, setLoading] = useState(false);

  // 1. Bulletproof Resolvers (Checks root, nested states, and common variants)
  const d = formData || {};

  const brideName = 
    d.brideName || d.bride_name || d.bride?.name || d.page1?.brideName || d.page1?.bride_name || '';
  
  const groomName = 
    d.groomName || d.groom_name || d.groom?.name || d.page1?.groomName || d.page1?.groom_name || '';

  const clientName =
    brideName && groomName
      ? `${brideName} & ${groomName}`
      : brideName || groomName || d.clientName || d.client_name || 'Inquiry Submission';

  const contactInfo =
    d.contactInformation ||
    d.contactInfo ||
    d.contact_info ||
    d.phone ||
    d.phoneNumber ||
    d.page1?.contactInformation ||
    d.page1?.contactInfo ||
    '—';

  const emailAddress =
    d.emailAddress ||
    d.email_address ||
    d.email ||
    d.page1?.emailAddress ||
    d.page1?.email ||
    '—';

  const weddingDate =
    d.weddingDate ||
    d.wedding_date ||
    d.eventDate ||
    d.event_date ||
    d.selectedDate ||
    d.date ||
    d.weddingDetails?.weddingDate ||
    d.page1?.weddingDate ||
    '—';

  const estimatedGuests =
    d.estimatedGuests ||
    d.guestCount ||
    d.guest_count ||
    d.estimated_guests ||
    d.guests ||
    d.page2?.estimatedGuests ||
    d.page2?.guestCount ||
    '—';

  const bridalPartyCount =
    d.bridalPartyCount ||
    d.bridalParty ||
    d.bridal_party_count ||
    d.page2?.bridalPartyCount ||
    '—';

  const venueAddress =
    d.venueNameAddress ||
    d.venueAddress ||
    d.venue_address ||
    d.venue?.address ||
    d.page1?.venueNameAddress ||
    d.page1?.venueAddress ||
    '—';

  // 2. Safe Submitter using standard columns
  const handleSubmit = async () => {
    try {
      setLoading(true);

      const jsonDetails = JSON.stringify(d, null, 2);

      const payload = {
        client_name: clientName,
        bride_name: brideName,
        groom_name: groomName,
        contact_info: contactInfo !== '—' ? contactInfo : '',
        email: emailAddress !== '—' ? emailAddress : '',
        wedding_date: weddingDate !== '—' ? weddingDate : null,
        venue_address: venueAddress !== '—' ? venueAddress : '',
        guest_count: estimatedGuests !== '—' ? estimatedGuests : '',
        notes: jsonDetails,
      };

      const { error } = await supabase.from('inquiries').insert([payload]);

      if (error) throw error;

      alert('Inquiry submitted successfully!');
      onSubmit();
    } catch (err: any) {
      console.error('Failed to submit client inquiry:', err);
      alert('Failed to submit form: ' + (err.message || 'Database error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen bg-[#EFEFEF] text-black font-serif p-4 sm:p-6 flex flex-col justify-between overflow-hidden">
      <div className="max-w-4xl w-full mx-auto flex-1 flex flex-col justify-between min-h-0">
        
        {/* Document Container */}
        <div className="bg-white shadow-md border border-gray-300 rounded-sm p-6 sm:p-8 flex-1 flex flex-col justify-between min-h-0 my-auto text-xs font-sans tracking-wide">
          
          {/* Document Header */}
          <div className="text-center pb-4 border-b border-gray-300 font-serif shrink-0">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-wide">ABI&amp;Co.</h1>
            <p className="text-[10px] tracking-widest text-gray-700 mt-0.5 uppercase font-sans">
              CLIENT INQUIRY SUMMARY
            </p>
          </div>

          {/* Document Body Summary */}
          <div className="flex-1 my-auto flex flex-col justify-center space-y-4 py-2 overflow-y-auto">
            <h3 className="font-serif text-xs sm:text-sm font-bold uppercase tracking-wide border-b border-gray-200 pb-1 text-black shrink-0">
              General &amp; Event Details
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 font-sans text-xs">
              <div>
                <span className="font-semibold text-gray-600 block uppercase text-[10px] tracking-wider mb-0.5">BRIDE’S NAME:</span>
                <span className="text-black font-medium">{brideName || '—'}</span>
              </div>

              <div>
                <span className="font-semibold text-gray-600 block uppercase text-[10px] tracking-wider mb-0.5">GROOM’S NAME:</span>
                <span className="text-black font-medium">{groomName || '—'}</span>
              </div>

              <div>
                <span className="font-semibold text-gray-600 block uppercase text-[10px] tracking-wider mb-0.5">CONTACT INFORMATION:</span>
                <span className="text-black font-medium">{contactInfo}</span>
              </div>

              <div>
                <span className="font-semibold text-gray-600 block uppercase text-[10px] tracking-wider mb-0.5">EMAIL ADDRESS:</span>
                <span className="text-black font-medium">{emailAddress}</span>
              </div>

              <div>
                <span className="font-semibold text-gray-600 block uppercase text-[10px] tracking-wider mb-0.5">WEDDING DATE:</span>
                <span className="text-black font-medium">{weddingDate}</span>
              </div>

              <div>
                <span className="font-semibold text-gray-600 block uppercase text-[10px] tracking-wider mb-0.5">ESTIMATED NUMBER OF GUESTS:</span>
                <span className="text-black font-medium">{estimatedGuests}</span>
              </div>

              <div>
                <span className="font-semibold text-gray-600 block uppercase text-[10px] tracking-wider mb-0.5">NUMBER OF PEOPLE IN BRIDAL PARTY:</span>
                <span className="text-black font-medium">{bridalPartyCount}</span>
              </div>

              <div className="sm:col-span-2">
                <span className="font-semibold text-gray-600 block uppercase text-[10px] tracking-wider mb-0.5">VENUE NAME &amp; ADDRESS:</span>
                <span className="text-black font-medium">{venueAddress}</span>
              </div>
            </div>
          </div>

          {/* Document Footer Note */}
          <div className="pt-3 border-t border-gray-200 text-center font-serif text-[10px] sm:text-[11px] text-gray-500 italic shrink-0">
            Please review all information above before submitting. Once submitted, our team will review your inquiry and reach out shortly.
          </div>
        </div>

        {/* Form Controls / Navigation */}
        <div className="relative mt-4 flex items-center justify-between gap-4 shrink-0">
          <button
            type="button"
            onClick={onBackToEdit}
            disabled={loading}
            className="bg-transparent text-black border border-black px-8 py-2 rounded-full text-[11px] font-sans font-medium tracking-widest uppercase hover:bg-black hover:text-white transition shadow-sm cursor-pointer disabled:opacity-50"
          >
            EDIT FORM
          </button>

          <div className="text-center">
            <span className="text-gray-400 text-xs font-serif italic tracking-wide">
              {loading ? 'Submitting Inquiry...' : 'Review & Submit'}
            </span>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="bg-black text-white px-8 py-2 rounded-full text-[11px] font-sans font-medium tracking-widest uppercase hover:bg-zinc-800 transition shadow-sm cursor-pointer disabled:opacity-50"
          >
            {loading ? 'SUBMITTING...' : 'SUBMIT FORM'}
          </button>
        </div>

      </div>
    </div>
  );
}