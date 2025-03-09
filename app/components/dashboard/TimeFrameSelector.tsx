'use client';

import { useState, useCallback } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, subWeeks, subMonths, subYears } from 'date-fns';

interface TimeFrameSelectorProps {
  onTimeFrameChange: (startDate: Date, endDate: Date) => void;
}

type PeriodOption = {
  label: string;
  getRange: () => { startDate: Date; endDate: Date };
};

export default function TimeFrameSelector({ onTimeFrameChange }: TimeFrameSelectorProps) {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    endDate: new Date()
  });
  const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null);
  const [isStartPickerOpen, setIsStartPickerOpen] = useState(false);
  const [isEndPickerOpen, setIsEndPickerOpen] = useState(false);

  const periodOptions: PeriodOption[] = [
    {
      label: 'All Data',
      getRange: () => ({
        startDate: new Date(0), // Will be adjusted to first available data point
        endDate: new Date()
      })
    },
    {
      label: 'This Week',
      getRange: () => ({
        startDate: startOfWeek(new Date(), { weekStartsOn: 1 }),
        endDate: new Date()
      })
    },
    {
      label: 'Last Week',
      getRange: () => ({
        startDate: startOfWeek(subWeeks(new Date(), 1), { weekStartsOn: 1 }),
        endDate: endOfWeek(subWeeks(new Date(), 1), { weekStartsOn: 1 })
      })
    },
    {
      label: 'This Month',
      getRange: () => ({
        startDate: startOfMonth(new Date()),
        endDate: new Date()
      })
    },
    {
      label: 'Last Month',
      getRange: () => ({
        startDate: startOfMonth(subMonths(new Date(), 1)),
        endDate: endOfMonth(subMonths(new Date(), 1))
      })
    },
    {
      label: 'This Year',
      getRange: () => ({
        startDate: startOfYear(new Date()),
        endDate: new Date()
      })
    },
    {
      label: 'Last Year',
      getRange: () => ({
        startDate: startOfYear(subYears(new Date(), 1)),
        endDate: endOfYear(subYears(new Date(), 1))
      })
    }
  ];

  const handleDateChange = useCallback((type: 'start' | 'end', date: Date | null) => {
    if (!date) return;

    setDateRange(prev => {
      let newRange = type === 'start' 
        ? { startDate: date, endDate: prev.endDate }
        : { startDate: prev.startDate, endDate: date };

      // Ensure end date is not before start date
      if (newRange.endDate < newRange.startDate) {
        newRange = type === 'start'
          ? { startDate: date, endDate: date }
          : { startDate: date, endDate: date };
      }

      // Ensure end date is not in the future
      if (newRange.endDate > new Date()) {
        newRange.endDate = new Date();
      }

      onTimeFrameChange(newRange.startDate, newRange.endDate);
      return newRange;
    });

    if (type === 'start') {
      setIsStartPickerOpen(false);
      setIsEndPickerOpen(true);
    } else {
      setIsEndPickerOpen(false);
    }
  }, [onTimeFrameChange]);

  const handlePeriodSelect = (option: PeriodOption) => {
    const range = option.getRange();
    setDateRange(range);
    setSelectedPeriod(option.label);
    onTimeFrameChange(range.startDate, range.endDate);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-1.5">
        {periodOptions.map((option, index) => (
          <button
            key={index}
            onClick={() => handlePeriodSelect(option)}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              selectedPeriod === option.label
                ? 'bg-black dark:bg-white text-white dark:text-black'
                : 'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Custom Range</h3>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Start Date</label>
            <DatePicker
              selected={dateRange.startDate}
              onChange={(date) => handleDateChange('start', date)}
              selectsStart
              startDate={dateRange.startDate}
              endDate={dateRange.endDate}
              maxDate={new Date()}
              dateFormat="MMM d, yyyy"
              placeholderText="Start"
              open={isStartPickerOpen}
              onInputClick={() => setIsStartPickerOpen(true)}
              onClickOutside={() => setIsStartPickerOpen(false)}
              className="w-full px-3 py-2 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-colors cursor-pointer"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">End Date</label>
            <DatePicker
              selected={dateRange.endDate}
              onChange={(date) => handleDateChange('end', date)}
              selectsEnd
              startDate={dateRange.startDate}
              endDate={dateRange.endDate}
              minDate={dateRange.startDate}
              maxDate={new Date()}
              dateFormat="MMM d, yyyy"
              placeholderText="End"
              open={isEndPickerOpen}
              onInputClick={() => setIsEndPickerOpen(true)}
              onClickOutside={() => setIsEndPickerOpen(false)}
              className="w-full px-3 py-2 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-colors cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
}