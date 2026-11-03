'use client';

import React, { useState, useEffect } from 'react';

interface Page5Props {
  onNext: (data: Record<string, any>) => void;
  onPrevious: () => void;
  savedData?: Record<string, any>;
  loading?: boolean;
}

export default function Page5({ onNext, onPrevious, savedData, loading }: Page5Props) {
  const [formData, setFormData] = useState({
    requireDanceFloor: savedData?.requireDanceFloor || '',
    danceFloorType: savedData?.danceFloorType || [],
    overheadDanceFloorDecor: savedData?.overheadDanceFloorDecor || '',
    preferredCenterpieceType: savedData?.preferredCenterpieceType || [],
    preferredElements: savedData?.preferredElements || [],
    additionalDecorElements: savedData?.additionalDecorElements || [],
    estimatedBudget: savedData?.estimatedBudget || '',
    budgetConstraints: savedData?.budgetConstraints || '',
    finalNotes: savedData?.finalNotes || '',
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
    field: 'danceFloorType' | 'preferredCenterpieceType' | 'preferredElements' | 'additionalDecorElements',
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
    <div className="min-h-screen bg-[#EFEFEF] text-black font-serif px-4 sm:px-6 py-6 flex flex-col justify-between" suppressHydrationWarning>
      <div className="max-w-6xl w-full mx-auto flex-1 flex flex-col justify-between">
        
        {/* Header Navigation */}
        <div className="relative pt-2 pb-4 flex flex-col sm:block items-center">
          <button
            type="button"
            onClick={onPrevious}
            className="sm:absolute left-0 top-3 mb-4 sm:mb-0 flex items-center gap-1.5 text-xs text-gray-600 hover:text-black uppercase tracking-wider font-sans cursor-pointer self-start"
          >
            <span>&larr;</span> PREVIOUS PAGE
          </button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-wide">ABI&amp;Co.</h1>
            <p className="text-[10px] tracking-widest text-gray-800 mt-0.5 uppercase font-sans">NEW CLIENT FORM</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-6 text-xs font-sans tracking-wider my-auto py-4">
            
            {/* Left Column: DANCE FLOOR & CENTERPIECES */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <label className="uppercase font-serif text-xs sm:w-56 leading-tight shrink-0">
                  DO YOU REQUIRE DANCE FLOOR:
                </label>
                <div className="flex-1 flex items-center gap-6 font-serif text-xs">
                  {['YES', 'NO'].map((option) => (
                    <label key={option} className="flex items-center gap-1.5 cursor-pointer uppercase">
                      <input
                        type="radio"
                        name="requireDanceFloor"
                        value={option}
                        checked={formData.requireDanceFloor === option}
                        onChange={(e) => handleInputChange('requireDanceFloor', e.target.value)}
                        className="w-3.5 h-3.5 border-gray-400 accent-black cursor-pointer shrink-0"
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
                <label className="uppercase font-serif text-xs sm:w-56 leading-tight pt-0.5 shrink-0">
                  IF YES, PREFERRED TYPE:
                </label>
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2 font-serif text-xs">
                  {['PRINTED DESIGN', 'GLASS FLOOR'].map((item) => (
                    <label key={item} className="flex items-center gap-1.5 cursor-pointer uppercase">
                      <input
                        type="checkbox"
                        checked={formData.danceFloorType.includes(item)}
                        onChange={() => toggleArrayItem('danceFloorType', item)}
                        className="w-3.5 h-3.5 border-gray-400 accent-black rounded-sm shrink-0"
                      />
                      <span>{item}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <label className="uppercase font-serif text-xs sm:w-56 leading-tight shrink-0">
                  OVERHEAD DECORATION ABOVE THE DANCE FLOOR
                </label>
                <div className="flex-1 flex items-center gap-6 font-serif text-xs">
                  {['YES', 'NO'].map((option) => (
                    <label key={option} className="flex items-center gap-1.5 cursor-pointer uppercase">
                      <input
                        type="radio"
                        name="overheadDanceFloorDecor"
                        value={option}
                        checked={formData.overheadDanceFloorDecor === option}
                        onChange={(e) => handleInputChange('overheadDanceFloorDecor', e.target.value)}
                        className="w-3.5 h-3.5 border-gray-400 accent-black cursor-pointer shrink-0"
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <label className="uppercase font-serif text-xs block font-bold tracking-wide">
                  PREFERRED CENTERPIECE TYPE
                </label>
                <div className="space-y-2 font-serif text-xs">
                  {[
                    { label: 'TALL (DRAMATIC FLORAL ARRANGEMENT, CANDELABRAS)', val: 'TALL' },
                    { label: 'MEDIUM (BALANCED HEIGHT, SUITABLE FOR GUEST CONVERSATION)', val: 'MEDIUM' },
                    { label: 'SHORT/LOW (SINGLE, ELEGANT FLORAL ARRANGEMENT)', val: 'SHORT/LOW' },
                  ].map((item) => (
                    <label key={item.val} className="flex items-start gap-1.5 cursor-pointer uppercase">
                      <input
                        type="checkbox"
                        checked={formData.preferredCenterpieceType.includes(item.val)}
                        onChange={() => toggleArrayItem('preferredCenterpieceType', item.val)}
                        className="w-3.5 h-3.5 border-gray-400 accent-black rounded-sm shrink-0 mt-0.5"
                      />
                      <span className="leading-tight">{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <label className="uppercase font-serif text-xs block font-bold tracking-wide">
                  PREFERRED ELEMENTS
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-serif text-xs">
                  {[
                    'FRESH FLOWERS',
                    'GEOMETRIC TERRARIUM',
                    'CRYSTALS',
                    'CANDLES',
                    'LANTERNS',
                    'MIRRORS',
                  ].map((item) => (
                    <label key={item} className="flex items-center gap-1.5 cursor-pointer uppercase">
                      <input
                        type="checkbox"
                        checked={formData.preferredElements.includes(item)}
                        onChange={() => toggleArrayItem('preferredElements', item)}
                        className="w-3.5 h-3.5 border-gray-400 accent-black rounded-sm shrink-0"
                      />
                      <span>{item}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: ADDITIONAL DECOR & BUDGET */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="uppercase font-serif text-xs block font-bold tracking-wide">
                  ADDITIONAL DECOR ELEMENTS
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-serif text-xs">
                  {[
                    'PHOTOBOOTH',
                    'CAKE TABLE DECOR',
                    'FOG MACHINE',
                    'GIFT/CARD TABLE DECOR',
                    'SIGNAGE',
                    'COLD FIREWORKS',
                  ].map((item) => (
                    <label key={item} className="flex items-center gap-1.5 cursor-pointer uppercase">
                      <input
                        type="checkbox"
                        checked={formData.additionalDecorElements.includes(item)}
                        onChange={() => toggleArrayItem('additionalDecorElements', item)}
                        className="w-3.5 h-3.5 border-gray-400 accent-black rounded-sm shrink-0"
                      />
                      <span>{item}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="estimatedBudget" className="uppercase font-serif text-xs block leading-tight">
                  ESTIMATED BUDGET FOR WEDDING DECOR
                </label>
                <input
                  id="estimatedBudget"
                  type="text"
                  value={formData.estimatedBudget}
                  onChange={(e) => handleInputChange('estimatedBudget', e.target.value)}
                  className="w-full bg-white border border-gray-400 rounded-full px-4 py-1.5 outline-none focus:border-black text-xs font-sans"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="budgetConstraints" className="uppercase font-serif text-xs block leading-tight">
                  ARE THERE ANY BUDGET CONSTRAINTS OR PRIORITIES WE SHOULD BE AWARE OF?
                </label>
                <input
                  id="budgetConstraints"
                  type="text"
                  value={formData.budgetConstraints}
                  onChange={(e) => handleInputChange('budgetConstraints', e.target.value)}
                  className="w-full bg-white border border-gray-400 rounded-full px-4 py-1.5 outline-none focus:border-black text-xs font-sans"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="finalNotes" className="uppercase font-serif text-xs block leading-tight">
                  FINAL NOTES &amp; ADDITIONAL REQUESTS
                </label>
                <textarea
                  id="finalNotes"
                  rows={4}
                  value={formData.finalNotes}
                  onChange={(e) => handleInputChange('finalNotes', e.target.value)}
                  className="w-full bg-white border border-gray-400 rounded-2xl p-3 outline-none focus:border-black text-xs font-serif"
                />
              </div>
            </div>

          </div>

          {/* Footer Navigation */}
          <div className="relative mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 pb-2 border-t border-gray-300">
            <div className="order-2 sm:order-1 sm:absolute sm:inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-gray-400 text-xs font-serif italic tracking-wide">
                5 of 5 pages
              </span>
            </div>

            <div className="hidden sm:block" />

            <button
              type="submit"
              disabled={loading}
              className="order-1 sm:order-2 z-10 w-full sm:w-auto bg-black text-white px-8 py-2.5 rounded-full text-[11px] font-sans font-medium tracking-widest uppercase hover:bg-zinc-800 transition shadow-sm cursor-pointer disabled:opacity-50 text-center"
            >
              {loading ? 'SUBMITTING...' : 'FINISH'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}