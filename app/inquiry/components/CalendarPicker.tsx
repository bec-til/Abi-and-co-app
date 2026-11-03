'use client';

import React from 'react';

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

interface CalendarPickerProps {
  currentYear: number;
  currentMonthIndex: number;
  selectedDay: number;
  setCurrentYear: (year: number) => void;
  setCurrentMonthIndex: (month: number) => void;
  setSelectedDay: (day: number) => void;
  handlePrevMonth: () => void;
  handleNextMonth: () => void;
}

export default function CalendarPicker({
  currentYear,
  currentMonthIndex,
  selectedDay,
  setCurrentYear,
  setCurrentMonthIndex,
  setSelectedDay,
  handlePrevMonth,
  handleNextMonth,
}: CalendarPickerProps) {
  const daysInMonth = new Date(currentYear, currentMonthIndex + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonthIndex, 1).getDay();

  return (
    <div className="flex-1 bg-white border border-gray-200 rounded-2xl p-3 shadow-sm max-w-[260px] text-center font-sans">
      {/* Controls Header */}
      <div className="flex items-center justify-between mb-2 text-xs text-gray-600">
        <button 
          type="button" 
          onClick={handlePrevMonth}
          className="text-gray-500 hover:text-black font-bold px-2 py-0.5 rounded hover:bg-gray-100"
        >
          &lt;
        </button>
        <div className="flex gap-1.5">
          <select 
            value={currentMonthIndex} 
            onChange={(e) => setCurrentMonthIndex(Number(e.target.value))}
            className="bg-gray-50 border border-gray-200 rounded px-1 py-0.5 outline-none text-[11px] cursor-pointer"
          >
            {MONTH_NAMES.map((m, idx) => (
              <option key={m} value={idx}>{m}</option>
            ))}
          </select>
          <select 
            value={currentYear} 
            onChange={(e) => setCurrentYear(Number(e.target.value))}
            className="bg-gray-50 border border-gray-200 rounded px-1 py-0.5 outline-none text-[11px] cursor-pointer"
          >
            {Array.from({ length: 6 }, (_, index) => {
              const year = new Date().getFullYear() + index;
              return (
                <option key={year} value={year}>
                  {year}
                </option>
              );
            })}
          </select>
        </div>
        <button 
          type="button" 
          onClick={handleNextMonth}
          className="text-gray-500 hover:text-black font-bold px-2 py-0.5 rounded hover:bg-gray-100"
        >
          &gt;
        </button>
      </div>

      {/* Weekday Labels */}
      <div className="grid grid-cols-7 text-[10px] text-gray-400 mb-1">
        <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1 text-[11px]">
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <span key={`empty-${i}`} className="p-1"></span>
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const dayNum = i + 1;
          const isSelected = selectedDay === dayNum;
          return (
            <button
              key={dayNum}
              type="button"
              onClick={() => setSelectedDay(dayNum)}
              className={`p-1 rounded-md transition-colors ${
                isSelected 
                  ? 'bg-black text-white font-bold' 
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              {dayNum}
            </button>
          );
        })}
      </div>
    </div>
  );
}