'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import type { Workout } from '../types/database';

interface WorkoutSelectorProps {
  workouts: Workout[];
  selectedWorkout: Workout | null;
  onSelect: (workout: Workout | null) => void;
}

export default function WorkoutSelector({ workouts, selectedWorkout, onSelect }: WorkoutSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-900 rounded-lg hover:border-gray-200 dark:hover:border-gray-800 transition-colors text-left"
      >
        <div className="min-w-0">
          {selectedWorkout ? (
            <>
              <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {selectedWorkout.name}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {format(new Date(selectedWorkout.date), 'MMM d, yyyy')}
              </div>
            </>
          ) : (
            <span className="text-sm text-gray-500 dark:text-gray-400">Select a workout</span>
          )}
        </div>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-20 w-full mt-2 bg-white dark:bg-black border border-gray-100 dark:border-gray-900 rounded-lg shadow-lg">
            <div className="max-h-60 overflow-auto">
              {workouts.length === 0 ? (
                <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                  No workouts available
                </div>
              ) : (
                workouts.map((workout) => (
                  <button
                    key={workout.id}
                    onClick={() => {
                      onSelect(workout);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors ${
                      selectedWorkout?.id === workout.id ? 'bg-gray-50 dark:bg-gray-900/50' : ''
                    }`}
                  >
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {workout.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {format(new Date(workout.date), 'MMM d, yyyy')}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}