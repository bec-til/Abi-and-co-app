'use client';

import React, { useState, useEffect } from 'react';

interface Page4Props {
  onNext: (data: Record<string, any>) => void;
  onPrevious: () => void;
  savedData?: Record<string, any>;
}

export default function Page4({ onNext, onPrevious, savedData }: Page4Props) {
  const [formData, setFormData] = useState({
    entranceDecor: savedData?.entranceDecor || [],
    stageSetupDesign: savedData?.stageSetupDesign || [],
    sweetheartTableOnStage: savedData?.sweetheartTableOnStage || '',
    ceilingDecoration: savedData?.ceilingDecoration || '',
    ceilingDecorationOptions: savedData?.ceilingDecorationOptions || [],
    preferredLighting: savedData?.preferredLighting || [],
    preferredChairStyles: savedData?.preferredChairStyles || [],
    preferredTableStyles: savedData?.preferredTableStyles || [],
    closeFamilySitting: savedData?.closeFamilySitting || [],
    loungeAreaForGuests: savedData?.loungeAreaForGuests || '',
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
    field:
      | 'entranceDecor'
      | 'stageSetupDesign'
      | 'ceilingDecorationOptions'
      | 'preferredLighting'
      | 'preferredChairStyles'
      | 'preferredTableStyles'
      | 'closeFamilySitting',
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

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between my-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 text-xs font-sans tracking-wider py-4">
            
            {/* Left Column: RECEPTION DECOR */}
            <div className="space-y-6">
              <h2 className="text-lg font-serif font-bold tracking-wide mb-3">RECEPTION DECOR</h2>

              <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
                <label className="uppercase font-serif text-xs sm:w-48 leading-tight pt-0.5 shrink-0">
                  ANY SPECIAL DECORATION FOR ENTRANCE?
                </label>
                <div className="flex-1 space-y-3 font-serif text-xs">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {['FLORAL ARCHES', 'DRAPERY', 'LANTERNS'].map((item) => (
                      <label key={item} className="flex items-center gap-1.5 cursor-pointer uppercase">
                        <input
                          type="checkbox"
                          checked={formData.entranceDecor.includes(item)}
                          onChange={() => toggleArrayItem('entranceDecor', item)}
                          className="w-3.5 h-3.5 border-gray-400 accent-black rounded-sm shrink-0"
                        />
                        <span>{item}</span>
                      </label>
                    ))}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {['PERSONALIZED SIGNAGES', 'WELCOME BOARDS'].map((item) => (
                      <label key={item} className="flex items-center gap-1.5 cursor-pointer uppercase">
                        <input
                          type="checkbox"
                          checked={formData.entranceDecor.includes(item)}
                          onChange={() => toggleArrayItem('entranceDecor', item)}
                          className="w-3.5 h-3.5 border-gray-400 accent-black rounded-sm shrink-0"
                        />
                        <span>{item}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
                <label className="uppercase font-serif text-xs sm:w-48 leading-tight pt-0.5 shrink-0">
                  WHAT IS YOUR PREFERRED STAGE SETUP DESIGN?
                </label>
                <div className="flex-1 space-y-3 font-serif text-xs">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      'FLORAL BACKDROP',
                      'LED PANELS',
                      'THEMATIC PROPS',
                    ].map((item) => (
                      <label key={item} className="flex items-center gap-1.5 cursor-pointer uppercase">
                        <input
                          type="checkbox"
                          checked={formData.stageSetupDesign.includes(item)}
                          onChange={() => toggleArrayItem('stageSetupDesign', item)}
                          className="w-3.5 h-3.5 border-gray-400 accent-black rounded-sm shrink-0"
                        />
                        <span>{item}</span>
                      </label>
                    ))}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      'DRAPED FABRICS',
                      'CHANDELIER CENTERPIECE',
                    ].map((item) => (
                      <label key={item} className="flex items-center gap-1.5 cursor-pointer uppercase">
                        <input
                          type="checkbox"
                          checked={formData.stageSetupDesign.includes(item)}
                          onChange={() => toggleArrayItem('stageSetupDesign', item)}
                          className="w-3.5 h-3.5 border-gray-400 accent-black rounded-sm shrink-0"
                        />
                        <span>{item}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <label className="uppercase font-serif text-xs sm:w-48 leading-tight shrink-0">
                  DO YOU NEED A SWEETHEART TABLE SEATING ON STAGE?
                </label>
                <div className="flex-1 flex items-center gap-6 font-serif text-xs">
                  {['YES', 'NO'].map((option) => (
                    <label key={option} className="flex items-center gap-1.5 cursor-pointer uppercase">
                      <input
                        type="radio"
                        name="sweetheartTableOnStage"
                        value={option}
                        checked={formData.sweetheartTableOnStage === option}
                        onChange={(e) => handleInputChange('sweetheartTableOnStage', e.target.value)}
                        className="w-3.5 h-3.5 border-gray-400 accent-black cursor-pointer shrink-0"
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <label className="uppercase font-serif text-xs sm:w-48 leading-tight shrink-0">
                  DO YOU WANT CEILING DECORATION?
                </label>
                <div className="flex-1 flex items-center gap-6 font-serif text-xs">
                  {['YES', 'NO'].map((option) => (
                    <label key={option} className="flex items-center gap-1.5 cursor-pointer uppercase">
                      <input
                        type="radio"
                        name="ceilingDecoration"
                        value={option}
                        checked={formData.ceilingDecoration === option}
                        onChange={(e) => handleInputChange('ceilingDecoration', e.target.value)}
                        className="w-3.5 h-3.5 border-gray-400 accent-black cursor-pointer shrink-0"
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
                <label className="uppercase font-serif text-xs sm:w-48 leading-tight pt-0.5 shrink-0">
                  IF YES, PLEASE CHOOSE:
                </label>
                <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-2 font-serif text-xs">
                  {[
                    'FLORAL INSTALLATION',
                    'FAIRY LIGHTS',
                    'HANGING LANTERNS',
                    'DRAPERY',
                    'CHANDELIER',
                    'GREENERY',
                    'CRYSTAL STRANDS',
                  ].map((item) => (
                    <label key={item} className="flex items-center gap-1.5 cursor-pointer uppercase">
                      <input
                        type="checkbox"
                        checked={formData.ceilingDecorationOptions.includes(item)}
                        onChange={() => toggleArrayItem('ceilingDecorationOptions', item)}
                        className="w-3.5 h-3.5 border-gray-400 accent-black rounded-sm shrink-0"
                      />
                      <span>{item}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: LIGHTING, FURNITURE & SEATING OPTIONS */}
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="uppercase font-serif text-xs block font-bold tracking-wide">
                  PREFERRED LIGHTING OPTION
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-serif text-xs">
                  {[
                    'LED STRING LIGHTS',
                    'CHANDELIERS',
                    'CANDLE/LANTERNS',
                    'UPLIGHTING',
                  ].map((item) => (
                    <label key={item} className="flex items-center gap-1.5 cursor-pointer uppercase">
                      <input
                        type="checkbox"
                        checked={formData.preferredLighting.includes(item)}
                        onChange={() => toggleArrayItem('preferredLighting', item)}
                        className="w-3.5 h-3.5 border-gray-400 accent-black rounded-sm shrink-0"
                      />
                      <span>{item}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="uppercase font-serif text-xs block font-bold tracking-wide">
                  PREFERRED CHAIR STYLES
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-serif text-xs">
                  {[
                    'TRANSPARENT',
                    'NAPOLEON',
                    'CROSS-BACK',
                    'ACRYLIC',
                    'CHIVARI',
                    'CHAIR COVERS',
                  ].map((item) => (
                    <label key={item} className="flex items-center gap-1.5 cursor-pointer uppercase">
                      <input
                        type="checkbox"
                        checked={formData.preferredChairStyles.includes(item)}
                        onChange={() => toggleArrayItem('preferredChairStyles', item)}
                        className="w-3.5 h-3.5 border-gray-400 accent-black rounded-sm shrink-0"
                      />
                      <span>{item}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="uppercase font-serif text-xs block font-bold tracking-wide">
                  PREFERRED TABLE STYLES
                </label>
                <div className="space-y-2 font-serif text-xs">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {['CIRCULAR', 'RECTANGULAR', 'SQUARE'].map((item) => (
                      <label key={item} className="flex items-center gap-1.5 cursor-pointer uppercase">
                        <input
                          type="checkbox"
                          checked={formData.preferredTableStyles.includes(item)}
                          onChange={() => toggleArrayItem('preferredTableStyles', item)}
                          className="w-3.5 h-3.5 border-gray-400 accent-black rounded-sm shrink-0"
                        />
                        <span>{item}</span>
                      </label>
                    ))}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {["KING'S TABLE", 'SWEETHEART TABLE'].map((item) => (
                      <label key={item} className="flex items-center gap-1.5 cursor-pointer uppercase">
                        <input
                          type="checkbox"
                          checked={formData.preferredTableStyles.includes(item)}
                          onChange={() => toggleArrayItem('preferredTableStyles', item)}
                          className="w-3.5 h-3.5 border-gray-400 accent-black rounded-sm shrink-0"
                        />
                        <span>{item}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="uppercase font-serif text-xs block font-bold tracking-wide">
                  CLOSE FAMILY SEATING
                </label>
                <div className="space-y-2 font-serif text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {['LOUNGE STYLE SETUP', 'CUSTOMIZED CHAIRS'].map((item) => (
                      <label key={item} className="flex items-center gap-1.5 cursor-pointer uppercase">
                        <input
                          type="checkbox"
                          checked={formData.closeFamilySitting.includes(item)}
                          onChange={() => toggleArrayItem('closeFamilySitting', item)}
                          className="w-3.5 h-3.5 border-gray-400 accent-black rounded-sm shrink-0"
                        />
                        <span>{item}</span>
                      </label>
                    ))}
                  </div>
                  <label className="flex items-center gap-1.5 cursor-pointer uppercase pt-0.5">
                    <input
                      type="checkbox"
                      checked={formData.closeFamilySitting.includes('SPECIAL FLORAL ARRANGEMENT')}
                      onChange={() => toggleArrayItem('closeFamilySitting', 'SPECIAL FLORAL ARRANGEMENT')}
                      className="w-3.5 h-3.5 border-gray-400 accent-black rounded-sm shrink-0"
                    />
                    <span>SPECIAL FLORAL ARRANGEMENT</span>
                  </label>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 pt-2">
                <label className="uppercase font-serif text-xs sm:w-48 leading-tight shrink-0">
                  LOUNGE AREA FOR GUESTS
                </label>
                <div className="flex-1 flex items-center gap-6 font-serif text-xs">
                  {['YES', 'NO'].map((option) => (
                    <label key={option} className="flex items-center gap-1.5 cursor-pointer uppercase">
                      <input
                        type="radio"
                        name="loungeAreaForGuests"
                        value={option}
                        checked={formData.loungeAreaForGuests === option}
                        onChange={(e) => handleInputChange('loungeAreaForGuests', e.target.value)}
                        className="w-3.5 h-3.5 border-gray-400 accent-black cursor-pointer shrink-0"
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

          </div>

         {/* Footer Navigation */}
<div className="relative mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 pb-2 border-t border-gray-300">
  <div className="order-2 sm:order-1 sm:absolute sm:inset-0 flex items-center justify-center pointer-events-none">
    <span className="text-gray-400 text-xs font-serif italic tracking-wide">
      4 of 5 pages
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