'use client';

import React, { useState, useEffect } from 'react';

interface Page3Props {
  onNext: (data: Record<string, any>) => void;
  onPrevious: () => void;
  savedData?: Record<string, any>;
}

export default function Page3({ onNext, onPrevious, savedData }: Page3Props) {
  const [formData, setFormData] = useState({
    decorateCeremonySpace: savedData?.decorateCeremonySpace || '',
    aisleDecoration: savedData?.aisleDecoration || [],
    altarArchSetup: savedData?.altarArchSetup || [],
    seatingArrangement: savedData?.seatingArrangement || '',
    chairStylePreference: savedData?.chairStylePreference || [],
    ceremonyBackdropDesign: savedData?.ceremonyBackdropDesign || [],
    seenPreviousWork: savedData?.seenPreviousWork || '',
    specificDesignLink: savedData?.specificDesignLink || '',
    inspirationBoardLink: savedData?.inspirationBoardLink || '',
    otherEventsInspiration: savedData?.otherEventsInspiration || '',
  });

  useEffect(() => {
    if (savedData) {
      setFormData((prev) => ({ ...prev, ...savedData }));
    }
  }, [savedData]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleArrayItem = (
    field: 'aisleDecoration' | 'altarArchSetup' | 'chairStylePreference' | 'ceremonyBackdropDesign',
    item: string
  ) => {
    setFormData((prev) => {
      const currentList = (prev[field] as string[]) || [];
      const exists = currentList.includes(item);
      return {
        ...prev,
        [field]: exists ? currentList.filter((i) => i !== item) : [...currentList, item],
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext(formData);
  };

  return (
    <div className="min-h-screen bg-[#EFEFEF] text-black font-serif px-4 sm:px-8 py-6 flex flex-col justify-between" suppressHydrationWarning>
      <div className="max-w-6xl w-full mx-auto flex-1 flex flex-col justify-between">
        
        {/* Header Navigation */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-b sm:border-none border-gray-300 pb-4 sm:pb-0">
          <button
            type="button"
            onClick={onPrevious}
            className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-black uppercase tracking-wider font-sans cursor-pointer self-start sm:self-auto"
          >
            <span>&larr;</span> PREVIOUS PAGE
          </button>
          
          <div className="text-center sm:pr-28">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-wide">ABI&amp;Co.</h1>
            <p className="text-[10px] tracking-widest text-gray-800 mt-0.5 uppercase font-sans">NEW CLIENT FORM</p>
          </div>

          <div className="hidden sm:block" />
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between my-4 sm:my-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8 text-xs font-sans tracking-wider">
            
            {/* Left Column: VOW/CEREMONY DECOR */}
            <div className="space-y-4 lg:pr-4">
              <h2 className="text-base sm:text-lg font-serif font-bold tracking-wide border-b border-gray-300 pb-2 lg:border-none lg:pb-0">
                VOW/CEREMONY DECOR
              </h2>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
                <label className="uppercase font-serif text-xs sm:w-48 leading-tight shrink-0">
                  DECORATE CEREMONY SPACE:
                </label>
                <div className="flex-1 flex items-center gap-6 font-serif text-xs">
                  {['YES', 'NO'].map((option) => (
                    <label key={option} className="flex items-center gap-1.5 cursor-pointer uppercase">
                      <input
                        type="radio"
                        name="decorateCeremonySpace"
                        value={option}
                        checked={formData.decorateCeremonySpace === option}
                        onChange={(e) => handleInputChange('decorateCeremonySpace', e.target.value)}
                        className="w-3.5 h-3.5 border-gray-400 accent-black cursor-pointer shrink-0"
                      />
                      {option}
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-4 pt-1">
                <label className="uppercase font-serif text-xs sm:w-48 leading-tight shrink-0 pt-0.5">
                  AISLE DECORATION:
                </label>
                <div className="flex-1 grid grid-cols-2 gap-2 font-serif text-xs">
                  {[
                    'FLORAL ARRANGEMENT',
                    'LANTERNS',
                    'CANDLE',
                    'FABRIC',
                    'PETALS',
                    'RUNNERS',
                  ].map((item) => (
                    <label key={item} className="flex items-center gap-1.5 cursor-pointer uppercase shrink-0">
                      <input
                        type="checkbox"
                        checked={formData.aisleDecoration.includes(item)}
                        onChange={() => toggleArrayItem('aisleDecoration', item)}
                        className="w-3.5 h-3.5 border-gray-400 accent-black rounded-sm shrink-0"
                      />
                      {item}
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-4 pt-1">
                <label className="uppercase font-serif text-xs sm:w-48 leading-tight shrink-0 pt-0.5">
                  ALTAR/ARCH SETUP:
                </label>
                <div className="flex-1 grid grid-cols-2 gap-2 font-serif text-xs">
                  {[
                    'FLORAL ARCH',
                    'CANOPY',
                    'DRAPERY',
                    'GEOMETRIC FRAMES',
                    'TRADITIONAL',
                  ].map((item) => (
                    <label key={item} className="flex items-center gap-1.5 cursor-pointer uppercase shrink-0">
                      <input
                        type="checkbox"
                        checked={formData.altarArchSetup.includes(item)}
                        onChange={() => toggleArrayItem('altarArchSetup', item)}
                        className="w-3.5 h-3.5 border-gray-400 accent-black rounded-sm shrink-0"
                      />
                      {item}
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-4 pt-1">
                <label className="uppercase font-serif text-xs sm:w-48 leading-tight shrink-0 pt-0.5">
                  SEATING ARRANGEMENT:
                </label>
                <div className="flex-1 flex flex-col sm:flex-row sm:flex-wrap gap-2 font-serif text-xs">
                  {['TRADITIONAL ROWS', 'SEMI-CIRCULAR', 'CUSTOM LAYOUT'].map((option) => (
                    <label key={option} className="flex items-center gap-1.5 cursor-pointer uppercase shrink-0 sm:mr-2">
                      <input
                        type="radio"
                        name="seatingArrangement"
                        value={option}
                        checked={formData.seatingArrangement === option}
                        onChange={(e) => handleInputChange('seatingArrangement', e.target.value)}
                        className="w-3.5 h-3.5 border-gray-400 accent-black cursor-pointer shrink-0"
                      />
                      {option}
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-4 pt-1">
                <label className="uppercase font-serif text-xs sm:w-48 leading-tight shrink-0 pt-0.5">
                  CHAIR STYLE PREFERENCE:
                </label>
                <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-2 font-serif text-xs">
                  {[
                    'TRANSPARENT',
                    'NAPOLEON',
                    'CROSS-BACK',
                    'ACRYLIC',
                    'CHIVARI',
                    'CHAIR COVERS',
                  ].map((item) => (
                    <label key={item} className="flex items-center gap-1.5 cursor-pointer uppercase shrink-0">
                      <input
                        type="checkbox"
                        checked={formData.chairStylePreference.includes(item)}
                        onChange={() => toggleArrayItem('chairStylePreference', item)}
                        className="w-3.5 h-3.5 border-gray-400 accent-black rounded-sm shrink-0"
                      />
                      {item}
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-4 pt-1">
                <label className="uppercase font-serif text-xs sm:w-48 leading-tight shrink-0 pt-0.5">
                  CEREMONY BACKDROP DESIGN:
                </label>
                <div className="flex-1 grid grid-cols-2 gap-2 font-serif text-xs">
                  {[
                    'UNITY CANDLE TABLE',
                    'WELCOME SIGNS',
                    'FLORAL MARKERS',
                    'SIGNBOARD',
                  ].map((item) => (
                    <label key={item} className="flex items-center gap-1.5 cursor-pointer uppercase shrink-0">
                      <input
                        type="checkbox"
                        checked={formData.ceremonyBackdropDesign.includes(item)}
                        onChange={() => toggleArrayItem('ceremonyBackdropDesign', item)}
                        className="w-3.5 h-3.5 border-gray-400 accent-black rounded-sm shrink-0"
                      />
                      {item}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: INSPIRATION & PREVIOUS WORK */}
            <div className="space-y-4 lg:pl-4">
              <h2 className="text-base sm:text-lg font-serif font-bold tracking-wide border-b border-gray-300 pb-2 lg:border-none lg:pb-0">
                INSPIRATION &amp; PREVIOUS WORK
              </h2>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
                <label className="uppercase font-serif text-xs sm:w-48 leading-tight shrink-0">
                  HAVE YOU SEEN ANY PREVIOUS WORK THAT YOU LOVED?
                </label>
                <div className="flex-1 flex items-center gap-6 font-serif text-xs">
                  {['YES', 'NO'].map((option) => (
                    <label key={option} className="flex items-center gap-1.5 cursor-pointer uppercase">
                      <input
                        type="radio"
                        name="seenPreviousWork"
                        value={option}
                        checked={formData.seenPreviousWork === option}
                        onChange={(e) => handleInputChange('seenPreviousWork', e.target.value)}
                        className="w-3.5 h-3.5 border-gray-400 accent-black cursor-pointer shrink-0"
                      />
                      {option}
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 pt-1">
                <label className="uppercase font-serif text-xs sm:w-48 leading-tight shrink-0">
                  IF YES, PLEASE SPECIFY WHICH DESIGN (ATTACH A LINK OR PHOTO IF AVAILABLE)
                </label>
                <input
                  type="text"
                  placeholder="Paste URL or design details..."
                  value={formData.specificDesignLink}
                  onChange={(e) => handleInputChange('specificDesignLink', e.target.value)}
                  className="w-full sm:flex-1 bg-white border border-gray-400 rounded-full px-4 py-1.5 outline-none focus:border-black text-xs"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 pt-1">
                <label className="uppercase font-serif text-xs sm:w-48 leading-tight shrink-0">
                  ANY INSPIRATION BOARD / PINTEREST COLLECTION / SAVED PHOTOS TO REPRESENT YOUR VISION
                </label>
                <input
                  type="text"
                  placeholder="Paste Pinterest link or URL..."
                  value={formData.inspirationBoardLink}
                  onChange={(e) => handleInputChange('inspirationBoardLink', e.target.value)}
                  className="w-full sm:flex-1 bg-white border border-gray-400 rounded-full px-4 py-1.5 outline-none focus:border-black text-xs"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 pt-1">
                <label className="uppercase font-serif text-xs sm:w-48 leading-tight shrink-0">
                  ANY DECOR ELEMENTS FROM OTHER WEDDINGS OR EVENTS THAT INSPIRED YOU?
                </label>
                <input
                  type="text"
                  placeholder="Describe or paste image link..."
                  value={formData.otherEventsInspiration}
                  onChange={(e) => handleInputChange('otherEventsInspiration', e.target.value)}
                  className="w-full sm:flex-1 bg-white border border-gray-400 rounded-full px-4 py-1.5 outline-none focus:border-black text-xs"
                />
              </div>
            </div>

          </div>

          {/* Footer Controls */}
          <div className="relative mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-300">
            <span className="text-gray-500 text-xs font-serif italic tracking-wide order-2 sm:order-1 sm:absolute sm:inset-0 sm:flex sm:items-center sm:justify-center pointer-events-none">
              3 of 5 pages
            </span>
            <div className="w-full sm:w-auto flex justify-end order-1 sm:order-2 ml-auto">
              <button
                type="submit"
                className="w-full sm:w-auto bg-black text-white px-8 py-2.5 rounded-full text-[11px] font-sans font-medium tracking-widest uppercase hover:bg-zinc-800 transition shadow-sm cursor-pointer"
              >
                NEXT PAGE
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}