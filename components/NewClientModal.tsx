'use client';

import React, { useState, useEffect } from 'react';

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export interface ClientFormData {
  eventType?: string;
  clientName: string;
  contactInfo: string;
  emailAddress?: string;
  weddingDate?: string;
  vowCeremony?: 'YES' | 'NO';
  venueAddress: string;
  estimatedGuests?: string;
  statusOfClient?: string;
  paymentReceipt?: File | null;
  customerInvoice?: File | null;
  signedContract?: File | null;
  paymentReceiptFile?: File | null;
  customerInvoiceFile?: File | null;
  signedContractFile?: File | null;
  additionalNote?: string;
  totalPayment?: string;
  depositedAmount?: string;
  depositPercentage?: string;
  notes?: string;
}

interface NewClientModalProps {
  isOpen: boolean;
  initialData?: Partial<ClientFormData> | null;
  onClose: () => void;
  onSave?: (newClientData: ClientFormData) => void;
}

export default function NewClientModal({ isOpen, initialData, onClose, onSave }: NewClientModalProps) {
  const today = new Date();
  const currentStartYear = today.getFullYear();

  // Dynamic year list generation (up to 10 years out)
  const availableYears = Array.from({ length: 11 }, (_, i) => currentStartYear + i);

  // Form Field States
  const [eventType, setEventType] = useState<string>('WEDDING');
  const [clientName, setClientName] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [vowCeremony, setVowCeremony] = useState<'YES' | 'NO'>('NO');
  const [venueAddress, setVenueAddress] = useState('');
  const [estimatedGuests, setEstimatedGuests] = useState('');
  const [statusOfClient, setStatusOfClient] = useState('NEW');
  const [additionalNote, setAdditionalNote] = useState('');

  // Files
  const [paymentReceipt, setPaymentReceipt] = useState<File | null>(null);
  const [customerInvoice, setCustomerInvoice] = useState<File | null>(null);
  const [signedContract, setSignedContract] = useState<File | null>(null);

  // Functional Calendar State
  const [currentYear, setCurrentYear] = useState<number>(currentStartYear);
  const [currentMonthIndex, setCurrentMonthIndex] = useState<number>(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<number>(today.getDate());

  // Helper function to filter out raw JSON form strings from the note box
  const getCleanFormNote = (rawNotes: any) => {
    if (!rawNotes) return '';
    const trimmed = String(rawNotes).trim();
    
    if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
      try {
        const parsed = JSON.parse(trimmed);
        if (typeof parsed === 'object' && parsed !== null) {
          const userNote = parsed.notes || parsed.additionalNote || parsed.additional_note || parsed.finalNotes;
          if (userNote && !String(userNote).trim().startsWith('{')) {
            return String(userNote);
          }
        }
      } catch (e) {
        // invalid JSON
      }
      return ''; // Clear out raw JSON blob
    }
    
    return trimmed;
  };

  // Populate fields when initialData is provided (from Export) or reset when closed
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setEventType(initialData.eventType || 'WEDDING');
        setClientName(initialData.clientName || '');
        setContactInfo(initialData.contactInfo || '');
        setEmailAddress(initialData.emailAddress || '');
        setVowCeremony(initialData.vowCeremony || 'NO');
        setVenueAddress(initialData.venueAddress || '');
        setEstimatedGuests(initialData.estimatedGuests || '');
        setStatusOfClient(initialData.statusOfClient || 'NEW');
        
        // Use cleaner to strip JSON payloads
        const rawNoteVal = initialData.additionalNote || initialData.notes || '';
        setAdditionalNote(getCleanFormNote(rawNoteVal));

        // If a date string was passed, try to parse it or default to today
        if (initialData.weddingDate) {
          const parsedDate = new Date(initialData.weddingDate);
          if (!isNaN(parsedDate.getTime())) {
            setCurrentYear(parsedDate.getFullYear());
            setCurrentMonthIndex(parsedDate.getMonth());
            setSelectedDay(parsedDate.getDate());
          }
        }
      } else {
        // Fresh modal reset
        setEventType('WEDDING');
        setClientName('');
        setContactInfo('');
        setEmailAddress('');
        setVowCeremony('NO');
        setVenueAddress('');
        setEstimatedGuests('');
        setStatusOfClient('NEW');
        setAdditionalNote('');
        setPaymentReceipt(null);
        setCustomerInvoice(null);
        setSignedContract(null);
        setCurrentYear(currentStartYear);
        setCurrentMonthIndex(today.getMonth());
        setSelectedDay(today.getDate());
      }
    }
  }, [isOpen, initialData, currentStartYear]);

  if (!isOpen) return null;

  // Calendar Helper Functions
  const daysInMonth = new Date(currentYear, currentMonthIndex + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonthIndex, 1).getDay();

  const handleMonthChange = (newMonthIndex: number) => {
    setCurrentMonthIndex(newMonthIndex);
    const maxDaysInNewMonth = new Date(currentYear, newMonthIndex + 1, 0).getDate();
    if (selectedDay > maxDaysInNewMonth) {
      setSelectedDay(maxDaysInNewMonth);
    }
  };

  const handleYearChange = (newYear: number) => {
    setCurrentYear(newYear);
    const maxDaysInNewMonth = new Date(newYear, currentMonthIndex + 1, 0).getDate();
    if (selectedDay > maxDaysInNewMonth) {
      setSelectedDay(maxDaysInNewMonth);
    }
  };

  const handlePrevMonth = () => {
    if (currentMonthIndex === 0) {
      handleYearChange(currentYear - 1);
      handleMonthChange(11);
    } else {
      handleMonthChange(currentMonthIndex - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonthIndex === 11) {
      handleYearChange(currentYear + 1);
      handleMonthChange(0);
    } else {
      handleMonthChange(currentMonthIndex + 1);
    }
  };

  const formattedSelectedDate = `${MONTH_NAMES[currentMonthIndex].toUpperCase()} ${selectedDay} ${currentYear}`;

  // Helper for status badge color styling
  const getStatusColorClass = (status: string) => {
    switch (status) {
      case 'NEW':
        return 'bg-blue-100 text-blue-700';
      case 'BOOKED(PAID HALF)':
        return 'bg-yellow-100 text-yellow-800';
      case 'PAYED FULL':
        return 'bg-emerald-100 text-emerald-800';
      case 'ARCHIVED':
        return 'bg-gray-200 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: ClientFormData = {
      eventType,
      clientName,
      contactInfo,
      emailAddress,
      weddingDate: formattedSelectedDate,
      vowCeremony,
      venueAddress,
      estimatedGuests,
      statusOfClient,
      paymentReceipt,
      customerInvoice,
      signedContract,
      paymentReceiptFile: paymentReceipt,
      customerInvoiceFile: customerInvoice,
      signedContractFile: signedContract,
      additionalNote,
    };
    
    if (onSave) onSave(payload);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="bg-[#EFEFEF] text-black font-serif rounded-2xl p-6 sm:p-8 w-full max-w-5xl max-h-[92vh] overflow-y-auto relative shadow-2xl select-none">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          aria-label="Close modal"
          className="absolute top-4 right-5 text-gray-500 hover:text-black text-xl font-sans font-bold cursor-pointer transition-colors"
        >
          ✕
        </button>

        {/* Header */}
        <div className="text-center pt-1">
          <h1 id="modal-title" className="text-2xl sm:text-3xl font-bold tracking-wide">ABI&amp;Co.</h1>
          <p className="text-[10px] tracking-widest text-gray-800 mt-0.5 uppercase font-sans">
            NEW CLIENT FORM
          </p>
        </div>

        <h2 className="text-lg sm:text-xl font-bold my-3 tracking-wide">
          General Details &amp; Client Information
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-xs font-sans">
            
            {/* Left Column */}
            <div className="lg:col-span-5 space-y-4">
              
              {/* Event Type */}
              <div className="flex items-start gap-4">
                <label className="uppercase font-serif font-normal text-xs w-28 shrink-0 pt-0.5">
                  EVENT TYPE:
                </label>
                <div className="flex-1 space-y-2 font-serif text-xs">
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer uppercase">
                      <input
                        type="radio"
                        name="eventType"
                        value="WEDDING"
                        checked={eventType === 'WEDDING'}
                        onChange={() => setEventType('WEDDING')}
                        className="w-3.5 h-3.5 rounded-sm border-gray-400 accent-black cursor-pointer"
                      />
                      WEDDING
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer uppercase">
                      <input
                        type="radio"
                        name="eventType"
                        value="CORPORATE"
                        checked={eventType === 'CORPORATE'}
                        onChange={() => setEventType('CORPORATE')}
                        className="w-3.5 h-3.5 rounded-sm border-gray-400 accent-black cursor-pointer"
                      />
                      CORPORATE
                    </label>
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer uppercase">
                      <input
                        type="radio"
                        name="eventType"
                        value="SHIMGILINA"
                        checked={eventType === 'SHIMGILINA'}
                        onChange={() => setEventType('SHIMGILINA')}
                        className="w-3.5 h-3.5 rounded-sm border-gray-400 accent-black cursor-pointer"
                      />
                      SHIMGILINA
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer uppercase">
                      <input
                        type="radio"
                        name="eventType"
                        value="MELS"
                        checked={eventType === 'MELS'}
                        onChange={() => setEventType('MELS')}
                        className="w-3.5 h-3.5 rounded-sm border-gray-400 accent-black cursor-pointer"
                      />
                      MELS
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer uppercase">
                      <input
                        type="radio"
                        name="eventType"
                        value="OTHER"
                        checked={eventType === 'OTHER'}
                        onChange={() => setEventType('OTHER')}
                        className="w-3.5 h-3.5 rounded-sm border-gray-400 accent-black cursor-pointer"
                      />
                      OTHER
                    </label>
                  </div>
                </div>
              </div>

              {/* Client's Name */}
              <div className="flex items-center justify-between">
                <label className="uppercase font-serif font-normal text-xs w-28 shrink-0">CLIENT’S NAME:</label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="flex-1 bg-white border border-gray-400 rounded-full px-4 py-1.5 outline-none focus:border-black text-xs font-sans"
                />
              </div>

              {/* Contact Information */}
              <div className="flex items-center justify-between">
                <label className="uppercase font-serif font-normal text-xs w-28 shrink-0 leading-tight">
                  CONTACT<br />INFORMATION:
                </label>
                <input
                  type="text"
                  value={contactInfo}
                  onChange={(e) => setContactInfo(e.target.value)}
                  className="flex-1 bg-white border border-gray-400 rounded-full px-4 py-1.5 outline-none focus:border-black text-xs font-sans"
                />
              </div>

              {/* Email Address */}
              <div className="flex items-center justify-between">
                <label className="uppercase font-serif font-normal text-xs w-28 shrink-0">EMAIL ADDRESS:</label>
                <input
                  type="email"
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                  className="flex-1 bg-white border border-gray-400 rounded-full px-4 py-1.5 outline-none focus:border-black text-xs font-sans"
                />
              </div>

              {/* Wedding Date Section Stacked */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="uppercase font-serif font-normal text-xs shrink-0">
                    WEDDING DATE:
                  </label>
                  <span className="font-serif text-sm font-normal text-gray-500 tracking-wider">
                    {formattedSelectedDate}
                  </span>
                </div>

                {/* Calendar Card Container */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 w-full max-w-[280px] ml-auto font-sans">
                  <div className="flex items-center justify-between mb-3">
                    <button 
                      type="button" 
                      onClick={handlePrevMonth} 
                      className="text-gray-600 hover:text-black font-bold text-base px-1 cursor-pointer"
                      aria-label="Previous Month"
                    >
                      ‹
                    </button>
                    <div className="flex gap-2">
                      <select
                        value={MONTH_NAMES[currentMonthIndex]}
                        onChange={(e) => handleMonthChange(MONTH_NAMES.indexOf(e.target.value))}
                        className="bg-transparent border border-gray-200 rounded-md px-2 py-1 text-xs font-sans cursor-pointer outline-none"
                      >
                        {MONTH_NAMES.map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                      <select
                        value={currentYear}
                        onChange={(e) => handleYearChange(Number(e.target.value))}
                        className="bg-transparent border border-gray-200 rounded-md px-2 py-1 text-xs font-sans cursor-pointer outline-none"
                      >
                        {availableYears.map((y) => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                    </div>
                    <button 
                      type="button" 
                      onClick={handleNextMonth} 
                      className="text-gray-600 hover:text-black font-bold text-base px-1 cursor-pointer"
                      aria-label="Next Month"
                    >
                      ›
                    </button>
                  </div>

                  <div className="grid grid-cols-7 text-[11px] text-gray-400 text-center mb-2 font-medium">
                    <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
                  </div>

                  {/* Calendar Days Grid */}
                  <div className="grid grid-cols-7 text-xs gap-y-1.5 text-center font-sans">
                    {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                      <span key={`empty-${i}`} />
                    ))}

                    {Array.from({ length: daysInMonth }).map((_, i) => {
                      const dayNumber = i + 1;
                      const isSelected = selectedDay === dayNumber;

                      return (
                        <button
                          key={dayNumber}
                          type="button"
                          onClick={() => setSelectedDay(dayNumber)}
                          className={`mx-auto w-7 h-7 flex items-center justify-center rounded-lg transition-colors cursor-pointer ${
                            isSelected 
                              ? 'bg-[#2B2B2B] text-white font-semibold shadow-sm' 
                              : 'hover:bg-gray-100 text-gray-700'
                          }`}
                        >
                          {dayNumber}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Vow Ceremony */}
              <div className="flex items-center justify-between pt-2">
                <label className="uppercase font-serif font-normal text-xs w-28 shrink-0 leading-tight">
                  IS THERE A VOW<br />CEREMONY?
                </label>
                <div className="flex-1 flex items-center gap-6 font-serif text-xs">
                  <label className="flex items-center gap-2 cursor-pointer uppercase">
                    <input
                      type="radio"
                      name="vowCeremony"
                      value="YES"
                      checked={vowCeremony === 'YES'}
                      onChange={() => setVowCeremony('YES')}
                      className="w-3.5 h-3.5 rounded-sm border-gray-400 accent-black cursor-pointer"
                    />
                    YES
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer uppercase">
                    <input
                      type="radio"
                      name="vowCeremony"
                      value="NO"
                      checked={vowCeremony === 'NO'}
                      onChange={() => setVowCeremony('NO')}
                      className="w-3.5 h-3.5 rounded-sm border-gray-400 accent-black cursor-pointer"
                    />
                    NO
                  </label>
                </div>
              </div>

            </div>

            {/* Right Column */}
            <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Mid Fields & Files */}
              <div className="space-y-4">
                <div>
                  <label className="uppercase font-serif font-normal text-[11px] block mb-1">
                    VENUE NAME &amp; ADDRESS:
                  </label>
                  <input
                    type="text"
                    value={venueAddress}
                    onChange={(e) => setVenueAddress(e.target.value)}
                    className="w-full bg-white border border-gray-400 rounded-full px-4 py-1.5 outline-none focus:border-black text-xs font-sans"
                  />
                </div>

                <div>
                  <label className="uppercase font-serif font-normal text-[11px] block leading-tight mb-1">
                    ESTIMATED NUMBER OF GUESTS:
                  </label>
                  <input
                    type="text"
                    value={estimatedGuests}
                    onChange={(e) => setEstimatedGuests(e.target.value)}
                    className="w-full bg-white border border-gray-400 rounded-full px-4 py-1.5 outline-none focus:border-black text-xs font-sans"
                  />
                </div>

                {/* Status Badge Select */}
                <div>
                  <label className="uppercase font-serif font-normal text-[11px] block mb-1">
                    STATUS OF CLIENT:
                  </label>
                  <div className="relative inline-block w-full">
                    <select
                      value={statusOfClient}
                      onChange={(e) => setStatusOfClient(e.target.value)}
                      className={`w-full border-none font-bold font-sans text-xs uppercase px-4 py-2 rounded-full cursor-pointer appearance-none outline-none pr-8 transition-colors ${getStatusColorClass(
                        statusOfClient
                      )}`}
                    >
                      <option value="NEW" className="bg-white text-black font-normal">NEW</option>
                      <option value="BOOKED(PAID HALF)" className="bg-white text-black font-normal">BOOKED(PAID HALF)</option>
                      <option value="PAYED FULL" className="bg-white text-black font-normal">PAYED FULL</option>
                      <option value="ARCHIVED" className="bg-white text-black font-normal">ARCHIVED</option>
                    </select>
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-xs opacity-75">
                      ▼
                    </span>
                  </div>
                </div>

                {/* File Upload 1 */}
                <div className="pt-2">
                  <label className="font-serif text-xs font-normal block leading-tight mb-1">
                    Payment Screenshot / Receipt
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-sans">
                    <span className="flex items-center gap-1 font-bold uppercase text-[10px] tracking-wider">
                      ✏ CHOOSE FILE
                    </span>
                    <span className="text-gray-500 text-[11px] truncate">
                      {paymentReceipt ? paymentReceipt.name : 'No File Chosen'}
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => setPaymentReceipt(e.target.files?.[0] || null)}
                    />
                  </label>
                </div>

                {/* File Upload 2 */}
                <div>
                  <label className="font-serif text-xs font-normal block leading-tight mb-1 uppercase">
                    CUSTOMER INVOICE
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-sans">
                    <span className="flex items-center gap-1 font-bold uppercase text-[10px] tracking-wider">
                      ✏ CHOOSE FILE
                    </span>
                    <span className="text-gray-500 text-[11px] truncate">
                      {customerInvoice ? customerInvoice.name : 'No File Chosen'}
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => setCustomerInvoice(e.target.files?.[0] || null)}
                    />
                  </label>
                </div>

                {/* File Upload 3 */}
                <div>
                  <label className="font-serif text-xs font-normal block leading-tight mb-1">
                    Signed Agreement / Contract
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-sans">
                    <span className="flex items-center gap-1 font-bold uppercase text-[10px] tracking-wider">
                      ✏ CHOOSE FILE
                    </span>
                    <span className="text-gray-500 text-[11px] truncate">
                      {signedContract ? signedContract.name : 'No File Chosen'}
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => setSignedContract(e.target.files?.[0] || null)}
                    />
                  </label>
                </div>

              </div>

              {/* Additional Note Textarea */}
              <div className="flex flex-col">
                <label className="uppercase font-serif font-normal text-xs text-center mb-2">
                  ADDITIONAL NOTE
                </label>
                <textarea
                  value={additionalNote}
                  onChange={(e) => setAdditionalNote(e.target.value)}
                  className="flex-1 w-full bg-white border border-gray-400 rounded-xl p-3 outline-none focus:border-black text-xs font-sans resize-none min-h-[220px]"
                />
              </div>

            </div>

          </div>

          {/* Form Controls */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-300">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 text-black px-6 py-2.5 rounded-full text-[11px] font-sans font-medium tracking-widest uppercase hover:bg-gray-400 transition cursor-pointer"
            >
              CANCEL
            </button>
            <button
              type="submit"
              className="bg-black text-white px-8 py-2.5 rounded-full text-[11px] font-sans font-medium tracking-widest uppercase hover:bg-zinc-800 transition shadow-sm cursor-pointer"
            >
              SAVE CLIENT RECORD
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}