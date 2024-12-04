'use client';

import { format } from 'date-fns';

interface CompactDateRangeProps {
  startDate: Date;
  endDate: Date;
  onDateClick: () => void;
}

export default function CompactDateRange({ startDate, endDate, onDateClick }: CompactDateRangeProps) {
  return (
    <button 
      onClick={onDateClick}
      className="inline-flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-black rounded-lg border border-gray-100 dark:border-gray-900 hover:border-gray-200 dark:hover:border-gray-800 transition-colors"
    >
      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <span className="text-sm text-gray-600 dark:text-gray-400">
        {format(startDate, 'MMM d')} - {format(endDate, 'MMM d, yyyy')}
      </span>
    </button>
  );
}