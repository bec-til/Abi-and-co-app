'use client';

import React, { useState, useRef, useEffect } from 'react';
import CalendarPicker from './CalendarPicker';

interface Page1Props {
  onNext: (data?: Record<string, any>) => void;
  savedData?: Record<string, any>;
}

const MONTH_NAMES = [
  'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
  'JUL', 'AUG', 'SEPT', 'OCT', 'NOV', 'DEC'
];

export default function Page1({ onNext, savedData = {} }: Page1Props) {
  const today = new Date();
  
  let initialYear = today.getFullYear();
  let initialMonth = today.getMonth();
  let initialDay = today.getDate();

  const savedDateStr = savedData.weddingDate || savedData.wedding_date || '';
  if (savedDateStr) {
    const parts = savedDateStr.split(' ');
    if (parts.length === 3) {
      const mIdx = MONTH_NAMES.indexOf(parts[0].toUpperCase());
      const dayNum = parseInt(parts[1], 10);
      const yearNum = parseInt(parts[2], 10);
      if (mIdx !== -1) initialMonth = mIdx;
      if (!isNaN(dayNum)) initialDay = dayNum;
      if (!isNaN(yearNum)) initialYear = yearNum;
    }
  }

  const [currentYear, setCurrentYear] = useState<number>(initialYear);
  const [currentMonthIndex, setCurrentMonthIndex] = useState<number>(initialMonth);
  const [selectedDay, setSelectedDay] = useState<number>(initialDay);
  const [isCalendarOpen, setIsCalendarOpen] = useState<boolean>(false);

  const calendarRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    brideName: savedData.brideName || '',
    groomName: savedData.groomName || '',
    contactInformation: savedData.contactInformation || '',
    emailAddress: savedData.emailAddress || '',
    dateFlexibility: savedData.dateFlexibility || 'NO',
    vowCeremony: savedData.vowCeremony || 'NO',
    vowDetails: savedData.vowDetails || '',
    receptionTime: savedData.receptionTime || '',
    venueNameAddress: savedData.venueNameAddress || '',
    venueContact: savedData.venueContact || '',
    eventLocationType: savedData.eventLocationType || 'INDOOR',
    venueRestrictions: savedData.venueRestrictions || '',
    venueThemeRequirements: savedData.venueThemeRequirements || '',
    weddingDate: savedDateStr || `${MONTH_NAMES[initialMonth]} ${initialDay} ${initialYear}`,
  });

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setIsCalendarOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePrevMonth = () => {
    if (currentMonthIndex === 0) {
      setCurrentMonthIndex(11);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonthIndex((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonthIndex === 11) {
      setCurrentMonthIndex(0);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonthIndex((prev) => prev + 1);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleDaySelect = (day: number) => {
    setSelectedDay(day);
    const updatedDateString = `${MONTH_NAMES[currentMonthIndex]} ${day} ${currentYear}`;
    setFormData((prev) => ({ ...prev, weddingDate: updatedDateString }));
    setIsCalendarOpen(false);
  };

  const formattedDateString = `${MONTH_NAMES[currentMonthIndex]} ${selectedDay} ${currentYear}`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalWeddingDate = `${MONTH_NAMES[currentMonthIndex]} ${selectedDay} ${currentYear}`;
    
    // Explicitly package weddingDate so parent and review page catch it immediately
    onNext({ 
      ...formData, 
      weddingDate: finalWeddingDate,
      wedding_date: finalWeddingDate 
    });
  };

  return (
    <div className="min-h-screen bg-[#EFEFEF] text-black font-serif px-6 py-6 flex flex-col justify-between">
      <div className="max-w-6xl w-full mx-auto flex-1 flex flex-col justify-between">
        
        {/* Header */}
        <div className="text-center pt-2">
          <h1 className="text-3xl font-bold tracking-wide">ABI&amp;Co.</h1>
          <p className="text-[10px] tracking-widest text-gray-800 mt-0.5 uppercase font-sans">
            NEW CLIENT FORM
          </p>
        </div>

        <h2 className="text-xl font-bold my-4 tracking-wide">
          General Details &amp; Client Information
        </h2>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-3 text-xs font-sans tracking-wider my-auto">
            
            {/* Left Column */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="uppercase font-serif font-normal text-xs w-40">BRIDE’S NAME:</label>
                <input
                  type="text"
                  value={formData.brideName}
                  onChange={(e) => handleInputChange('brideName', e.target.value)}
                  className="flex-1 bg-white border border-gray-400 rounded-full px-4 py-1.5 outline-none focus:border-black text-xs font-sans"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="uppercase font-serif font-normal text-xs w-40">GROOM’S NAME:</label>
                <input
                  type="text"
                  value={formData.groomName}
                  onChange={(e) => handleInputChange('groomName', e.target.value)}
                  className="flex-1 bg-white border border-gray-400 rounded-full px-4 py-1.5 outline-none focus:border-black text-xs font-sans"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="uppercase font-serif font-normal text-xs w-40">CONTACT INFORMATION:</label>
                <input
                  type="text"
                  value={formData.contactInformation}
                  onChange={(e) => handleInputChange('contactInformation', e.target.value)}
                  className="flex-1 bg-white border border-gray-400 rounded-full px-4 py-1.5 outline-none focus:border-black text-xs font-sans"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="uppercase font-serif font-normal text-xs w-40">EMAIL ADDRESS:</label>
                <input
                  type="email"
                  value={formData.emailAddress}
                  onChange={(e) => handleInputChange('emailAddress', e.target.value)}
                  className="flex-1 bg-white border border-gray-400 rounded-full px-4 py-1.5 outline-none focus:border-black text-xs font-sans"
                />
              </div>

              {/* Wedding Date Picker with Popup Toggle */}
              <div className="flex items-center justify-between relative" ref={calendarRef}>
                <label className="uppercase font-serif font-normal text-xs w-40">WEDDING DATE:</label>
                
                <div 
                  onClick={() => setIsCalendarOpen((prev) => !prev)}
                  className="flex-1 bg-white border border-gray-400 rounded-full px-4 py-1.5 text-xs font-sans cursor-pointer flex items-center justify-between shadow-sm"
                >
                  <span className="font-serif tracking-wider text-black">
                    {formattedDateString}
                  </span>
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest">Select Date ▾</span>
                </div>

                {isCalendarOpen && (
                  <div className="absolute right-0 top-10 z-50 mt-1 bg-white border border-gray-200 rounded-2xl shadow-2xl p-4 w-72">
                    <CalendarPicker
                      currentYear={currentYear}
                      currentMonthIndex={currentMonthIndex}
                      selectedDay={selectedDay}
                      setCurrentYear={setCurrentYear}
                      setCurrentMonthIndex={setCurrentMonthIndex}
                      setSelectedDay={handleDaySelect}
                      handlePrevMonth={handlePrevMonth}
                      handleNextMonth={handleNextMonth}
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="uppercase font-serif font-normal text-xs w-40">DATE FLEXIBILITY:</label>
                <div className="flex-1 flex items-center gap-6 font-serif text-xs">
                  {['YES', 'NO'].map((option) => (
                    <label key={option} className="flex items-center gap-1.5 cursor-pointer uppercase">
                      <input
                        type="radio"
                        name="dateFlexibility"
                        value={option}
                        checked={formData.dateFlexibility === option}
                        onChange={(e) => handleInputChange('dateFlexibility', e.target.value)}
                        className="w-3.5 h-3.5 accent-black cursor-pointer"
                      />
                      {option}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="uppercase font-serif font-normal text-xs w-48 leading-tight">
                  IS THERE A VOW<br />CEREMONY?
                </label>
                <div className="flex-1 flex items-center gap-6 font-serif text-xs">
                  {['YES', 'NO'].map((option) => (
                    <label key={option} className="flex items-center gap-1.5 cursor-pointer uppercase">
                      <input
                        type="radio"
                        name="vowCeremony"
                        value={option}
                        checked={formData.vowCeremony === option}
                        onChange={(e) => handleInputChange('vowCeremony', e.target.value)}
                        className="w-3.5 h-3.5 accent-black cursor-pointer"
                      />
                      {option}
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="uppercase font-serif font-normal text-xs w-48 leading-tight">
                  TIME AND PLACE OF VOW (IF YES):
                </label>
                <input
                  type="text"
                  value={formData.vowDetails}
                  onChange={(e) => handleInputChange('vowDetails', e.target.value)}
                  className="flex-1 bg-white border border-gray-400 rounded-full px-4 py-1.5 outline-none focus:border-black text-xs font-sans"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="uppercase font-serif font-normal text-xs w-48 leading-tight">
                  TIME OF RECEPTION:
                </label>
                <input
                  type="text"
                  value={formData.receptionTime}
                  onChange={(e) => handleInputChange('receptionTime', e.target.value)}
                  className="flex-1 bg-white border border-gray-400 rounded-full px-4 py-1.5 outline-none focus:border-black text-xs font-sans"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="uppercase font-serif font-normal text-xs w-48 leading-tight">
                  VENUE NAME &amp;<br />ADDRESS:
                </label>
                <input
                  type="text"
                  value={formData.venueNameAddress}
                  onChange={(e) => handleInputChange('venueNameAddress', e.target.value)}
                  className="flex-1 bg-white border border-gray-400 rounded-full px-4 py-1.5 outline-none focus:border-black text-xs font-sans"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="uppercase font-serif font-normal text-xs w-48 leading-tight">
                  VENUE CONTACT PERSON &amp; NUMBER:
                </label>
                <input
                  type="text"
                  value={formData.venueContact}
                  onChange={(e) => handleInputChange('venueContact', e.target.value)}
                  className="flex-1 bg-white border border-gray-400 rounded-full px-4 py-1.5 outline-none focus:border-black text-xs font-sans"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="uppercase font-serif font-normal text-xs w-48 leading-tight">
                  WILL THE EVENT TAKE PLACE:
                </label>
                <div className="flex-1 flex items-center gap-4 font-serif text-xs">
                  {['INDOOR', 'OUTDOOR', 'COMBINATION'].map((option) => (
                    <label key={option} className="flex items-center gap-1.5 cursor-pointer uppercase">
                      <input
                        type="radio"
                        name="eventLocationType"
                        value={option}
                        checked={formData.eventLocationType === option}
                        onChange={(e) => handleInputChange('eventLocationType', e.target.value)}
                        className="w-3.5 h-3.5 accent-black cursor-pointer"
                      />
                      {option}
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="uppercase font-serif font-normal text-xs w-48 leading-tight">
                  ARE THERE ANY VENUE/TIME RESTRICTION
                </label>
                <input
                  type="text"
                  value={formData.venueRestrictions}
                  onChange={(e) => handleInputChange('venueRestrictions', e.target.value)}
                  className="flex-1 bg-white border border-gray-400 rounded-full px-4 py-1.5 outline-none focus:border-black text-xs font-sans"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="uppercase font-serif font-normal text-xs w-48 leading-tight">
                  ARE THERE ANY SPECIFIC THEME REQUIRED BY THE VENUE
                </label>
                <input
                  type="text"
                  value={formData.venueThemeRequirements}
                  onChange={(e) => handleInputChange('venueThemeRequirements', e.target.value)}
                  className="flex-1 bg-white border border-gray-400 rounded-full px-4 py-1.5 outline-none focus:border-black text-xs font-sans"
                />
              </div>
            </div>

          </div>

          {/* Footer Navigation */}
          <div className="relative mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 pb-2 border-t border-gray-300">
            <div className="order-2 sm:order-1 sm:absolute sm:inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-gray-400 text-xs font-serif italic tracking-wide">
                1 of 5 pages
              </span>
            </div>

            <div className="hidden sm:block" />

            <button
              type="submit"
              className="order-1 sm:order-2 z-10 w-full sm:w-auto bg-black text-white px-8 py-2.5 rounded-full text-[11px] font-sans font-medium tracking-widest uppercase hover:bg-zinc-800 transition shadow-sm cursor-pointer text-center"
            >
              NEXT PAGE
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}