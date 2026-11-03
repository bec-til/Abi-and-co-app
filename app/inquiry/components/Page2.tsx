'use client';

import React, { useState } from 'react';

interface Page2Props {
  onNext: (data: Record<string, any>) => void;
  onPrevious: () => void;
  savedData?: Record<string, any>;
}

export default function Page2({ onNext, onPrevious, savedData }: Page2Props) {
  const [formData, setFormData] = useState({
    estimatedGuests: savedData?.estimatedGuests || '',
    bridalPartyCount: savedData?.bridalPartyCount || '',
    bridesmaidCount: savedData?.bridesmaidCount || '',
    groomsmenCount: savedData?.groomsmenCount || '',
    flowerRingCount: savedData?.flowerRingCount || '',
    hasFamilyArea: savedData?.hasFamilyArea || '',
    familyAreaTypes: savedData?.familyAreaTypes || ([] as string[]),
    hasVipGuests: savedData?.hasVipGuests || '',
    weddingThemes: savedData?.weddingThemes || ([] as string[]),
    colorPalette: savedData?.colorPalette || '',
    atmosphereOptions: savedData?.atmosphereOptions || ([] as string[]),
    culturalElements: savedData?.culturalElements || '',
    themesToAvoid: savedData?.themesToAvoid || '',
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCheckboxToggle = (field: 'familyAreaTypes' | 'weddingThemes' | 'atmosphereOptions', value: string) => {
    setFormData((prev) => {
      const current = prev[field] as string[];
      const updated = current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value];
      return { ...prev, [field]: updated };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext(formData);
  };

  const themeOptions = [
    'BOHO', 'CLASSIC', 'ROMANTIC',
    'MODERN', 'RUSTIC', 'FAIRYTALE',
    'MINIMALIST', 'VINTAGE', 'GARDEN', 'BEACH'
  ];

  const atmosphereList = ['ELEGANT', 'WHIMSICAL', 'COZY', 'GLAMOROUS', 'NATURAL'];

  return (
    <div className="min-h-screen bg-[#EFEFEF] text-black font-serif px-4 sm:px-10 py-6 flex flex-col justify-between" suppressHydrationWarning>
      <div className="max-w-7xl w-full mx-auto flex-1 flex flex-col justify-between">
        
        {/* Header Navigation */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-b sm:border-none border-gray-300 pb-4 sm:pb-0">
          <button
            type="button"
            onClick={onPrevious}
            className="flex items-center gap-2 text-xs font-sans tracking-widest text-gray-700 hover:text-black uppercase cursor-pointer self-start sm:self-auto"
          >
            <span className="text-sm">←</span> PREVIOUS PAGE
          </button>
          
          <div className="text-center sm:pr-28">
            <h1 className="text-2xl font-bold tracking-wide">ABI&amp;Co.</h1>
            <p className="text-[9px] tracking-widest text-gray-600 uppercase font-sans">NEW CLIENT FORM</p>
          </div>

          <div className="hidden sm:block" />
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between my-4 sm:my-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8 text-xs font-sans tracking-wider">
            
            {/* Left Column - Guest Information */}
            <div className="space-y-5 lg:pr-4">
              <h2 className="text-base font-bold tracking-wide uppercase font-serif border-b border-gray-300 pb-2 lg:border-none lg:pb-0">
                GUEST INFORMATION
              </h2>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
                <label className="uppercase font-serif font-normal text-xs sm:w-52 leading-tight shrink-0">
                  ESTIMATED NUMBER OF GUESTS:
                </label>
                <input
                  type="text"
                  value={formData.estimatedGuests}
                  onChange={(e) => handleInputChange('estimatedGuests', e.target.value)}
                  className="w-full sm:flex-1 bg-white border border-gray-300 rounded-full px-4 py-1.5 outline-none focus:border-black text-xs"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
                <label className="uppercase font-serif font-normal text-xs sm:w-52 leading-tight shrink-0">
                  NUMBER OF PEOPLE IN BRIDAL PARTY:
                </label>
                <input
                  type="text"
                  value={formData.bridalPartyCount}
                  onChange={(e) => handleInputChange('bridalPartyCount', e.target.value)}
                  className="w-full sm:flex-1 bg-white border border-gray-300 rounded-full px-4 py-1.5 outline-none focus:border-black text-xs"
                />
              </div>

              {/* Sub-split: Bridesmaid / Groomsmen */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 flex-1 min-w-[140px]">
                  <label className="uppercase font-serif font-normal text-xs leading-tight shrink-0">BRIDESMAID:</label>
                  <input
                    type="text"
                    value={formData.bridesmaidCount}
                    onChange={(e) => handleInputChange('bridesmaidCount', e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-full px-3 py-1 outline-none focus:border-black text-xs"
                  />
                </div>
                <div className="flex items-center gap-2 flex-1 min-w-[140px]">
                  <label className="uppercase font-serif font-normal text-xs leading-tight shrink-0">GROOMSMEN:</label>
                  <input
                    type="text"
                    value={formData.groomsmenCount}
                    onChange={(e) => handleInputChange('groomsmenCount', e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-full px-3 py-1 outline-none focus:border-black text-xs"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
                <label className="uppercase font-serif font-normal text-xs sm:w-52 leading-tight shrink-0">
                  FLOWER GIRLS / RING BEARER:
                </label>
                <input
                  type="text"
                  value={formData.flowerRingCount}
                  onChange={(e) => handleInputChange('flowerRingCount', e.target.value)}
                  className="w-full sm:flex-1 bg-white border border-gray-300 rounded-full px-4 py-1.5 outline-none focus:border-black text-xs"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 pt-1">
                <label className="uppercase font-serif font-normal text-xs sm:w-52 leading-tight shrink-0">
                  IS THERE A DESIGNATED AREA FOR FAMILY:
                </label>
                <div className="flex items-center gap-6 font-serif text-xs">
                  {['YES', 'NO'].map((opt) => (
                    <label key={opt} className="flex items-center gap-2 cursor-pointer uppercase">
                      <input
                        type="radio"
                        name="hasFamilyArea"
                        value={opt}
                        checked={formData.hasFamilyArea === opt}
                        onChange={(e) => handleInputChange('hasFamilyArea', e.target.value)}
                        className="w-3.5 h-3.5 accent-black cursor-pointer shrink-0"
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              </div>

              {/* Checkbox options for Family Area */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-4">
                <label className="uppercase font-serif font-normal text-xs sm:w-52 leading-tight shrink-0 pt-1">
                  IF YES, SPECIFY:
                </label>
                <div className="flex-1 space-y-2 font-serif text-xs">
                  <div className="flex flex-wrap items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer uppercase shrink-0">
                      <input
                        type="checkbox"
                        checked={formData.familyAreaTypes.includes('FAMILY LOUNGE')}
                        onChange={() => handleCheckboxToggle('familyAreaTypes', 'FAMILY LOUNGE')}
                        className="w-3.5 h-3.5 accent-black rounded-sm shrink-0"
                      />
                      FAMILY LOUNGE
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer uppercase shrink-0">
                      <input
                        type="checkbox"
                        checked={formData.familyAreaTypes.includes('SPECIAL DECOR')}
                        onChange={() => handleCheckboxToggle('familyAreaTypes', 'SPECIAL DECOR')}
                        className="w-3.5 h-3.5 accent-black rounded-sm shrink-0"
                      />
                      SPECIAL DECOR
                    </label>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer uppercase shrink-0">
                    <input
                      type="checkbox"
                      checked={formData.familyAreaTypes.includes('RESERVED TABLE')}
                      onChange={() => handleCheckboxToggle('familyAreaTypes', 'RESERVED TABLE')}
                      className="w-3.5 h-3.5 accent-black rounded-sm shrink-0"
                    />
                    RESERVED TABLE
                  </label>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 pt-2">
                <label className="uppercase font-serif font-normal text-xs sm:w-52 leading-tight shrink-0">
                  ARE THERE VIP GUESTS FOR PERSONALIZED ARRANGEMENT:
                </label>
                <div className="flex items-center gap-6 font-serif text-xs">
                  {['YES', 'NO'].map((opt) => (
                    <label key={opt} className="flex items-center gap-2 cursor-pointer uppercase">
                      <input
                        type="radio"
                        name="hasVipGuests"
                        value={opt}
                        checked={formData.hasVipGuests === opt}
                        onChange={(e) => handleInputChange('hasVipGuests', e.target.value)}
                        className="w-3.5 h-3.5 accent-black cursor-pointer shrink-0"
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Theme & Style */}
            <div className="space-y-5 lg:pl-4">
              <h2 className="text-base font-bold tracking-wide uppercase font-serif border-b border-gray-300 pb-2 lg:border-none lg:pb-0">
                WEDDING THEME &amp; PREFERRED STYLE
              </h2>

              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-4">
                <label className="uppercase font-serif font-normal text-xs sm:w-48 leading-tight shrink-0 pt-1">
                  DO YOU HAVE ANY SPECIFIC WEDDING THEME IN MIND?
                </label>
                <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-2 font-serif text-xs">
                  {themeOptions.map((theme) => (
                    <label key={theme} className="flex items-center gap-2 cursor-pointer uppercase shrink-0">
                      <input
                        type="checkbox"
                        checked={formData.weddingThemes.includes(theme)}
                        onChange={() => handleCheckboxToggle('weddingThemes', theme)}
                        className="w-3.5 h-3.5 accent-black rounded-sm shrink-0"
                      />
                      {theme}
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 pt-2">
                <label className="uppercase font-serif font-normal text-xs sm:w-48 leading-tight shrink-0">
                  PREFERRED COLOR PALETTE:
                </label>
                <input
                  type="text"
                  value={formData.colorPalette}
                  onChange={(e) => handleInputChange('colorPalette', e.target.value)}
                  className="w-full sm:flex-1 bg-white border border-gray-300 rounded-full px-4 py-1.5 outline-none focus:border-black text-xs"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-4 pt-2">
                <label className="uppercase font-serif font-normal text-xs sm:w-48 leading-tight shrink-0 pt-1">
                  MOOD/ATMOSPHERE YOU WANT TO CREATE:
                </label>
                <div className="flex-1 flex flex-wrap gap-x-6 gap-y-2 font-serif text-xs">
                  {atmosphereList.map((item) => (
                    <label key={item} className="flex items-center gap-2 cursor-pointer uppercase shrink-0">
                      <input
                        type="checkbox"
                        checked={formData.atmosphereOptions.includes(item)}
                        onChange={() => handleCheckboxToggle('atmosphereOptions', item)}
                        className="w-3.5 h-3.5 accent-black rounded-sm shrink-0"
                      />
                      {item}
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 pt-2">
                <label className="uppercase font-serif font-normal text-xs sm:w-48 leading-tight shrink-0">
                  ANY CULTURAL, RELIGIOUS, ELEMENTS YOU'D LIKE TO INCORPORATE:
                </label>
                <input
                  type="text"
                  value={formData.culturalElements}
                  onChange={(e) => handleInputChange('culturalElements', e.target.value)}
                  className="w-full sm:flex-1 bg-white border border-gray-300 rounded-full px-4 py-1.5 outline-none focus:border-black text-xs"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 pt-2">
                <label className="uppercase font-serif font-normal text-xs sm:w-48 leading-tight shrink-0">
                  ARE THERE ANY THEMES OR DECOR STYLES YOU'D PREFER TO AVOID?
                </label>
                <input
                  type="text"
                  value={formData.themesToAvoid}
                  onChange={(e) => handleInputChange('themesToAvoid', e.target.value)}
                  className="w-full sm:flex-1 bg-white border border-gray-300 rounded-full px-4 py-1.5 outline-none focus:border-black text-xs"
                />
              </div>
            </div>

          </div>

          {/* Footer Controls */}
          <div className="relative mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-300">
            <span className="text-gray-500 text-xs font-serif italic tracking-wide order-2 sm:order-1 sm:absolute sm:inset-0 sm:flex sm:items-center sm:justify-center pointer-events-none">
              2 of 5 pages
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